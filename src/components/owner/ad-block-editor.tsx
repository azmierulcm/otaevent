"use client";

import { useActionState } from "react";
import { Megaphone, Plus } from "lucide-react";

import { saveAdBlockAction } from "@/app/actions/owner";
import { OwnerActionStatus } from "@/components/owner/owner-action-status";
import { Button } from "@/components/ui/button";

export function AdBlockEditor() {
  const [state, formAction, isPending] = useActionState(saveAdBlockAction, {
    status: "idle" as const,
    message: "",
  });

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Title
          <input
            className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
            defaultValue="Priority vendor placement"
            name="title"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Placement
          <select
            className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
            defaultValue="home_grid"
            name="placement"
          >
            <option value="home_grid">Home grid</option>
            <option value="registry_sidebar">Registry sidebar</option>
            <option value="article_inline">Article inline</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-stone-700">
        Image
        <input
          className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
          name="image_path"
          placeholder="Storage path or image URL"
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-stone-700">
        Destination URL
        <input
          className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
          defaultValue="https://example.com"
          name="destination_url"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Starts at
          <input
            className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
            name="starts_at"
            type="datetime-local"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Ends at
          <input
            className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
            name="ends_at"
            type="datetime-local"
          />
        </label>
      </div>

      <label className="flex items-center gap-3 rounded-2xl bg-surface-soft px-4 py-3 text-sm font-semibold text-stone-700">
        <input className="size-4 accent-rose-500" defaultChecked name="is_active" type="checkbox" />
        Active placement
      </label>

      <div className="rounded-2xl bg-stone-950 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-white/10">
            <Megaphone className="size-5" />
          </span>
          <p className="text-sm leading-6 text-white/75">
            Native ad blocks are designed to sit inside marketplace, registry, and editorial layouts without feeling bolted on.
          </p>
        </div>
      </div>

      <OwnerActionStatus state={state} />

      <Button disabled={isPending} type="submit">
        <Plus className="size-4" />
        {isPending ? "Creating..." : "Create ad block"}
      </Button>
    </form>
  );
}
