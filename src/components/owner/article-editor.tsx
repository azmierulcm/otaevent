"use client";

import { useActionState } from "react";
import { FilePenLine, Save } from "lucide-react";

import { saveArticleAction } from "@/app/actions/owner";
import { OwnerActionStatus } from "@/components/owner/owner-action-status";
import { Button } from "@/components/ui/button";
import type { OwnerArticle } from "@/lib/owner/demo-data";

export function ArticleEditor({ article }: { article: OwnerArticle | null }) {
  const [state, formAction, isPending] = useActionState(saveArticleAction, {
    status: "idle" as const,
    message: "",
  });

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1fr_0.55fr]">
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Title
          <input
            className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
            defaultValue={article?.title ?? ""}
            name="title"
            placeholder="Article title"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Slug
          <input
            className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
            defaultValue={article?.slug ?? ""}
            name="slug"
            placeholder="auto-generated from title"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-stone-700">
        Excerpt
        <textarea
          className="min-h-20 rounded-xl border border-line px-4 py-3 leading-7 outline-none focus:border-brand"
          defaultValue={article?.excerpt ?? ""}
          name="excerpt"
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-stone-700">
        Hero image URL
        <input
          className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
          defaultValue={article?.hero_image_path ?? ""}
          name="hero_image_path"
          placeholder="https://..."
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-stone-700">
        Body (Markdown)
        <textarea
          className="min-h-40 rounded-xl border border-line px-4 py-3 leading-7 outline-none focus:border-brand"
          defaultValue={article?.body_md ?? ""}
          name="body_md"
          placeholder="Write in Markdown..."
        />
      </label>

      <div className="grid gap-3 md:grid-cols-[0.5fr_1fr]">
        <label className="grid gap-2 text-sm font-semibold text-stone-700">
          Status
          <select
            className="h-12 rounded-xl border border-line px-4 outline-none focus:border-brand"
            defaultValue={article?.status ?? "draft"}
            name="status"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <div className="rounded-2xl bg-surface-soft p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-brand text-white">
              <FilePenLine className="size-5" />
            </span>
            <p className="text-sm leading-6 text-stone-600">
              Published content appears in the editorial CMS stream and can be used in owner-managed landing sections.
            </p>
          </div>
        </div>
      </div>

      <OwnerActionStatus state={state} />

      <Button disabled={isPending} type="submit">
        <Save className="size-4" />
        {isPending ? "Saving..." : "Save article"}
      </Button>
    </form>
  );
}
