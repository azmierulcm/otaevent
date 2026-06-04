"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { AppRole, EventStatus } from "@/lib/supabase/types";

export type OwnerActionState = {
  status: "idle" | "success" | "error";
  message: string;
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

async function requireOwner(): Promise<
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; userId: string }
  | { ok: false; error: OwnerActionState }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: { status: "error", message: "Not authenticated." } };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") {
    return { ok: false, error: { status: "error", message: "Owner access required." } };
  }

  return { ok: true, supabase, userId: user.id };
}

export async function saveArticleAction(
  _previousState: OwnerActionState,
  formData: FormData,
): Promise<OwnerActionState> {
  const title = optionalString(formData.get("title"));
  const bodyMd = optionalString(formData.get("body_md"));

  if (!title || !bodyMd) {
    return { status: "error", message: "Add an article title and body." };
  }

  const auth = await requireOwner();
  if (!auth.ok) return auth.error;

  const slug = optionalString(formData.get("slug")) ?? slugify(title);
  const status = String(formData.get("status")) === "published" ? "published" : "draft";

  const { error } = await auth.supabase.from("articles").upsert(
    {
      author_id: auth.userId,
      title,
      slug,
      excerpt: optionalString(formData.get("excerpt")),
      body_md: bodyMd,
      hero_image_path: optionalString(formData.get("hero_image_path")),
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    },
    { onConflict: "slug" },
  );

  if (error) return { status: "error", message: error.message };

  revalidatePath("/dashboard/owner");
  return { status: "success", message: "Article saved." };
}

export async function saveAdBlockAction(
  _previousState: OwnerActionState,
  formData: FormData,
): Promise<OwnerActionState> {
  const title = optionalString(formData.get("title"));
  const placement = optionalString(formData.get("placement"));

  if (!title || !placement) {
    return { status: "error", message: "Add an ad title and placement." };
  }

  const auth = await requireOwner();
  if (!auth.ok) return auth.error;

  const { error } = await auth.supabase.from("ad_blocks").insert({
    title,
    placement,
    image_path: optionalString(formData.get("image_path")),
    destination_url: optionalString(formData.get("destination_url")),
    is_active: formData.get("is_active") === "on",
    starts_at: optionalString(formData.get("starts_at")),
    ends_at: optionalString(formData.get("ends_at")),
  });

  if (error) return { status: "error", message: error.message };

  revalidatePath("/dashboard/owner");
  return { status: "success", message: "Ad block created." };
}

export async function updateUserRoleAction(
  _previousState: OwnerActionState,
  formData: FormData,
): Promise<OwnerActionState> {
  const userId = optionalString(formData.get("user_id"));
  if (!userId) return { status: "error", message: "Choose a user before updating a role." };

  const auth = await requireOwner();
  if (!auth.ok) return auth.error;

  const { error } = await auth.supabase
    .from("users")
    .update({ role: parseRole(formData.get("role")) })
    .eq("id", userId);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/dashboard/owner");
  return { status: "success", message: "User role updated." };
}

export async function verifyVendorAction(vendorId: string, isVerified: boolean) {
  const auth = await requireOwner();
  if (!auth.ok) return;

  await auth.supabase
    .from("vendor_profiles")
    .update({ is_verified: isVerified })
    .eq("id", vendorId);

  revalidatePath("/dashboard/owner");
}

export async function updateEventStatusAction(eventId: string, status: EventStatus) {
  const auth = await requireOwner();
  if (!auth.ok) return;

  await auth.supabase.from("events").update({ status }).eq("id", eventId);

  revalidatePath("/dashboard/owner");
}

export async function updateEventStatusFormAction(formData: FormData): Promise<void> {
  const eventId = String(formData.get("event_id") ?? "");
  const status = String(formData.get("status") ?? "") as EventStatus;
  if (!eventId) return;

  const auth = await requireOwner();
  if (!auth.ok) return;

  await auth.supabase.from("events").update({ status }).eq("id", eventId);
  revalidatePath("/dashboard/owner");
}

export async function deleteUserAction(userId: string) {
  const auth = await requireOwner();
  if (!auth.ok) return;

  await auth.supabase.from("users").delete().eq("id", userId);

  revalidatePath("/dashboard/owner");
}
