"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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

export function BidStream({ eventIds, initialBids }: BidStreamProps) {
  const [bids, setBids] = useState<CustomerBid[]>(initialBids);

  useEffect(() => {
    if (eventIds.length === 0) return;

    const supabase = createClient();

    const channel = supabase
      .channel("customer-bids")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bids",
          filter: `event_id=in.(${eventIds.join(",")})`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newBid = payload.new as CustomerBid & { vendor_id: string };
            setBids((prev) => [
              {
                id: newBid.id,
                event_id: newBid.event_id,
                vendor_name: "Vendor",
                amount: newBid.amount,
                message: newBid.message,
                status: newBid.status,
                created_at: newBid.created_at,
              },
              ...prev,
            ]);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as CustomerBid;
            setBids((prev) =>
              prev.map((bid) =>
                bid.id === updated.id ? { ...bid, status: updated.status } : bid,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventIds]);

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
            <div>
              <h3 className="font-semibold tracking-normal">{bid.vendor_name}</h3>
              <p className="mt-1 text-sm leading-6 text-stone-600">{bid.message}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusColors[bid.status] ?? "bg-stone-100 text-stone-500"}`}
            >
              {bid.status}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-lg font-semibold">{formatCurrency(bid.amount)}</span>
            <Button size="sm">
              <CheckCircle2 className="size-4" />
              Review
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
