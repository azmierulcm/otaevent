"use client";

import { useActionState, useState } from "react";
import { Send } from "lucide-react";

import { submitRsvpAction } from "@/app/actions/customer";
import { ActionStatus } from "@/components/customer/action-status";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const attendanceOptions = [
  { value: "yes", label: "Yes, I'm coming" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "Can't make it" },
] as const;

const dietaryOptions = ["Halal", "Vegetarian", "Vegan", "Allergy / Other"];

export function RsvpForm({ eventId, slug }: { eventId: string; slug: string }) {
  const [state, formAction, isPending] = useActionState(submitRsvpAction, {
    status: "idle" as const,
    message: "",
  });
  const [attendance, setAttendance] = useState<"yes" | "maybe" | "no">("yes");

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-emerald-50 p-6 text-center">
        <p className="text-2xl">🎉</p>
        <p className="mt-3 font-semibold text-emerald-800">RSVP received!</p>
        <p className="mt-1 text-sm text-emerald-700">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input name="event_id" type="hidden" value={eventId} />
      <input name="slug" type="hidden" value={slug} />
      <input name="status" type="hidden" value={attendance} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Your name
          <input
            className="h-12 rounded-xl border border-line bg-white px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            name="guest_name"
            placeholder="Full name"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Email
          <input
            className="h-12 rounded-xl border border-line bg-white px-4 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            name="guest_email"
            placeholder="you@email.com"
            required
            type="email"
          />
        </label>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-semibold text-stone-700">Attendance</span>
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-surface-soft p-1.5">
          {attendanceOptions.map(({ value, label }) => (
            <button
              className={cn(
                "rounded-xl py-3 text-sm font-semibold transition",
                attendance === value
                  ? "bg-white text-stone-950 shadow-sm"
                  : "text-stone-500 hover:text-stone-700",
              )}
              key={value}
              onClick={() => setAttendance(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-stone-700">
        Guests coming with you
        <select
          className="h-12 rounded-xl border border-line bg-white px-4 outline-none transition focus:border-brand"
          name="party_size"
          defaultValue="1"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n === 1 ? "Just me" : `${n} people (including me)`}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-2">
        <span className="text-sm font-semibold text-stone-700">Dietary requirements</span>
        <div className="grid grid-cols-2 gap-2">
          {dietaryOptions.map((option) => (
            <label
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300 has-[:checked]:border-brand has-[:checked]:bg-rose-50 has-[:checked]:text-brand"
              key={option}
            >
              <input
                className="accent-brand"
                name="dietary"
                type="checkbox"
                value={option}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-stone-700">
        Notes (optional)
        <textarea
          className="min-h-24 rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          name="note"
          placeholder="Allergies, late arrival, anything the host should know…"
        />
      </label>

      <ActionStatus state={state} />

      <Button className="w-full" disabled={isPending} size="lg" type="submit">
        <Send className="size-4" />
        {isPending ? "Sending RSVP…" : "Send RSVP"}
      </Button>
    </form>
  );
}
