"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, PartyPopper, Pencil, Plus, Send } from "lucide-react";

import { createEventAction, updateEventAction } from "@/app/actions/customer";
import { ActionStatus } from "@/components/customer/action-status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CustomerEvent } from "@/lib/customer/demo-data";
import { cn } from "@/lib/utils";

const serviceOptions = [
  "Catering",
  "Venue",
  "Florals",
  "Photography",
  "Dessert",
  "Decor",
  "Music",
  "Planning",
];

const steps = ["Basics", "Services", "Details"];

interface EventCreationFlowProps {
  /** When provided the dialog opens in edit mode pre-filled with existing values. */
  event?: CustomerEvent;
}

export function EventCreationFlow({ event }: EventCreationFlowProps = {}) {
  const isEdit = !!event;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>(event?.services ?? []);

  const action = isEdit ? updateEventAction : createEventAction;
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle" as const,
    message: "",
  });

  // Reset step and services whenever the dialog closes
  useEffect(() => {
    if (!open) {
      setStep(0);
      setSelectedServices(event?.services ?? []);
    }
  }, [open, event?.services]);

  useEffect(() => {
    if (state.status === "success") {
      const timer = setTimeout(() => {
        setOpen(false);
        setStep(0);
        router.refresh();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.status, router]);

  const progress = useMemo(() => `${((step + 1) / steps.length) * 100}%`, [step]);

  function toggleService(service: string) {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button size="sm" variant="secondary">
            <Pencil className="size-3.5" />
            Edit
          </Button>
        ) : (
          <Button size="lg">
            <Plus className="size-4" />
            Create event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="overflow-y-auto md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit event request" : "Create an event request"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your event details. Changes are visible to vendors immediately."
              : "Build a vendor-ready brief for an intimate event under 100 guests."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: progress }} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {steps.map((item, index) => (
            <button
              className={cn(
                "rounded-full px-3 py-2 text-xs font-semibold transition",
                index === step ? "bg-stone-950 text-white" : "bg-stone-100 text-stone-600",
              )}
              key={item}
              onClick={() => setStep(index)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <form action={formAction} className="mt-6 space-y-5">
          {/* Hidden fields */}
          {isEdit && <input name="event_id" type="hidden" value={event.id} />}
          {selectedServices.map((service) => (
            <input key={service} name="services" type="hidden" value={service} />
          ))}

          {/* ── Step 0: Basics ── */}
          <div className={cn(step === 0 ? "grid gap-4" : "hidden")}>
            <label className="grid gap-2 text-sm font-semibold text-stone-700">
              Event name
              <input
                className="h-12 rounded-xl border border-line bg-white px-4 text-base font-medium outline-none transition focus:border-brand"
                defaultValue={event?.name}
                name="name"
                placeholder="e.g. Garden engagement dinner"
                required
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Date
                <input
                  className="h-12 rounded-xl border border-line bg-white px-4 text-base outline-none transition focus:border-brand"
                  defaultValue={event?.event_date}
                  name="event_date"
                  type="date"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Location
                <input
                  className="h-12 rounded-xl border border-line bg-white px-4 text-base outline-none transition focus:border-brand"
                  defaultValue={event?.location ?? ""}
                  name="location"
                  placeholder="City or venue"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Budget
                <input
                  className="h-12 rounded-xl border border-line bg-white px-4 text-base outline-none transition focus:border-brand"
                  defaultValue={event?.budget}
                  min="1"
                  name="budget"
                  placeholder="0"
                  type="number"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Guest count
                <input
                  className="h-12 rounded-xl border border-line bg-white px-4 text-base outline-none transition focus:border-brand"
                  defaultValue={event?.capacity}
                  max="99"
                  min="1"
                  name="capacity"
                  placeholder="10"
                  type="number"
                  required
                />
              </label>
            </div>
          </div>

          {/* ── Step 1: Services ── */}
          <div className={cn(step === 1 ? "grid gap-4" : "hidden")}>
            <p className="text-sm font-semibold text-stone-700">Services needed</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {serviceOptions.map((service) => {
                const isSelected = selectedServices.includes(service);
                return (
                  <button
                    className={cn(
                      "flex h-12 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition",
                      isSelected
                        ? "border-stone-950 bg-stone-950 text-white"
                        : "border-line bg-white text-stone-700 hover:border-stone-400",
                    )}
                    key={service}
                    onClick={() => toggleService(service)}
                    type="button"
                  >
                    {isSelected ? <Check className="size-4" /> : null}
                    {service}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Step 2: Details ── */}
          <div className={cn(step === 2 ? "grid gap-4" : "hidden")}>
            <label className="grid gap-2 text-sm font-semibold text-stone-700">
              Event details
              <textarea
                className="min-h-36 rounded-xl border border-line bg-white px-4 py-3 text-base leading-7 outline-none transition focus:border-brand"
                defaultValue={event?.details ?? ""}
                name="details"
                placeholder="Describe the mood, must-haves, references, and timing."
              />
            </label>
            {!isEdit && (
              <div className="rounded-2xl bg-surface-soft p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-brand text-white">
                    <PartyPopper className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-stone-950">Vendor-ready request</p>
                    <p className="text-sm text-stone-600">
                      This will publish as an open customer request with a shareable guest page.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <ActionStatus state={state} />

          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <Button
              disabled={step === 0}
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              type="button"
              variant="secondary"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button
                onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}
                type="button"
              >
                Next
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button disabled={isPending} type="submit">
                <Send className="size-4" />
                {isPending
                  ? isEdit ? "Saving…" : "Publishing..."
                  : isEdit ? "Save changes" : "Publish request"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
