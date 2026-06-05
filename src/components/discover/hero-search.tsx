"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Search, UsersRound } from "lucide-react";

interface HeroSearchProps {
  location: string;
  category: string;
  type: string;
}

export function HeroSearch({ location, category, type }: HeroSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch() {
    const params = new URLSearchParams();
    const loc = inputRef.current?.value.trim() ?? "";
    if (loc) params.set("location", loc);
    if (category) params.set("category", category);
    if (type) params.set("type", type);
    router.push(`/?${params.toString()}#discover`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white text-stone-950 shadow-airbnb md:rounded-full md:p-2">
      <div className="grid md:grid-cols-[1fr_1fr_1fr_auto]">
        <div className="flex items-center gap-3 border-b border-line px-5 py-4 md:border-b-0 md:border-r">
          <MapPin className="size-5 shrink-0 text-brand" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase text-stone-500">Where</span>
            <input
              ref={inputRef}
              className="block w-full truncate bg-transparent text-sm font-semibold outline-none placeholder:text-stone-400"
              defaultValue={location}
              onKeyDown={handleKeyDown}
              placeholder="Any location"
              type="text"
            />
          </span>
        </div>

        <button className="flex items-center gap-3 border-b border-line px-5 py-4 text-left transition hover:bg-surface-soft md:border-b-0 md:border-r">
          <CalendarDays className="size-5 shrink-0 text-brand" />
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase text-stone-500">When</span>
            <span className="block truncate text-sm font-semibold text-stone-400">Any time</span>
          </span>
        </button>

        <button className="flex items-center gap-3 border-b border-line px-5 py-4 text-left transition hover:bg-surface-soft md:border-b-0">
          <UsersRound className="size-5 shrink-0 text-brand" />
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase text-stone-500">Guests</span>
            <span className="block truncate text-sm font-semibold text-stone-400">Under 100</span>
          </span>
        </button>

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
