"use server";

import { createClient } from "@/lib/supabase/server";

export type BidMessage = {
  id: string;
  bid_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type MessageActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function getBidMessages(bidId: string): Promise<BidMessage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bid_messages")
    .select("id, bid_id, sender_id, body, created_at")
    .eq("bid_id", bidId)
    .order("created_at", { ascending: true });
  return (data ?? []) as BidMessage[];
}

export async function sendBidMessageAction(
  _prev: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  const bidId = String(formData.get("bid_id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!bidId || !body) {
    return { status: "error", message: "Message cannot be empty." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "Sign in to send messages." };

  const { error } = await supabase
    .from("bid_messages")
    .insert({ bid_id: bidId, sender_id: user.id, body });

  if (error) return { status: "error", message: error.message };

  return { status: "success", message: "" };
}
