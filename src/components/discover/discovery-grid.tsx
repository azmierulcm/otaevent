"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

export type DiscoveryCard = {
  id: string;
  title: string;
  location: string;
  price: string;
  meta: string;
  tag: string;
  image: string;
  href: string;
  services?: string[];
};

interface DiscoveryGridProps {
  cards: DiscoveryCard[];
  hasFilters: boolean;
}

export function DiscoveryGrid({ cards, hasFilters }: DiscoveryGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-soft">
          <SlidersHorizontal className="size-6 text-stone-400" />
        </span>
        <div>
          <p className="font-semibold text-stone-700">No results found</p>
          <p className="mt-1 text-sm text-stone-500">
            {hasFilters
              ? "Try a different location, category, or clear your filters."
              : "Check back soon — new requests and vendors are added daily."}
          </p>
        </div>
        {hasFilters && (
          <Button asChild variant="secondary">
            <Link href="/#discover">Clear filters</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
      {cards.map((item) => (
        <article
          className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line transition hover:-translate-y-1 hover:shadow-md"
          key={item.id}
        >
          {/* Heart — outside Link to avoid nested interactive elements, anchored to article */}
          <button
            aria-label="Save"
            className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-white/90 text-stone-900 shadow-sm backdrop-blur transition hover:scale-105"
            type="button"
          >
            <Heart className="size-4" />
          </button>

          <Link className="block" href={item.href}>
            <div className="relative aspect-[4/3] overflow-hidden bg-surface-soft">
              <Image
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                src={item.image}
              />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-800 shadow-sm backdrop-blur">
                {item.tag}
              </span>
            </div>
            <div className="p-3 md:p-4">
              <div className="flex items-start justify-between gap-1.5">
                <h3 className="line-clamp-2 min-w-0 text-xs font-semibold leading-snug tracking-normal text-stone-900 md:text-sm">
                  {item.title}
                </h3>
                <span className="shrink-0 text-xs font-semibold text-stone-900 md:pl-1 md:text-sm">{item.price}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-xs text-stone-500 md:mt-2 md:gap-1.5">
                <MapPin className="size-3 shrink-0" />
                <span className="min-w-0 truncate">{item.location}</span>
                {item.meta && (
                  <>
                    <span className="shrink-0 text-stone-300">·</span>
                    <span className="shrink-0">{item.meta}</span>
                  </>
                )}
              </div>
              {item.services && item.services.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.services.slice(0, 3).map((s) => (
                    <span
                      className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700"
                      key={s}
                    >
                      {s}
                    </span>
                  ))}
                  {item.services.length > 3 && (
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500">
                      +{item.services.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
