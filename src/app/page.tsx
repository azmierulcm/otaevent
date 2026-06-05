import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Compass,
  Heart,
  HeartHandshake,
  House,
  Inbox,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { UserNav } from "@/components/shared/user-nav";

const navItems = [
  { label: "Explore", href: "#discover" },
  { label: "For planners", href: "#roles" },
  { label: "For vendors", href: "#roles" },
];

const heroStats = [
  { label: "Open requests", value: "128" },
  { label: "Verified vendors", value: "64" },
  { label: "Guest RSVPs", value: "2.8k" },
];

const discoveryCards = [
  {
    title: "Garden engagement dinner",
    location: "Kuala Lumpur",
    price: "RM 8,500",
    meta: "42 guests",
    tag: "Planner request",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Modern dessert atelier",
    location: "Petaling Jaya",
    price: "From RM 1,200",
    meta: "4.96 rating",
    tag: "Vendor",
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Private birthday brunch",
    location: "Penang",
    price: "RM 5,200",
    meta: "35 guests",
    tag: "Planner request",
    image:
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Editorial floral studio",
    location: "Subang Jaya",
    price: "From RM 900",
    meta: "Portfolio ready",
    tag: "Vendor",
    image:
      "https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=900&q=80",
  },
];

const roleCards = [
  {
    title: "Planner",
    caption: "Create a request, compare bids, share RSVP and registry pages.",
    icon: HeartHandshake,
    accent: "bg-rose-500",
  },
  {
    title: "Vendor",
    caption: "Publish a gallery profile, bid on events, manage availability.",
    icon: Store,
    accent: "bg-emerald-600",
  },
  {
    title: "Owner",
    caption: "Curate stories, review users, and place native ad blocks.",
    icon: ShieldCheck,
    accent: "bg-stone-950",
  },
];

const mobileTabs = [
  { label: "Home", href: "/", icon: House },
  { label: "Explore", href: "#discover", icon: Compass },
  { label: "Customer", href: "/dashboard/customer", icon: Inbox },
  { label: "Owner", href: "/dashboard/owner", icon: ShieldCheck },
];

const adTiles = [
  "Featured venue collections",
  "Priority vendor placement",
  "Registry gift partners",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 shadow-sm backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link className="flex min-w-0 items-center gap-2 text-lg font-semibold tracking-normal" href="/">
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
            <button className="grid size-10 place-items-center rounded-full bg-brand text-brand-foreground shadow-sm transition hover:bg-rose-600">
              <Search className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex">
              <UserNav />
            </div>
            <button className="grid size-10 place-items-center rounded-full border border-line bg-white shadow-sm md:hidden">
              <Search className="size-4" />
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section
          className="relative overflow-hidden bg-stone-950 text-white"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(28,25,23,0.18), rgba(28,25,23,0.82)), url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1800&q=82')",
            backgroundPosition: "center",
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
                Plan intimate events, match with trusted vendors, and publish polished event stories from one fluid CMS.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl bg-white text-stone-950 shadow-airbnb md:rounded-full md:p-2">
              <div className="grid md:grid-cols-[1fr_1fr_1fr_auto]">
                {[
                  { label: "Where", value: "Kuala Lumpur", icon: MapPin },
                  { label: "When", value: "Pick a weekend", icon: CalendarDays },
                  { label: "Guests", value: "Under 100", icon: UsersRound },
                ].map(({ label, value, icon: Icon }) => (
                  <button
                    className="flex items-center gap-3 border-b border-line px-5 py-4 text-left transition hover:bg-surface-soft md:border-b-0 md:border-r"
                    key={label}
                  >
                    <Icon className="size-5 text-brand" />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase text-stone-500">{label}</span>
                      <span className="block truncate text-sm font-semibold">{value}</span>
                    </span>
                  </button>
                ))}
                <Link className="m-3 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 md:m-0 md:h-full md:min-w-36" href="/dashboard/customer">
                  <Search className="size-4" />
                  Search
                </Link>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 md:max-w-2xl md:gap-4">
              {heroStats.map(({ label, value }) => (
                <div className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur-md" key={label}>
                  <p className="text-2xl font-semibold md:text-3xl">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-white/75 md:text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="discover" className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand">Public marketplace</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
                Discover live requests and standout vendors
              </h2>
            </div>
            <Link className="inline-flex items-center gap-2 text-sm font-semibold text-stone-800" href="/dashboard/customer">
              View role dashboards
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {discoveryCards.map((item) => (
              <article className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line transition hover:-translate-y-1 hover:shadow-md" key={item.title}>
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-soft">
                  <Image
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    src={item.image}
                  />
                  <button className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-stone-900 shadow-sm backdrop-blur">
                    <Heart className="size-4" />
                  </button>
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-800 shadow-sm backdrop-blur">
                    {item.tag}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold leading-6 tracking-normal">{item.title}</h3>
                    <span className="shrink-0 text-sm font-semibold">{item.price}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm text-stone-600">
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <MapPin className="size-4 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </span>
                    <span>{item.meta}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-14">
            <div id="roles" className="grid gap-4 md:grid-cols-3">
            {roleCards.map(({ title, caption, icon: Icon, accent }) => (
              <article className="rounded-2xl bg-surface-soft p-5 shadow-sm ring-1 ring-line" key={title}>
                <span className={`grid size-11 place-items-center rounded-xl text-white ${accent}`}>
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-8 text-xl font-semibold tracking-normal">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{caption}</p>
              </article>
            ))}
            </div>

            <aside className="rounded-2xl bg-stone-950 p-5 text-white shadow-airbnb">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white/60">Native ad inventory</p>
                  <h2 className="text-2xl font-semibold tracking-normal">Editorial placements that feel built in</h2>
                </div>
                <BadgeCheck className="size-7 text-emerald-300" />
              </div>
              <div className="mt-6 grid gap-3">
                {adTiles.map((item) => (
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-white/10 px-4 py-3" key={item}>
                    <span className="text-sm font-medium text-white/85">{item}</span>
                    <ChevronDown className="size-4 text-white/60" />
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-3 md:px-8 md:py-14">
          {[
            { title: "Event engine", body: "Budget, date, service selection, details, and capacity rules.", icon: ClipboardList },
            { title: "Bid stream", body: "Realtime vendor bids and customer messaging are ready for Phase 3.", icon: CircleDollarSign },
            { title: "Shareable pages", body: "Registry and RSVP tables are shaped for public guest flows.", icon: CalendarDays },
          ].map(({ title, body, icon: Icon }) => (
            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line" key={title}>
              <Icon className="size-6 text-brand" />
              <h2 className="mt-6 text-xl font-semibold tracking-normal">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{body}</p>
            </article>
          ))}
        </section>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-2 pb-3 pt-2 shadow-md backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-4">
          {mobileTabs.map(({ label, href, icon: Icon }) => (
            <Link className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium text-stone-600 transition hover:bg-surface-soft" href={href} key={label}>
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
