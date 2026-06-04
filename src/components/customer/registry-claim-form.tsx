"use client";

import { useActionState } from "react";
import { Gift } from "lucide-react";

import { claimRegistryItemAction } from "@/app/actions/customer";
import { ActionStatus } from "@/components/customer/action-status";
import { Button } from "@/components/ui/button";

export function RegistryClaimForm({
  itemId,
  slug,
  claimedQuantity,
  isComplete,
}: {
  itemId: string;
  slug: string;
  claimedQuantity: number;
  isComplete: boolean;
}) {
  const [state, formAction, isPending] = useActionState(claimRegistryItemAction, {
    status: "idle" as const,
    message: "",
  });

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input name="item_id" type="hidden" value={itemId} />
      <input name="slug" type="hidden" value={slug} />
      <input name="claimed_quantity" type="hidden" value={claimedQuantity} />
      <div className="grid gap-3 md:grid-cols-2">
        <input className="h-11 rounded-xl border border-line px-4 text-sm outline-none focus:border-brand" name="claimed_by_name" placeholder="Your name" />
        <input className="h-11 rounded-xl border border-line px-4 text-sm outline-none focus:border-brand" name="claimed_by_email" placeholder="Email" type="email" />
      </div>
      <ActionStatus state={state} />
      <Button disabled={isPending || isComplete} size="sm" type="submit" variant={isComplete ? "secondary" : "default"}>
        <Gift className="size-4" />
        {isComplete ? "Fully claimed" : isPending ? "Claiming..." : "Claim this"}
      </Button>
    </form>
  );
}
