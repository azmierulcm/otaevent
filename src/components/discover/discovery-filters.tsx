"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const categories = [
  "Catering",
  "Venue",
  "Florals",
  "Photography",
  "Dessert",
  "Decor",
  "Music",
  "Planning",
];

const types = [
  { label: "All", value: "" },
  { label: "Requests", value: "requests" },
  { label: "Vendors", value: "vendors" },
];

interface DiscoveryFiltersProps {
  location: string;
  category: string;
  type: string;
}

export function DiscoveryFilters({ location, category, type }: DiscoveryFiltersProps) {
  const router = useRouter();

  function navigate(updates: { location?: string; category?: string; type?: string }) {
    const params = new URLSearchParams();
    const loc = updates.location ?? location;
    const cat = updates.category ?? category;
    const typ = updates.type ?? type;
    if (loc) params.set("location", loc);
    if (cat) params.set("category", cat);
    if (typ) params.set("type", typ);
    router.push(`/?${params.toString()}#discover`, { scroll: false });
  }

  return (
    <div className="mt-8 space-y-4">
      {/* Type tabs */}
      <div className="flex gap-1 rounded-full border border-line bg-white p-1 shadow-sm self-start w-fit">
        {types.map(({ label, value }) => (
          <button
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition",
              type === value
                ? "bg-stone-950 text-white shadow-sm"
                : "text-stone-600 hover:bg-surface-soft",
            )}
            key={label}
            onClick={() => navigate({ type: value, category: "" })}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Category pills — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
            !category
              ? "border-stone-950 bg-stone-950 text-white"
              : "border-line bg-white text-stone-600 hover:border-stone-400",
          )}
          onClick={() => navigate({ category: "" })}
          type="button"
        >
          All categories
        </button>
        {categories.map((cat) => (
          <button
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
              category === cat
                ? "border-brand bg-rose-50 text-brand"
                : "border-line bg-white text-stone-600 hover:border-stone-400",
            )}
            key={cat}
            onClick={() => navigate({ category: category === cat ? "" : cat })}
            type="button"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
