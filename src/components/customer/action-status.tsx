"use client";

import type { CustomerActionState } from "@/app/actions/customer";
import { cn } from "@/lib/utils";

export function ActionStatus({ state }: { state: CustomerActionState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-xl px-4 py-3 text-sm font-medium",
        state.status === "success"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700",
      )}
    >
      {state.message}
    </p>
  );
}
