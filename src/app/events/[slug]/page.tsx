import Link from "next/link";
import { CalendarDays, Gift, MapPin, PartyPopper, UsersRound } from "lucide-react";

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
  return demoCustomerEvents.map((event) => ({
    slug: event.share_slug,
  }));
}

async function getPublicEvent(slug: string) {
  if (!isSupabaseConfigured()) {
    return getDemoPublicEvent(slug);
  }

  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("share_slug", slug)
    .maybeSingle();

  if (!event) {
    return getDemoPublicEvent(slug);
  }

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
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event, registry, registryItems, rsvps } = await getPublicEvent(slug);
  const yesCount = rsvps
    .filter((rsvp) => rsvp.status === "yes")
    .reduce((sum, rsvp) => sum + rsvp.party_size, 0);

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="border-b border-white/20 bg-stone-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link className="text-lg font-semibold tracking-normal" href="/">
            Otaevent
          </Link>
          <Link className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/15" href="/dashboard/customer">
            Host dashboard
          </Link>
        </div>
      </header>

      <main>
        <section
          className="relative bg-stone-950 text-white"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(28,25,23,0.28), rgba(28,25,23,0.86)), url('https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1800&q=82')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="mx-auto flex min-h-[62vh] max-w-7xl flex-col justify-end px-4 pb-10 pt-20 md:px-8">
            <p className="mb-4 inline-flex w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-md">
              Public event page
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-normal md:text-7xl">
              {event.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">{event.details}</p>
            <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: formatDate(event.event_date), icon: CalendarDays },
                { label: event.location ?? "Location TBA", icon: MapPin },
                { label: `${event.capacity} max guests`, icon: UsersRound },
                { label: formatCurrency(event.budget), icon: PartyPopper },
              ].map(({ label, icon: Icon }) => (
                <div className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur-md" key={label}>
                  <Icon className="size-5 text-white/80" />
                  <p className="mt-4 text-sm font-semibold leading-5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:py-12">
          <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line md:sticky md:top-6 md:h-fit">
            <p className="text-sm font-semibold text-brand">RSVP</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">Let the host know</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {yesCount} confirmed guests so far. RSVP updates write to the event RSVP table when Supabase is configured.
            </p>
            <div className="mt-6">
              <RsvpForm eventId={event.id} slug={slug} />
            </div>
          </aside>

          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-brand">Registry</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                    {registry?.title ?? "Event registry"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {registry?.note ?? "Guests can claim registry items for this event."}
                  </p>
                </div>
                <span className="grid size-12 place-items-center rounded-full bg-rose-50 text-brand">
                  <Gift className="size-5" />
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                {registryItems.map((item) => {
                  const remaining = item.target_quantity - item.claimed_quantity;
                  const isComplete = remaining <= 0;

                  return (
                    <article className="rounded-2xl border border-line p-4" key={item.id}>
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold tracking-normal">{item.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>
                          <div className="mt-4 h-2 max-w-sm overflow-hidden rounded-full bg-stone-100">
                            <div
                              className="h-full rounded-full bg-brand"
                              style={{
                                width: `${Math.min(100, (item.claimed_quantity / item.target_quantity) * 100)}%`,
                              }}
                            />
                          </div>
                          <p className="mt-2 text-xs font-semibold text-stone-500">
                            {item.claimed_quantity} of {item.target_quantity} claimed
                          </p>
                        </div>
                        <span className="rounded-full bg-surface-soft px-3 py-1 text-xs font-semibold text-stone-600">
                          {isComplete ? "Complete" : `${remaining} left`}
                        </span>
                      </div>
                      <RegistryClaimForm
                        claimedQuantity={item.claimed_quantity}
                        isComplete={isComplete}
                        itemId={item.id}
                        slug={slug}
                      />
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
              <p className="text-sm font-semibold text-brand">Guest list</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal">Recent RSVPs</h2>
              <div className="mt-5 grid gap-3">
                {rsvps.map((rsvp) => (
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-soft px-4 py-3" key={rsvp.id}>
                    <div>
                      <p className="font-semibold tracking-normal">{rsvp.guest_name}</p>
                      <p className="text-sm text-stone-600">{rsvp.party_size} guest(s)</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-600">
                      {rsvp.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
