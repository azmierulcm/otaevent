import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  ExternalLink,
  Gift,
  MapPin,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { RegistryClaimForm } from "@/components/customer/registry-claim-form";
import { RsvpForm } from "@/components/customer/rsvp-form";
import {
  demoCustomerEvents,
  getDemoPublicEvent,
  type PublicRegistry,
  type PublicRegistryItem,
  type PublicRSVP,
} from "@/lib/customer/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return demoCustomerEvents.map((event) => ({ slug: event.share_slug }));
}

async function getPublicEvent(slug: string) {
  if (!isSupabaseConfigured()) return getDemoPublicEvent(slug);

  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("share_slug", slug)
    .maybeSingle();

  if (!event) return null;

  const { data: registry } = await supabase
    .from("registry")
    .select("*")
    .eq("event_id", event.id)
    .maybeSingle();

  const { data: registryItems } = registry
    ? await supabase
        .from("registry_items")
        .select("*")
        .eq("registry_id", registry.id)
        .order("created_at", { ascending: true })
    : { data: [] };

  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  return {
    event,
    registry: registry as PublicRegistry | null,
    registryItems: (registryItems ?? []) as PublicRegistryItem[],
    rsvps: (rsvps ?? []) as PublicRSVP[],
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-MY", {
    currency: "MYR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function mapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

function wazeUrl(location: string) {
  return `https://waze.com/ul?q=${encodeURIComponent(location)}`;
}

const rsvpStatusColors: Record<string, string> = {
  yes: "bg-emerald-50 text-emerald-700",
  maybe: "bg-amber-50 text-amber-700",
  no: "bg-stone-100 text-stone-500",
};

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicEvent(slug);
  if (!data) notFound();

  const { event, registry, registryItems, rsvps } = data;
  const confirmedCount = rsvps
    .filter((r) => r.status === "yes")
    .reduce((sum, r) => sum + r.party_size, 0);
  const hasRegistry = registryItems.length > 0;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">

      {/* ── Sticky event nav ── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-stone-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link className="flex items-center gap-2 text-sm font-semibold text-white" href="/">
            <span className="grid size-7 place-items-center rounded-full bg-brand">
              <Sparkles className="size-3.5 text-white" />
            </span>
            <span className="hidden md:inline">Otaevent</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {[
              { label: "Details", href: "#details" },
              { label: "RSVP", href: "#rsvp" },
              ...(hasRegistry ? [{ label: "Registry", href: "#registry" }] : []),
              { label: "Guests", href: "#guests" },
            ].map(({ label, href }) => (
              <a
                className="rounded-full px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
                href={href}
                key={label}
              >
                {label}
              </a>
            ))}
          </nav>

          <a
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
            href="#rsvp"
          >
            RSVP Now
          </a>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section
          className="relative bg-stone-950 text-white"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(28,25,23,0.22) 0%, rgba(28,25,23,0.78) 60%, rgba(28,25,23,0.96) 100%), url('https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1800&q=82')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 md:px-8 md:pb-16 md:pt-20">
            <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-end">
              {/* Left — event info */}
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-md">
                  <BadgeCheck className="size-4 text-brand" />
                  {event.services.slice(0, 3).join(" · ")}
                </span>
                <h1 className="mt-5 text-5xl font-semibold leading-[0.95] tracking-normal md:text-7xl">
                  {event.name}
                </h1>
                {event.details && (
                  <p className="mt-5 max-w-xl text-lg leading-8 text-white/80">
                    {event.details}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
                    href="#rsvp"
                  >
                    RSVP Now
                    <ArrowRight className="size-4" />
                  </a>
                  <a
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                    href="#details"
                  >
                    View Details
                  </a>
                </div>
              </div>

              {/* Right — summary card */}
              <aside className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                  The highlights
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                    <CalendarDays className="size-4 shrink-0 text-brand" />
                    <div>
                      <p className="text-xs text-white/50">Date</p>
                      <p className="text-sm font-semibold">{formatDate(event.event_date)}</p>
                    </div>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                      <MapPin className="size-4 shrink-0 text-brand" />
                      <div>
                        <p className="text-xs text-white/50">Location</p>
                        <p className="text-sm font-semibold">{event.location}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                    <UsersRound className="size-4 shrink-0 text-brand" />
                    <div>
                      <p className="text-xs text-white/50">Capacity</p>
                      <p className="text-sm font-semibold">Up to {event.capacity} guests</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                    <CircleDollarSign className="size-4 shrink-0 text-brand" />
                    <div>
                      <p className="text-xs text-white/50">Budget</p>
                      <p className="text-sm font-semibold">{formatCurrency(event.budget)}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-center text-xs text-white/40">
                  {confirmedCount > 0 ? `${confirmedCount} confirmed so far` : "Be the first to RSVP"}
                </p>
              </aside>
            </div>
          </div>
        </section>

        {/* ── Details ── */}
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14" id="details">
          <p className="text-sm font-semibold text-brand">Event details</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
            Everything you need to know
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Date */}
            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
              <CalendarDays className="size-5 text-brand" />
              <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-stone-400">Date</p>
              <h3 className="mt-2 text-lg font-semibold tracking-normal leading-6">
                {formatDate(event.event_date)}
              </h3>
            </article>

            {/* Location */}
            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
              <MapPin className="size-5 text-brand" />
              <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-stone-400">Location</p>
              <h3 className="mt-2 text-lg font-semibold tracking-normal leading-6">
                {event.location ?? "To be announced"}
              </h3>
              {event.location && (
                <div className="mt-4 flex gap-2">
                  <a
                    className="inline-flex items-center gap-1.5 rounded-full bg-stone-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-stone-700"
                    href={mapsUrl(event.location)}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="size-3" />
                    Google Maps
                  </a>
                  <a
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-surface-soft"
                    href={wazeUrl(event.location)}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Waze
                  </a>
                </div>
              )}
            </article>

            {/* Services */}
            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
              <Sparkles className="size-5 text-brand" />
              <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-stone-400">Services</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {event.services.map((service) => (
                  <span
                    className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700"
                    key={service}
                  >
                    {service}
                  </span>
                ))}
              </div>
            </article>

            {/* Guest count */}
            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
              <UsersRound className="size-5 text-brand" />
              <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-stone-400">Capacity</p>
              <h3 className="mt-2 text-lg font-semibold tracking-normal">
                Up to {event.capacity} guests
              </h3>
              {confirmedCount > 0 && (
                <p className="mt-2 text-sm text-stone-500">
                  {confirmedCount} confirmed · {Math.max(0, event.capacity - confirmedCount)} spots remaining
                </p>
              )}
            </article>
          </div>
        </section>

        {/* ── RSVP ── */}
        <section className="border-y border-line bg-white" id="rsvp">
          <div className="mx-auto grid max-w-7xl gap-0 px-4 md:grid-cols-[0.85fr_1.15fr] md:px-8">
            {/* Dark info panel */}
            <div className="rounded-2xl bg-stone-950 p-8 text-white md:my-8 md:rounded-2xl">
              <p className="text-sm font-semibold text-brand">RSVP</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
                Let the host know
              </h2>
              <p className="mt-4 leading-7 text-white/65">
                Quick and easy — name, attendance, party size, and any dietary notes.
                The host will confirm before the event.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                  <CalendarDays className="size-4 text-brand" />
                  <div>
                    <p className="text-xs text-white/50">Event date</p>
                    <p className="text-sm font-semibold">{formatDate(event.event_date)}</p>
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                    <MapPin className="size-4 text-brand" />
                    <div>
                      <p className="text-xs text-white/50">Venue</p>
                      <p className="text-sm font-semibold">{event.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                  <UsersRound className="size-4 text-brand" />
                  <div>
                    <p className="text-xs text-white/50">Confirmed so far</p>
                    <p className="text-sm font-semibold">
                      {confirmedCount > 0 ? `${confirmedCount} guests` : "Be the first"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="py-8 md:pl-8">
              <RsvpForm eventId={event.id} slug={slug} />
            </div>
          </div>
        </section>

        {/* ── Registry ── */}
        {hasRegistry && (
          <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14" id="registry">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-brand">Registry</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
                  {registry?.title ?? "Gift registry"}
                </h2>
                {registry?.note && (
                  <p className="mt-2 max-w-2xl text-stone-600">{registry.note}</p>
                )}
              </div>
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-rose-50">
                <Gift className="size-5 text-brand" />
              </span>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {registryItems.map((item) => {
                const remaining = item.target_quantity - item.claimed_quantity;
                const isComplete = remaining <= 0;
                const pct = Math.min(100, (item.claimed_quantity / item.target_quantity) * 100);

                return (
                  <article className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line" key={item.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                          Gift idea
                        </p>
                        <h3 className="mt-2 text-lg font-semibold tracking-normal leading-6">
                          {item.title}
                        </h3>
                      </div>
                      <span
                        className={`mt-1 shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          isComplete
                            ? "bg-stone-100 text-stone-500"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {isComplete ? "Claimed" : "Available"}
                      </span>
                    </div>

                    {item.description && (
                      <p className="mt-3 text-sm leading-6 text-stone-600">{item.description}</p>
                    )}

                    <div className="mt-4 rounded-xl bg-surface-soft p-3">
                      <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
                        <div
                          className="h-full rounded-full bg-brand transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-stone-500">
                        {item.claimed_quantity} of {item.target_quantity} claimed
                      </p>
                    </div>

                    {item.external_url && (
                      <a
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                        href={item.external_url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <ExternalLink className="size-3" />
                        View item
                      </a>
                    )}

                    <div className="mt-auto pt-4">
                      <RegistryClaimForm
                        claimedQuantity={item.claimed_quantity}
                        isComplete={isComplete}
                        itemId={item.id}
                        slug={slug}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Guest list ── */}
        {rsvps.length > 0 && (
          <section className="border-t border-line" id="guests">
            <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
              <p className="text-sm font-semibold text-brand">Guest list</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                {confirmedCount} confirmed
              </h2>
              <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {rsvps.map((rsvp) => (
                  <div
                    className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-line"
                    key={rsvp.id}
                  >
                    <div>
                      <p className="font-semibold tracking-normal">{rsvp.guest_name}</p>
                      {rsvp.note && (
                        <p className="mt-0.5 text-xs text-stone-500 line-clamp-1">{rsvp.note}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-medium text-stone-500">
                        {rsvp.party_size > 1 ? `+${rsvp.party_size - 1}` : ""}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${rsvpStatusColors[rsvp.status] ?? "bg-stone-100 text-stone-500"}`}>
                        {rsvp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-6 md:px-8">
            <Link className="flex items-center gap-2 text-sm font-semibold" href="/">
              <span className="grid size-7 place-items-center rounded-full bg-brand">
                <Sparkles className="size-3.5 text-white" />
              </span>
              Otaevent
            </Link>
            <Link
              className="text-sm font-semibold text-stone-500 transition hover:text-stone-950"
              href="/dashboard/customer"
            >
              Host dashboard →
            </Link>
          </div>
        </footer>
      </main>

      {/* ── Mobile sticky CTA ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur-xl md:hidden">
        <a
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-brand text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
          href="#rsvp"
        >
          RSVP Now
        </a>
      </div>
    </div>
  );
}
