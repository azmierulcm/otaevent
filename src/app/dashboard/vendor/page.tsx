import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  Clock,
  ImageIcon,
  Inbox,
  MapPin,
  Star,
  Store,
  UsersRound,
} from "lucide-react";

import { BidDialog } from "@/components/vendor/bid-dialog";
import { VendorProfileEditor } from "@/components/vendor/vendor-profile-editor";
import { UserNav } from "@/components/shared/user-nav";
import { Button } from "@/components/ui/button";
import type { CustomerEvent } from "@/lib/customer/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  demoOpenJobs,
  demoVendorBids,
  demoVendorProfile,
  type VendorBid,
  type VendorProfile,
} from "@/lib/vendor/demo-data";

export const dynamic = "force-dynamic";

type VendorJob = CustomerEvent & {
  bid_count: number;
  distance: string;
};

async function getVendorDashboardData() {
  if (!isSupabaseConfigured()) {
    return {
      profile: demoVendorProfile,
      jobs: demoOpenJobs,
      bids: demoVendorBids,
      mode: "Demo mode",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      profile: demoVendorProfile,
      jobs: demoOpenJobs,
      bids: demoVendorBids,
      mode: "Demo mode",
    };
  }

  const { data: profile } = await supabase
    .from("vendor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("status", "open")
    .order("event_date", { ascending: true })
    .limit(12);

  const { data: bids } = await supabase
    .from("bids")
    .select("id,event_id,amount,message,status,created_at")
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false });

  const jobs = (events ?? []).map((event) => ({
    ...event,
    share_slug: event.share_slug ?? event.id,
    bid_count: 0,
    distance: "Local",
  })) satisfies VendorJob[];

  return {
    profile: (profile ?? {
      ...demoVendorProfile,
      user_id: user.id,
      business_name: "New vendor profile",
      gallery_image_paths: [],
      service_categories: [],
      cover_image_path: null,
      price_floor: null,
      is_verified: false,
    }) as VendorProfile,
    jobs,
    bids: (bids ?? []).map((bid) => ({
      id: bid.id,
      event_id: bid.event_id,
      event_name: jobs.find((job) => job.id === bid.event_id)?.name ?? "Customer request",
      amount: bid.amount,
      message: bid.message,
      status: bid.status,
      created_at: bid.created_at,
    })) satisfies VendorBid[],
    mode: "Live Supabase",
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-MY", {
    currency: "MYR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function VendorDashboardPage() {
  const { profile, jobs, bids, mode } = await getVendorDashboardData();
  const pendingBids = bids.filter((bid) => bid.status === "pending").length;
  const acceptedBids = bids.filter((bid) => bid.status === "accepted").length;
  const averageBudget =
    jobs.length > 0 ? jobs.reduce((sum, job) => sum + job.budget, 0) / jobs.length : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link className="text-lg font-semibold tracking-normal" href="/">
            Otaevent
          </Link>
          <div className="flex items-center gap-3">
            <UserNav />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm font-semibold text-brand">Vendor dashboard</p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-normal md:text-5xl">
              Manage your profile, find jobs, and send polished bids.
            </h1>
          </div>

          <aside className="overflow-hidden rounded-2xl bg-stone-950 text-white shadow-airbnb">
            <div className="relative h-48 bg-stone-800">
              {profile.cover_image_path?.startsWith("http") ? (
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  src={profile.cover_image_path}
                />
              ) : (
                <div className="grid h-full place-items-center">
                  <ImageIcon className="size-8 text-white/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-semibold tracking-normal">{profile.business_name}</h2>
                      {profile.is_verified ? <BadgeCheck className="size-5 text-emerald-300" /> : null}
                    </div>
                    <p className="mt-1 text-sm text-white/75">{profile.tagline}</p>
                  </div>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                    From {formatCurrency(profile.price_floor ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Open requests", value: jobs.length, icon: Store },
            { label: "Average budget", value: formatCurrency(averageBudget), icon: CircleDollarSign },
            { label: "Pending bids", value: pendingBids, icon: Inbox },
            { label: "Accepted bids", value: acceptedBids, icon: Star },
          ].map(({ label, value, icon: Icon }) => (
            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line" key={label}>
              <Icon className="size-5 text-brand" />
              <p className="mt-5 text-2xl font-semibold">{value}</p>
              <p className="mt-1 text-sm font-medium text-stone-500">{label}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-brand">Business profile</p>
                <h2 className="text-2xl font-semibold tracking-normal">Profile editor</h2>
              </div>
              <span className="rounded-full bg-surface-soft px-3 py-2 text-xs font-semibold text-stone-600">
                Storage bucket: portfolio
              </span>
            </div>
            <div className="mt-6">
              <VendorProfileEditor profile={profile} />
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand">Job directory</p>
                  <h2 className="text-2xl font-semibold tracking-normal">Open customer requests</h2>
                </div>
                <p className="text-sm font-medium text-stone-500">
                  Matched to your services and availability
                </p>
              </div>

              <div className="mt-5 grid gap-4">
                {jobs.map((job) => (
                  <article className="rounded-2xl border border-line p-4" key={job.id}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-semibold tracking-normal">{job.name}</h3>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {job.distance}
                          </span>
                        </div>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{job.details}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.services.map((service) => (
                            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700" key={service}>
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid min-w-44 gap-2 text-sm text-stone-600">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="size-4" />
                          {formatDate(job.event_date)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <UsersRound className="size-4" />
                          {job.capacity} guests
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="size-4" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-2 font-semibold text-stone-950">
                          <CircleDollarSign className="size-4" />
                          {formatCurrency(job.budget)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-stone-500">
                        <Clock className="size-4" />
                        {job.bid_count} bids already sent
                      </span>
                      <BidDialog budget={job.budget} eventId={job.id} eventName={job.name} />
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
              <p className="text-sm font-semibold text-brand">Bidding interface</p>
              <h2 className="text-2xl font-semibold tracking-normal">Your active bids</h2>
              <div className="mt-5 grid gap-4">
                {bids.map((bid) => (
                  <article className="rounded-2xl bg-surface-soft p-4" key={bid.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold tracking-normal">{bid.event_name}</h3>
                        <p className="mt-1 text-sm leading-6 text-stone-600">{bid.message}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-600">
                        {bid.status}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-lg font-semibold">{formatCurrency(bid.amount)}</span>
                      <span className="text-sm font-medium text-stone-500">
                        {formatDate(bid.created_at)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
