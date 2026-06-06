"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Search, Tag } from "lucide-react";

const eventTypes = [
  "Catering",
  "Venue",
  "Florals",
  "Photography",
  "Dessert",
  "Decor",
  "Music",
  "Planning",
];

interface HeroSearchProps {
  location: string;
  category: string;
  type: string;
}

export function HeroSearch({ location, category, type }: HeroSearchProps) {
  const router = useRouter();
  const locationRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState(category);

  function handleSearch() {
    const params = new URLSearchParams();
    const loc = locationRef.current?.value.trim() ?? "";
    if (loc) params.set("location", loc);
    if (selectedCategory) params.set("category", selectedCategory);
    if (type) params.set("type", type);
    router.push(`/?${params.toString()}#discover`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white text-stone-950 shadow-airbnb md:rounded-full md:p-2">
      <div className="grid md:grid-cols-[1fr_1px_1fr_auto]">

        {/* WHERE */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-4 md:border-b-0">
          <MapPin className="size-5 shrink-0 text-brand" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase tracking-wide text-stone-400">
              Where
            </span>
            <input
              ref={locationRef}
              className="block w-full truncate bg-transparent text-sm font-semibold text-stone-900 outline-none placeholder:font-normal placeholder:text-stone-400"
              defaultValue={location}
              onKeyDown={handleKeyDown}
              placeholder="City or area"
              type="text"
            />
          </span>
        </div>

        {/* Divider */}
        <div className="hidden self-stretch bg-line md:block" />

        {/* EVENT TYPE */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-4 md:border-b-0">
          <Tag className="size-5 shrink-0 text-brand" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase tracking-wide text-stone-400">
              Event type
            </span>
            <div className="relative flex items-center">
              <select
                className="w-full appearance-none bg-transparent text-sm font-semibold text-stone-900 outline-none"
                onChange={(e) => setSelectedCategory(e.target.value)}
                value={selectedCategory}
              >
                <option value="">Any type</option>
                {eventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 size-4 shrink-0 text-stone-400" />
            </div>
          </span>
        </div>

        {/* SEARCH BUTTON */}
        <button
          className="m-3 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 md:m-0 md:h-full md:min-w-36"
          onClick={handleSearch}
          type="button"
        >
          <Search className="size-4" />
          Search
        </button>
      </div>
    </div>
  );
}
