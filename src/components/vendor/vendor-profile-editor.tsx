"use client";

import { useActionState, useState } from "react";
import { BadgeCheck, Save } from "lucide-react";

import { saveVendorProfileAction } from "@/app/actions/vendor";
import { PortfolioUploader } from "@/components/vendor/portfolio-uploader";
import { VendorActionStatus } from "@/components/vendor/vendor-action-status";
import { Button } from "@/components/ui/button";
import type { VendorProfile } from "@/lib/vendor/demo-data";
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

export function VendorProfileEditor({ profile }: { profile: VendorProfile }) {
  const [selectedServices, setSelectedServices] = useState(profile.service_categories);
  const [galleryImages, setGalleryImages] = useState(profile.gallery_image_paths);
  const [state, formAction, isPending] = useActionState(saveVendorProfileAction, {
    status: "idle" as const,
    message: "",
  });

  function toggleService(service: string) {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {selectedServices.map((service) => (
        <input key={service} name="service_categories" type="hidden" value={service} />
      ))}
      {galleryImages.map((image) => (
        <input key={image} name="gallery_image_paths" type="hidden" value={image} />
      ))}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Business name
          <input
            className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
            defaultValue={profile.business_name}
            name="business_name"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Base location
          <input
            className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
            defaultValue={profile.base_location ?? ""}
            name="base_location"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-stone-700">
        Tagline
        <input
          className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
          defaultValue={profile.tagline ?? ""}
          name="tagline"
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-stone-700">
        Bio
        <textarea
          className="min-h-28 rounded-xl border border-line px-4 py-3 leading-7 outline-none focus:border-brand"
          defaultValue={profile.bio ?? ""}
          name="bio"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Starting price
          <input
            className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
            defaultValue={profile.price_floor ?? ""}
            min="1"
            name="price_floor"
            type="number"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Cover image path
          <input
            className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
            defaultValue={profile.cover_image_path ?? ""}
            name="cover_image_path"
            placeholder="Storage path or image URL"
          />
        </label>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-stone-700">Service categories</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {serviceOptions.map((service) => {
            const isSelected = selectedServices.includes(service);

            return (
              <button
                className={cn(
                  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition",
                  isSelected
                    ? "border-stone-950 bg-stone-950 text-white"
                    : "border-line bg-white text-stone-700 hover:border-stone-400",
                )}
                key={service}
                onClick={() => toggleService(service)}
                type="button"
              >
                {isSelected ? <BadgeCheck className="size-4" /> : null}
                {service}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-stone-700">Portfolio gallery</p>
        <PortfolioUploader initialImages={galleryImages} onImagesChange={setGalleryImages} />
      </div>

      <VendorActionStatus state={state} />

      <Button disabled={isPending} type="submit">
        <Save className="size-4" />
        {isPending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
