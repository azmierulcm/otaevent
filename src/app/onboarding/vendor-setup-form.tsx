"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { saveVendorProfileAction } from "@/app/actions/vendor";
import { Button } from "@/components/ui/button";
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

export function VendorSetupForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [state, formAction, pending] = useActionState(saveVendorProfileAction, {
    status: "idle" as const,
    message: "",
  });

  useEffect(() => {
    if (state.status === "success") {
      router.push("/dashboard/vendor");
    }
  }, [state.status, router]);

  function toggle(service: string) {
    setSelected((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service],
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {selected.map((s) => (
        <input key={s} name="service_categories" type="hidden" value={s} />
      ))}

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold" htmlFor="business_name">
          Business name
        </label>
        <input
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          id="business_name"
          name="business_name"
          placeholder="Your business or brand name"
          required
          type="text"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Services you offer</legend>
        <p className="text-xs text-stone-500">Pick at least one — you can change this later.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {serviceOptions.map((service) => (
            <button
              className={cn(
                "rounded-xl border-2 px-3 py-2 text-sm font-medium transition",
                selected.includes(service)
                  ? "border-brand bg-rose-50 text-brand"
                  : "border-line bg-white text-stone-600 hover:border-stone-300",
              )}
              key={service}
              onClick={() => toggle(service)}
              type="button"
            >
              {service}
            </button>
          ))}
        </div>
      </fieldset>

      {state.status === "error" ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <Button
        className="w-full"
        disabled={pending || selected.length === 0}
        type="submit"
      >
        {pending ? "Setting up…" : "Go to my dashboard"}
      </Button>
    </form>
  );
}
