"use server";

import { revalidatePath } from "next/cache";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type VendorActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const demoSuccess = {
  status: "success" as const,
  message: "Saved in demo mode. Add Supabase credentials to persist this for real vendors.",
};

function optionalString(value: FormDataEntryValue | null) {
  const stringValue = String(value ?? "").trim();
  return stringValue.length > 0 ? stringValue : null;
}

function parsePositiveNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function saveVendorProfileAction(
  _previousState: VendorActionState,
  formData: FormData,
): Promise<VendorActionState> {
  const businessName = optionalString(formData.get("business_name"));
  const serviceCategories = formData
    .getAll("service_categories")
    .map((item) => String(item))
    .filter(Boolean);
  const galleryImagePaths = formData
    .getAll("gallery_image_paths")
    .map((item) => String(item))
    .filter(Boolean);

  if (!businessName || serviceCategories.length === 0) {
    return {
      status: "error",
      message: "Add a business name and at least one service category.",
    };
  }

  if (!isSupabaseConfigured()) {
    revalidatePath("/dashboard/vendor");
    return demoSuccess;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Sign in as a vendor before updating your profile.",
    };
  }

  const { error } = await supabase.from("vendor_profiles").upsert(
    {
      user_id: user.id,
      business_name: businessName,
      tagline: optionalString(formData.get("tagline")),
      bio: optionalString(formData.get("bio")),
      base_location: optionalString(formData.get("base_location")),
      service_categories: serviceCategories,
      cover_image_path: optionalString(formData.get("cover_image_path")),
      gallery_image_paths: galleryImagePaths,
      price_floor: parsePositiveNumber(formData.get("price_floor"), 0),
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath("/dashboard/vendor");

  return {
    status: "success",
    message: "Vendor profile updated.",
  };
}

export async function submitBidAction(
  _previousState: VendorActionState,
  formData: FormData,
): Promise<VendorActionState> {
  const eventId = optionalString(formData.get("event_id"));
  const amount = parsePositiveNumber(formData.get("amount"));
  const message = optionalString(formData.get("message"));

  if (!eventId || amount <= 0 || !message) {
    return {
      status: "error",
      message: "Add a bid amount and a short proposal.",
    };
  }

  if (!isSupabaseConfigured()) {
    revalidatePath("/dashboard/vendor");
    return demoSuccess;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Sign in as a vendor before submitting a bid.",
    };
  }

  const { error } = await supabase.from("bids").upsert(
    {
      event_id: eventId,
      vendor_id: user.id,
      amount,
      message,
      status: "pending",
    },
    {
      onConflict: "event_id,vendor_id",
    },
  );

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath("/dashboard/vendor");

  return {
    status: "success",
    message: "Bid submitted to the customer.",
  };
}
