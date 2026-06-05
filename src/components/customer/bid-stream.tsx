"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { acceptBid, declineBid } from "@/app/actions/customer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast";
import { createClient } from "@/lib/supabase/client";
import type { CustomerBid } from "@/lib/customer/demo-data";

interface BidStreamProps {
  eventIds: string[];
  initialBids: CustomerBid[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-MY", {
    currency: "MYR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-emerald-50 text-emerald-700",
  declined: "bg-red-50 text-red-700",
  withdrawn: "bg-stone-100 text-stone-500",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

export function BidStream({ eventIds, initialBids }: BidStreamProps) {
  const [bids, setBids] = useState<CustomerBid[]>(initialBids);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (eventIds.length === 0) return;

    const supabase = createClient();

    // Subscribe without a row filter — RLS on bids ensures only this
    // customer's bids are delivered. Client-side guard below is extra safety.
    const channel = supabase
      .channel("customer-bids")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bids" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as {
              id: string;
              event_id: string;
              amount: number;
              message: string | null;
              status: string;
              created_at: string;
            };
            if (!eventIds.includes(row.event_id)) return;

            setBids((prev) => [
              {
                id: row.id,
                event_id: row.event_id,
                vendor_name: "New vendor",
                amount: row.amount,
                message: row.message,
                status: row.status as CustomerBid["status"],
                created_at: row.created_at,
              },
              ...prev,
            ]);

            toast({
              title: "New bid received",
              description: `${formatCurrency(row.amount)} — review it below.`,
              variant: "info",
            });
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as { id: string; event_id: string; status: string };
            if (!eventIds.includes(row.event_id)) return;
            setBids((prev) =>
              prev.map((bid) =>
                bid.id === row.id
                  ? { ...bid, status: row.status as CustomerBid["status"] }
                  : bid,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventIds, toast]);

  function handleAccept(bidId: string) {
    startTransition(async () => {
      const snapshot = bids;
      setBids((prev) =>
        prev.map((b) =>
          b.id === bidId ? { ...b, status: "accepted" as const } : b,
        ),
      );
      const result = await acceptBid(bidId);
      if (result.status === "error") {
        setBids(snapshot);
        toast({ title: result.message, variant: "error" });
      } else {
        toast({ title: "Bid accepted!", variant: "success" });
      }
    });
  }

  function handleDecline(bidId: string) {
    startTransition(async () => {
      const snapshot = bids;
      setBids((prev) =>
        prev.map((b) =>
          b.id === bidId ? { ...b, status: "declined" as const } : b,
        ),
      );
      const result = await declineBid(bidId);
      if (result.status === "error") {
        setBids(snapshot);
        toast({ title: result.message, variant: "error" });
      }
    });
  }

  if (bids.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-stone-400">
        No bids yet — vendors will appear here when they respond.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {bids.map((bid) => (
        <article className="rounded-2xl bg-surface-soft p-4" key={bid.id}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold tracking-normal">{bid.vendor_name}</h3>
              <p className="mt-1 text-sm leading-6 text-stone-600">{bid.message}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusColors[bid.status] ?? "bg-stone-100 text-stone-500"}`}
            >
              {statusLabels[bid.status] ?? bid.status}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-lg font-semibold">{formatCurrency(bid.amount)}</span>
            {bid.status === "pending" ? (
              <div className="flex gap-2">
                <Button
                  disabled={isPending}
                  onClick={() => handleDecline(bid.id)}
                  size="sm"
                  variant="secondary"
                >
                  <XCircle className="size-4" />
                  Decline
                </Button>
                <Button
                  disabled={isPending}
                  onClick={() => handleAccept(bid.id)}
                  size="sm"
                >
                  <CheckCircle2 className="size-4" />
                  Accept
                </Button>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
