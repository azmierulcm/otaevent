import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import Link from "next/link";

import { DiscoveryFilters } from "@/components/discover/discovery-filters";
import { DiscoveryGrid, type DiscoveryCard } from "@/components/discover/discovery-grid";
import { HeroSearch } from "@/components/discover/hero-search";
import { UserNav } from "@/components/shared/user-nav";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/supabase/types";

// ── Category → placeholder image (for events that have no photo) ──────────
const categoryImages: Record<string, string> = {
  Catering: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=80",
  Venue: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80",
  Florals: "https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=900&q=80",
  Photography: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  Dessert: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80",
  Decor: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80",
  Music: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
  Planning: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
};
const fallbackImage =
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-MY", {
    currency: "MYR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

// ── Demo cards shown when Supabase is not configured ──────────────────────
const demoCards: DiscoveryCard[] = [
  {
    id: "demo-1",
    title: "Garden engagement dinner",
    location: "Kuala Lumpur",
    price: "RM 8,500",
    meta: "42 guests",
    tag: "Planner request",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    href: "/auth/signup",
    services: ["Catering", "Florals", "Photography"],
  },
  {
    id: "demo-2",
    title: "Modern dessert atelier",
    location: "Petaling Jaya",
    price: "From RM 1,200",
    meta: "Portfolio ready",
    tag: "Vendor",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80",
    href: "/auth/signup",
    services: ["Dessert", "Decor"],
  },
  {
    id: "demo-3",
    title: "Private birthday brunch",
    location: "Penang",
    price: "RM 5,200",
    meta: "35 guests",
    tag: "Planner request",
    image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80",
    href: "/auth/signup",
    services: ["Venue", "Dessert", "Decor"],
  },
  {
    id: "demo-4",
    title: "Editorial floral studio",
    location: "Subang Jaya",
    price: "From RM 900",
    meta: "4.96 rating",
    tag: "Vendor",
    image: "https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=900&q=80",
    href: "/auth/signup",
    services: ["Florals", "Decor", "Planning"],
  },
];

// ── Viewer role ───────────────────────────────────────────────────────────
async function getViewerRole(): Promise<AppRole | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role ?? null;
}

// ── Real data fetch ────────────────────────────────────────────────────────
async function fetchDiscovery(params: {
  location: string;
  category: string;
  type: string;
}): Promise<DiscoveryCard[]> {
  if (!isSupabaseConfigured()) return demoCards;

  const supabase = await createClient();
  const { location, category, type } = params;
  const cards: DiscoveryCard[] = [];

  // Events (open + public/shared)
  if (type !== "vendors") {
    let q = supabase
      .from("events")
      .select("id, name, location, budget, services, capacity, share_slug")
      .eq("status", "open")
      .in("visibility", ["shared", "public"])
      .order("created_at", { ascending: false })
      .limit(type === "requests" ? 16 : 8);

    if (location) q = q.ilike("location", `%${location}%`);
    if (category) q = q.contains("services", [category]);

    const { data: events } = await q;
    for (const e of events ?? []) {
      const firstService = e.services?.[0] ?? "";
      cards.push({
        id: e.id,
        title: e.name,
        location: e.location ?? "Malaysia",
        price: formatCurrency(e.budget),
        meta: `${e.capacity} guests`,
        tag: "Planner request",
        image: categoryImages[firstService] ?? fallbackImage,
        href: `/events/${e.share_slug ?? e.id}`,
        services: e.services,
      });
    }
  }

  // Vendor profiles
  if (type !== "requests") {
    let q = supabase
      .from("vendor_profiles")
      .select(
        "id, business_name, tagline, base_location, service_categories, cover_image_path, price_floor",
      )
      .order("created_at", { ascending: false })
      .limit(type === "vendors" ? 16 : 8);

    if (location) q = q.ilike("base_location", `%${location}%`);
    if (category) q = q.contains("service_categories", [category]);

    const { data: vendors } = await q;
    for (const v of vendors ?? []) {
      const firstService = v.service_categories?.[0] ?? "";
      const image =
        v.cover_image_path?.startsWith("http")
          ? v.cover_image_path
          : categoryImages[firstService] ?? fallbackImage;

      cards.push({
        id: v.id,
        title: v.business_name,
        location: v.base_location ?? "Malaysia",
        price: v.price_floor ? `From ${formatCurrency(v.price_floor)}` : "Get a quote",
        meta: `${v.service_categories.length} service${v.service_categories.length !== 1 ? "s" : ""}`,
        tag: "Vendor",
        image,
        href: `/vendors/${v.id}`,
        services: v.service_categories,
      });
    }
  }

  // Interleave: alternate event + vendor so the grid feels balanced
  if (type === "") {
    const events = cards.filter((c) => c.tag === "Planner request");
    const vendors = cards.filter((c) => c.tag === "Vendor");
    const interleaved: DiscoveryCard[] = [];
    const max = Math.max(events.length, vendors.length);
    for (let i = 0; i < max; i++) {
      if (events[i]) interleaved.push(events[i]);
      if (vendors[i]) interleaved.push(vendors[i]);
    }
    return interleaved.slice(0, 16);
  }

  return cards;
}

