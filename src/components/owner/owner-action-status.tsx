"use client";

import type { OwnerActionState } from "@/app/actions/owner";
import { cn } from "@/lib/utils";

export function OwnerActionStatus({ state }: { state: OwnerActionState }) {
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
