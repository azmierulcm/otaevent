"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";

import { submitBidAction } from "@/app/actions/vendor";
import { VendorActionStatus } from "@/components/vendor/vendor-action-status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function BidDialog({
  eventId,
  eventName,
  budget,
}: {
  eventId: string;
  eventName: string;
  budget: number;
}) {
  const [state, formAction, isPending] = useActionState(submitBidAction, {
    status: "idle" as const,
    message: "",
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Submit bid</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bid on {eventName}</DialogTitle>
          <DialogDescription>
            Send a concise proposal with your service scope and price.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="mt-5 space-y-4">
          <input name="event_id" type="hidden" value={eventId} />
          <label className="grid gap-2 text-sm font-semibold text-stone-700">
            Bid amount
            <input
              className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
              defaultValue={Math.round(budget * 0.25)}
              min="1"
              name="amount"
              type="number"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-stone-700">
            Proposal
            <textarea
              className="min-h-32 rounded-xl border border-line px-4 py-3 leading-7 outline-none focus:border-brand"
              defaultValue="We can support this event with a compact scope, clear setup window, and a polished guest-facing finish."
              name="message"
            />
          </label>
          <VendorActionStatus state={state} />
          <Button disabled={isPending} type="submit">
            <Send className="size-4" />
            {isPending ? "Submitting..." : "Send bid"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
