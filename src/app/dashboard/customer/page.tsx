import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Gift,
  Inbox,
  MapPin,
  MessageCircle,
  UsersRound,
} from "lucide-react";

import { BidStream } from "@/components/customer/bid-stream";
import { EventCreationFlow } from "@/components/customer/event-creation-flow";
import { UserNav } from "@/components/shared/user-nav";
import { Button } from "@/components/ui/button";
import {
  demoBids,
  demoCustomerEvents,
  type CustomerBid,
  type CustomerEvent,
} from "@/lib/customer/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getCustomerDashboardData() {
  if (!isSupabaseConfigured()) {
    return {
      events: demoCustomerEvents,
      bids: demoBids,
      mode: "Demo mode",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      events: demoCustomerEvents,
      bids: demoBids,
      mode: "Demo mode",
    };
  }

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("customer_id", user.id)
    .order("event_date", { ascending: true });

  const eventRows = (events ?? []) as CustomerEvent[];
  const eventIds = eventRows.map((event) => event.id);

  if (eventIds.length === 0) {
    return {
      events: [],
      bids: [],
      mode: "Live Supabase",
    };
  }

  const { data: bids } = await supabase
    .from("bids")
    .select("id,event_id,amount,message,status,created_at,vendor_id")
    .in("event_id", eventIds)
    .order("created_at", { ascending: false });

  return {
    events: eventRows,
    bids: (bids ?? []).map((bid) => ({
      id: bid.id,
      event_id: bid.event_id,
      vendor_name: "Vendor",
      amount: bid.amount,
      message: bid.message,
      status: bid.status,
      created_at: bid.created_at,
    })) satisfies CustomerBid[],
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

export default async function CustomerDashboardPage() {
  const { events, bids, mode } = await getCustomerDashboardData();
  const activeEvents = events.filter((event) => event.status === "open").length;
  const totalBudget = events.reduce((sum, event) => sum + event.budget, 0);
  const pendingBids = bids.filter((bid) => bid.status === "pending").length;
  const nextEvent = events[0];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link className="text-lg font-semibold tracking-normal" href="/">
            Otaevent
          </Link>
          <div className="flex items-center gap-3">
            <EventCreationFlow />
            <UserNav />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold text-brand">Customer dashboard</p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-normal md:text-5xl">
              Plan, compare bids, and keep guests in sync.
            </h1>
          </div>
          <aside className="rounded-2xl bg-stone-950 p-5 text-white shadow-airbnb">
            <p className="text-sm font-medium text-white/60">Next event</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal">
              {nextEvent?.name ?? "Create your first event"}
            </h2>
            <div className="mt-5 grid gap-3 text-sm text-white/75">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4" />
                {nextEvent ? formatDate(nextEvent.event_date) : "No date yet"}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" />
                {nextEvent?.location ?? "Choose a location"}
              </span>
            </div>
          </aside>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Active events", value: activeEvents, icon: CalendarDays },
            { label: "Total budget", value: formatCurrency(totalBudget), icon: CircleDollarSign },
            { label: "Pending bids", value: pendingBids, icon: Inbox },
            { label: "Guest capacity", value: events.reduce((sum, event) => sum + event.capacity, 0), icon: UsersRound },
          ].map(({ label, value, icon: Icon }) => (
            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line" key={label}>
              <Icon className="size-5 text-brand" />
              <p className="mt-5 text-2xl font-semibold">{value}</p>
              <p className="mt-1 text-sm font-medium text-stone-500">{label}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-brand">Events</p>
                <h2 className="text-2xl font-semibold tracking-normal">Your requests</h2>
              </div>
              <EventCreationFlow />
            </div>

            <div className="mt-5 space-y-4">
              {events.map((event) => (
                <article className="rounded-2xl border border-line p-4" key={event.id}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold tracking-normal">{event.name}</h3>
                        <span className="rounded-full bg-surface-soft px-3 py-1 text-xs font-semibold text-stone-600">
                          {event.status}
                        </span>
                      </div>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{event.details}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {event.services.map((service) => (
                          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700" key={service}>
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid min-w-44 gap-2 text-sm text-stone-600">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="size-4" />
                        {formatDate(event.event_date)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <UsersRound className="size-4" />
                        {event.capacity} guests
                      </span>
                      <span className="inline-flex items-center gap-2 font-semibold text-stone-950">
                        <CircleDollarSign className="size-4" />
                        {formatCurrency(event.budget)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/events/${event.share_slug}`}>
                        <Gift className="size-4" />
                        Public RSVP page
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MessageCircle className="size-4" />
                      View bid stream
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-brand">Inbox</p>
                <h2 className="text-2xl font-semibold tracking-normal">Vendor bids</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <div className="mt-5">
              <BidStream
                eventIds={events.map((e) => e.id)}
                initialBids={bids}
              />
            </div>
          </aside>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand">Guest tools</p>
              <h2 className="text-2xl font-semibold tracking-normal">RSVP and registry are public-ready</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                Each shared event gets a fluid guest page for RSVP collection and registry item claiming.
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href={`/events/${nextEvent?.share_slug ?? "garden-engagement"}`}>
                Preview guest page
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