// ── Static sections ────────────────────────────────────────────────────────
const heroStats = [
  { label: "Open requests", value: "128" },
  { label: "Verified vendors", value: "64" },
  { label: "Guest RSVPs", value: "2.8k" },
];


const navItems = [
  { label: "Explore", href: "#discover" },
  { label: "For planners", href: "#roles" },
  { label: "For vendors", href: "#roles" },
];

const mobileTabs = [
  { label: "Home", href: "/", icon: HeartHandshake },
  { label: "Explore", href: "#discover", icon: Store },
  { label: "Dashboard", href: "/dashboard/customer", icon: ShieldCheck },
];

// ── Page ──────────────────────────────────────────────────────────────────
interface HomeProps {
  searchParams: Promise<{ location?: string; category?: string; type?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { location = "", category = "", type = "" } = await searchParams;
  const hasFilters = !!(location || category || type);

  const [cards, viewerRole] = await Promise.all([
    fetchDiscovery({ location, category, type }),
    getViewerRole(),
  ]);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 shadow-sm backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link
            className="flex min-w-0 items-center gap-2 text-lg font-semibold tracking-normal"
            href="/"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
              <Sparkles className="size-4" />
            </span>
            <span>Otaevent</span>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-line bg-white p-1 shadow-airbnb md:flex">
            {navItems.map((item) => (
              <Link
                className="rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-surface-soft"
                href={item.href}
                key={item.label}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <UserNav />
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section
          className="relative overflow-hidden bg-stone-950 text-white"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(28,25,23,0.25), rgba(28,25,23,0.72)), url('https://www.effortlessevents.in/home-page.png')",
            backgroundPosition: "center 65%",
            backgroundSize: "cover",
          }}
        >
          <div className="mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-4 pb-8 md:min-h-[76vh] md:px-8 md:pb-12">
            <div className="max-w-4xl">
              <p className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-md">
                Marketplace, registry, RSVP, and editorial CMS
              </p>
              <h1 className="text-5xl font-semibold leading-[0.96] tracking-normal md:text-7xl">
                Otaevent
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90 md:text-2xl md:leading-9">
                Plan intimate events, match with trusted vendors, and publish polished event stories
                from one fluid CMS.
              </p>
            </div>

            <div className="mt-8">
              <HeroSearch category={category} key={location} location={location} type={type} />
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 md:max-w-2xl md:gap-4">
              {heroStats.map(({ label, value }) => (
                <div
                  className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur-md"
                  key={label}
                >
                  <p className="text-2xl font-semibold md:text-3xl">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-white/75 md:text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Discovery */}
        <section id="discover" className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand">Public marketplace</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
                {location
                  ? `Results near "${location}"`
                  : "Discover live requests and standout vendors"}
              </h2>
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-stone-800"
              href="/dashboard/customer"
            >
              View role dashboards
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <DiscoveryFilters category={category} location={location} type={type} />

          <div className="mt-8">
            <DiscoveryGrid cards={cards} hasFilters={hasFilters} />
          </div>
        </section>

        {/* How it works */}
        <section id="roles" className="border-y border-line bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">

            {/* 2-2 role grid */}
            <div className="grid gap-5 md:grid-cols-2">

              {/* Planner card */}
              <div className="flex flex-col rounded-2xl bg-rose-50 p-7 ring-1 ring-rose-100">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand ring-1 ring-rose-100">
                  <HeartHandshake className="size-3.5" />
                  For planners
                </span>
                <h2 className="mt-5 text-2xl font-semibold leading-snug tracking-normal md:text-3xl">
                  Plan your event in three steps
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Post a brief, get bids from verified vendors, and manage RSVPs — all in one place.
                </p>
                <ol className="mt-7 space-y-5">
                  {[
                    {
                      step: "01",
                      title: "Post your event request",
                      body: "Describe what you need, set your budget and date. Under two minutes.",
                    },
                    {
                      step: "02",
                      title: "Compare bids from verified vendors",
                      body: "Review personalised proposals side by side and accept the best fit.",
                    },
                    {
                      step: "03",
                      title: "Manage RSVPs and registry",
                      body: "Share a public guest page for RSVP, gifting, and event updates.",
                    },
                  ].map(({ step, title, body }) => (
                    <li className="flex gap-4" key={step}>
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-brand shadow-sm">
                        {step}
                      </span>
                      <div>
                        <p className="text-sm font-semibold tracking-normal text-stone-900">{title}</p>
                        <p className="mt-0.5 text-sm leading-6 text-stone-500">{body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-auto pt-8">
                  <Link
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
                    href={viewerRole === "customer" ? "/dashboard/customer" : "/auth/signup"}
                  >
                    <HeartHandshake className="size-4" />
                    {viewerRole === "customer" ? "Post an event request" : "Start planning free"}
                  </Link>
                </div>
              </div>

              {/* Vendor card */}
              <div className="flex flex-col rounded-2xl bg-stone-950 p-7 text-white">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                  <Store className="size-3.5" />
                  For vendors
                </span>
                <h2 className="mt-5 text-2xl font-semibold leading-snug tracking-normal md:text-3xl">
                  Grow your event business on Otaevent
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Publish your portfolio, browse open requests, and send polished bids — no commission on accepted jobs.
                </p>
                <ul className="mt-7 space-y-4">
                  {[
                    { title: "Gallery profile with cover image", body: "Showcase your best work with a portfolio that planners love browsing." },
                    { title: "Browse open planner requests", body: "See live event briefs from real planners looking for your services." },
                    { title: "Bid management dashboard", body: "Track every proposal, follow up, and close jobs from one screen." },
                    { title: "Availability calendar", body: "Mark your dates so planners know exactly when you're free." },
                  ].map(({ title, body }) => (
                    <li className="flex gap-4" key={title}>
                      <BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-400" />
                      <div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-0.5 text-sm leading-6 text-white/50">{body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Link
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-950 shadow-sm transition hover:bg-stone-100"
                    href={viewerRole === "vendor" ? "/dashboard/vendor" : "/auth/signup"}
                  >
                    {viewerRole === "vendor" ? "Go to vendor dashboard" : "Join as a vendor"}
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { value: "128", label: "Open requests" },
                { value: "64", label: "Active vendors" },
                { value: "2.8k", label: "Guest RSVPs" },
                { value: "Free", label: "To get started" },
              ].map(({ value, label }) => (
                <div className="rounded-2xl bg-surface-soft p-5 ring-1 ring-line" key={label}>
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="mt-1 text-xs font-medium text-stone-500">{label}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Trust strip */}
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-stone-400">
            Built for intimate events across Malaysia
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: HeartHandshake,
                title: "Planners post free",
                body: "No listing fees. Post your event request, receive bids, and only pay the vendor you choose.",
              },
              {
                icon: ShieldCheck,
                title: "Verified vendor profiles",
                body: "Every vendor profile is reviewed. Browse portfolios, read proposals, and compare pricing before deciding.",
              },
              {
                icon: CalendarDays,
                title: "Guest tools included",
                body: "Share a public RSVP and registry page with every event — no extra tools or subscriptions needed.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <article
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line"
                key={title}
              >
                <span className="grid size-10 place-items-center rounded-xl bg-rose-50">
                  <Icon className="size-5 text-brand" />
                </span>
                <h3 className="mt-5 font-semibold tracking-normal">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-500">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-2 pb-3 pt-2 shadow-md backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-3">
          {mobileTabs.map(({ label, href, icon: Icon }) => (
            <Link
              className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium text-stone-600 transition hover:bg-surface-soft"
              href={href}
              key={label}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
