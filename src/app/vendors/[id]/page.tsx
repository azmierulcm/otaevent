import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  CalendarPlus,
  CircleDollarSign,
  ImageIcon,
  MapPin,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/shared/user-nav";
import { SiteNavbar } from "@/components/shared/site-navbar";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/supabase/types";

interface VendorPageProps {
  params: Promise<{ id: string }>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-MY", {
    currency: "MYR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export default async function VendorProfilePage({ params }: VendorPageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let viewerRole: AppRole | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    viewerRole = profile?.role ?? null;
  }

  const { data: vendor } = await supabase
    .from("vendor_profiles")
    .select(
      "id, business_name, tagline, bio, base_location, service_categories, cover_image_path, gallery_image_paths, price_floor, is_verified",
    )
    .eq("id", id)
    .single();

  if (!vendor) notFound();

  const coverImage = vendor.cover_image_path?.startsWith("http")
    ? vendor.cover_image_path
    : null;

  const gallery = (vendor.gallery_image_paths ?? []).filter((p: string) =>
    p.startsWith("http"),
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <SiteNavbar right={<UserNav />} />

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
        {/* Cover + identity */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-line">
          <div className="relative h-56 bg-stone-100 md:h-72">
            {coverImage ? (
              <Image
                alt={vendor.business_name}
                className="object-cover"
                fill
                priority
                sizes="(min-width: 896px) 896px, 100vw"
                src={coverImage}
              />
            ) : (
              <div className="grid h-full place-items-center">
                <ImageIcon className="size-10 text-stone-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="relative px-6 pb-6 pt-4 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
                    {vendor.business_name}
                  </h1>
                  {vendor.is_verified && (
                    <BadgeCheck className="size-5 text-emerald-500" />
                  )}
                </div>
                {vendor.tagline && (
                  <p className="mt-1 text-stone-500">{vendor.tagline}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-500">
                  {vendor.base_location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4" />
                      {vendor.base_location}
                    </span>
                  )}
                  {vendor.price_floor && (
                    <span className="inline-flex items-center gap-1.5">
                      <CircleDollarSign className="size-4" />
                      From {formatCurrency(vendor.price_floor)}
                    </span>
                  )}
                </div>
              </div>

              {viewerRole === "customer" ? (
                <Button asChild>
                  <Link href="/dashboard/customer">
                    <CalendarPlus className="size-4" />
                    Post an event request
                  </Link>
                </Button>
              ) : viewerRole === null ? (
                <Button asChild>
                  <Link href="/auth/signup">
                    <Sparkles className="size-4" />
                    Work with this vendor
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto]">
          {/* Bio + gallery */}
          <div className="space-y-6">
            {vendor.bio && (
              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                  About
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-700">{vendor.bio}</p>
              </section>
            )}

            {gallery.length > 0 && (
              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                  Portfolio
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {gallery.map((src: string, i: number) => (
                    <div
                      className="relative aspect-square overflow-hidden rounded-xl bg-surface-soft"
                      key={i}
                    >
                      <Image
                        alt={`${vendor.business_name} portfolio ${i + 1}`}
                        className="object-cover"
                        fill
                        sizes="(min-width: 768px) 200px, 50vw"
                        src={src}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar — services */}
          <aside className="space-y-4 md:w-56">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Services
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {vendor.service_categories.map((s: string) => (
                  <span
                    className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-brand"
                    key={s}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>

            {viewerRole === null && (
              <section className="rounded-2xl bg-stone-950 p-5 text-white shadow-sm">
                <p className="text-sm font-semibold">Ready to work together?</p>
                <p className="mt-1 text-xs leading-5 text-white/70">
                  Create a free planner account and post your event request.
                </p>
                <Button asChild className="mt-4 w-full" variant="secondary">
                  <Link href="/auth/signup">Get started free</Link>
                </Button>
              </section>
            )}
            {viewerRole === "customer" && (
              <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-stone-800">
                  Interested in this vendor?
                </p>
                <p className="mt-1 text-xs leading-5 text-stone-500">
                  Post an event request and vendors like this can bid on it.
                </p>
                <Button asChild className="mt-4 w-full">
                  <Link href="/dashboard/customer">
                    <CalendarPlus className="size-4" />
                    Post an event
                  </Link>
                </Button>
              </section>
            )}
          </aside>
        </div>

        <p className="mt-8 text-center text-sm text-stone-400">
          <Link className="hover:underline" href="/">
            ← Back to marketplace
          </Link>
        </p>
      </main>
    </div>
  );
}
