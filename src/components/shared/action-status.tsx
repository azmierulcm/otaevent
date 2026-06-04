"use client";

import { cn } from "@/lib/utils";

export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export function ActionStatus({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;

  return (
    <p
      aria-live="polite"
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
