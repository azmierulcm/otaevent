"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";

import { submitRsvpAction } from "@/app/actions/customer";
import { ActionStatus } from "@/components/customer/action-status";
import { Button } from "@/components/ui/button";

export function RsvpForm({ eventId, slug }: { eventId: string; slug: string }) {
  const [state, formAction, isPending] = useActionState(submitRsvpAction, {
    status: "idle" as const,
    message: "",
  });

  return (
    <form action={formAction} className="space-y-4">
      <input name="event_id" type="hidden" value={eventId} />
      <input name="slug" type="hidden" value={slug} />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Name
          <input className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand" name="guest_name" placeholder="Your name" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Email
          <input className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand" name="guest_email" placeholder="you@example.com" type="email" />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_0.6fr]">
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          RSVP
          <select className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand" name="status">
            <option value="yes">Yes, I can attend</option>
            <option value="maybe">Maybe</option>
            <option value="no">No, I cannot attend</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Party size
          <input className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand" defaultValue="1" min="1" name="party_size" type="number" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-stone-700">
        Note
        <textarea className="min-h-24 rounded-xl border border-line px-4 py-3 outline-none focus:border-brand" name="note" placeholder="Dietary notes or anything the host should know" />
      </label>
      <ActionStatus state={state} />
      <Button disabled={isPending} type="submit">
        <Send className="size-4" />
        {isPending ? "Saving..." : "Send RSVP"}
      </Button>
    </form>
  );
}
