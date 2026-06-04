"use server";

import { revalidatePath } from "next/cache";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/supabase/types";

export type OwnerActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const demoSuccess = {
  status: "success" as const,
  message: "Saved in demo mode. Add Supabase credentials to persist owner changes.",
};

function optionalString(value: FormDataEntryValue | null) {
  const stringValue = String(value ?? "").trim();
  return stringValue.length > 0 ? stringValue : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseRole(value: FormDataEntryValue | null): AppRole {
  const role = String(value ?? "customer");
  return role === "vendor" || role === "owner" ? role : "customer";
}

export async function saveArticleAction(
  _previousState: OwnerActionState,
  formData: FormData,
): Promise<OwnerActionState> {
  const title = optionalString(formData.get("title"));
  const bodyMd = optionalString(formData.get("body_md"));

  if (!title || !bodyMd) {
    return {
      status: "error",
      message: "Add an article title and body.",
    };
  }

  const slug = optionalString(formData.get("slug")) ?? slugify(title);
  const status = String(formData.get("status")) === "published" ? "published" : "draft";

  if (!isSupabaseConfigured()) {
    revalidatePath("/dashboard/owner");
    return demoSuccess;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Sign in as a platform owner before publishing articles.",
    };
  }

  const { error } = await supabase.from("articles").upsert(
    {
      author_id: user.id,
      title,
      slug,
      excerpt: optionalString(formData.get("excerpt")),
      body_md: bodyMd,
      hero_image_path: optionalString(formData.get("hero_image_path")),
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    },
    {
      onConflict: "slug",
    },
  );

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath("/dashboard/owner");

  return {
    status: "success",
    message: "Article saved.",
  };
}

export async function saveAdBlockAction(
  _previousState: OwnerActionState,
  formData: FormData,
): Promise<OwnerActionState> {
  const title = optionalString(formData.get("title"));
  const placement = optionalString(formData.get("placement"));

  if (!title || !placement) {
    return {
      status: "error",
      message: "Add an ad title and placement.",
    };
  }

  if (!isSupabaseConfigured()) {
    revalidatePath("/dashboard/owner");
    return demoSuccess;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ad_blocks").insert({
    title,
    placement,
    image_path: optionalString(formData.get("image_path")),
    destination_url: optionalString(formData.get("destination_url")),
    is_active: formData.get("is_active") === "on",
    starts_at: optionalString(formData.get("starts_at")),
    ends_at: optionalString(formData.get("ends_at")),
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath("/dashboard/owner");

  return {
    status: "success",
    message: "Ad block created.",
  };
}

export async function updateUserRoleAction(
  _previousState: OwnerActionState,
  formData: FormData,
): Promise<OwnerActionState> {
  const userId = optionalString(formData.get("user_id"));

  if (!userId) {
    return {
      status: "error",
      message: "Choose a user before updating a role.",
    };
  }

  if (!isSupabaseConfigured()) {
    revalidatePath("/dashboard/owner");
    return demoSuccess;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({
      role: parseRole(formData.get("role")),
    })
    .eq("id", userId);

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath("/dashboard/owner");

  return {
    status: "success",
    message: "User role updated.",
  };
}
