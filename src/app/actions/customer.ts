"use server";

import { createClient } from "@/lib/supabase/server";

export type CustomerActionState = {
  status: "idle" | "success" | "error";
  message: string;
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
  const services = formData.getAll("services").map((s) => String(s)).filter(Boolean);
  const budget = parsePositiveNumber(formData.get("budget"));
  const capacity = parsePositiveNumber(formData.get("capacity"));

  if (!name || !eventDate || services.length === 0 || budget <= 0 || capacity <= 0) {
    return { status: "error", message: "Add an event name, date, budget, guest count, and at least one service." };
  }

  if (capacity >= 100) {
    return { status: "error", message: "Otaevent supports events under 100 guests." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sign in before creating an event." };
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

  if (error) return { status: "error", message: error.message };

  return { status: "success", message: "Event request published. Vendors can now bid." };
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
  const statusRaw = String(formData.get("status") ?? "yes");

  if (!eventId || !guestName || !guestEmail) {
    return { status: "error", message: "Add your name and email to RSVP." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("rsvps").upsert(
    {
      event_id: eventId,
      guest_name: guestName,
      guest_email: guestEmail,
      party_size: partySize,
      status: statusRaw === "no" || statusRaw === "maybe" ? statusRaw : "yes",
      note: optionalString(formData.get("note")),
    },
    { onConflict: "event_id,guest_email" },
  );

  if (error) return { status: "error", message: error.message };

  return { status: "success", message: "RSVP saved. Thank you!" };
}

export async function claimRegistryItemAction(
  _previousState: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const itemId = optionalString(formData.get("item_id"));
  const claimedByName = optionalString(formData.get("claimed_by_name"));
  const claimedByEmail = optionalString(formData.get("claimed_by_email"));
  const currentClaimed = parsePositiveNumber(formData.get("claimed_quantity"), 0);

  if (!itemId || !claimedByName || !claimedByEmail) {
    return { status: "error", message: "Add your name and email to claim this item." };
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

  if (error) return { status: "error", message: error.message };

  return { status: "success", message: "Registry item claimed." };
}
