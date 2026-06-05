"use client";

import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";

import { useToast } from "@/components/shared/toast";
import { createClient } from "@/lib/supabase/client";
import type { VendorBid } from "@/lib/vendor/demo-data";

interface VendorBidStreamProps {
  userId: string;
  initialBids: VendorBid[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-MY", {
    currency: "MYR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

const bidStatusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-emerald-50 text-emerald-700",
  declined: "bg-red-50 text-red-700",
  withdrawn: "bg-stone-100 text-stone-500",
};

const bidStatusLabels: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

export function VendorBidStream({ userId, initialBids }: VendorBidStreamProps) {
  const [bids, setBids] = useState<VendorBid[]>(initialBids);
  const { toast } = useToast();

  useEffect(() => {
    const supabase = createClient();

    // eq filter is supported by Supabase Realtime postgres_changes
    const channel = supabase
      .channel("vendor-bids")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bids",
          filter: `vendor_id=eq.${userId}`,
        },
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
            setBids((prev) => [
              {
                id: row.id,
                event_id: row.event_id,
                event_name: "Customer request",
                amount: row.amount,
                message: row.message,
                status: row.status as VendorBid["status"],
                created_at: row.created_at,
              },
              ...prev,
            ]);
            return;
          }

          if (payload.eventType === "UPDATE") {
            const row = payload.new as { id: string; status: string };
            setBids((prev) =>
              prev.map((bid) =>
                bid.id === row.id
                  ? { ...bid, status: row.status as VendorBid["status"] }
                  : bid,
              ),
            );
            if (row.status === "accepted") {
              toast({
                title: "Bid accepted!",
                description: "A customer has accepted your proposal.",
                variant: "success",
              });
            } else if (row.status === "declined") {
              toast({
                title: "Bid declined",
                description: "A customer has passed on your proposal.",
                variant: "info",
              });
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, toast]);

  if (bids.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
        <Inbox className="size-8 text-stone-300" />
        <p className="text-sm text-stone-500">
          No bids sent yet. Browse the job directory above.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-4">
      {bids.map((bid) => (
        <article className="rounded-2xl bg-surface-soft p-4" key={bid.id}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold tracking-normal">{bid.event_name}</h3>
              <p className="mt-1 text-sm leading-6 text-stone-600">{bid.message}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${bidStatusColors[bid.status] ?? "bg-stone-100 text-stone-500"}`}
            >
              {bidStatusLabels[bid.status] ?? bid.status}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-lg font-semibold">{formatCurrency(bid.amount)}</span>
            <span className="text-sm text-stone-500">{formatDate(bid.created_at)}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
