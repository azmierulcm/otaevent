"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type CustomerActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const demoSuccess = {
  status: "success" as const,
  message: "Saved in demo mode. Add Supabase credentials to persist this for real users.",
};

function optionalString(value: FormDataEntryValue | null) {
  const stringValue = String(value ?? "").trim();
  return stringValue.length > 0 ? stringValue : null;
}

function parsePositiveNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function createEventAction(
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const name = optionalString(formData.get("name"));
  const eventDate = optionalString(formData.get("event_date"));
  const services = formData
    .getAll("services")
    .map((service) => String(service))
    .filter(Boolean);
  const budget = parsePositiveNumber(formData.get("budget"));
  const capacity = parsePositiveNumber(formData.get("capacity"));

  if (!name || !eventDate || services.length === 0 || budget <= 0 || capacity <= 0) {
    return {
      status: "error",
      message: "Add an event name, date, budget, guest count, and at least one service.",
    };
  }

  if (capacity >= 100) {
    return {
      status: "error",
      message: "Otaevent currently supports events under 100 guests.",
    };
  }

  if (!isSupabaseConfigured()) {
    revalidatePath("/dashboard/customer");
    return demoSuccess;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Sign in as a customer before creating an event.",
    };
  }

  const { error } = await supabase.from("events").insert({
    customer_id: user.id,
    name,
    budget,
    services,
    event_date: eventDate,
    details: optionalString(formData.get("details")),
    capacity,
    location: optionalString(formData.get("location")),
    visibility: "shared",
    status: "open",
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath("/dashboard/customer");

  return {
    status: "success",
    message: "Event request created. Vendors can now send bids.",
  };
}

export async function submitRsvpAction(
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const eventId = optionalString(formData.get("event_id"));
  const slug = optionalString(formData.get("slug")) ?? "";
  const guestName = optionalString(formData.get("guest_name"));
  const guestEmail = optionalString(formData.get("guest_email"));
  const partySize = parsePositiveNumber(formData.get("party_size"), 1);
  const status = String(formData.get("status") ?? "yes");

  if (!eventId || !guestName || !guestEmail) {
    return {
      status: "error",
      message: "Add your name and email to RSVP.",
    };
  }

  if (!isSupabaseConfigured()) {
    revalidatePath(`/events/${slug}`);
    return demoSuccess;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("rsvps").upsert(
    {
      event_id: eventId,
      guest_name: guestName,
      guest_email: guestEmail,
      party_size: partySize,
      status: status === "no" || status === "maybe" ? status : "yes",
      note: optionalString(formData.get("note")),
    },
    {
      onConflict: "event_id,guest_email",
    },
  );

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath(`/events/${slug}`);

  return {
    status: "success",
    message: "RSVP saved. Thank you.",
  };
}

export async function claimRegistryItemAction(
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const itemId = optionalString(formData.get("item_id"));
  const slug = optionalString(formData.get("slug")) ?? "";
  const claimedByName = optionalString(formData.get("claimed_by_name"));
  const claimedByEmail = optionalString(formData.get("claimed_by_email"));
  const currentClaimed = parsePositiveNumber(formData.get("claimed_quantity"), 0);

  if (!itemId || !claimedByName || !claimedByEmail) {
    return {
      status: "error",
      message: "Add your name and email to claim a registry item.",
    };
  }

  if (!isSupabaseConfigured()) {
    revalidatePath(`/events/${slug}`);
    return demoSuccess;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("registry_items")
    .update({
      claimed_quantity: currentClaimed + 1,
      claimed_by_name: claimedByName,
      claimed_by_email: claimedByEmail,
    })
    .eq("id", itemId);

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath(`/events/${slug}`);

  return {
    status: "success",
    message: "Registry item claimed.",
  };
}
