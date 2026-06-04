import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  ShieldCheck,
  Store,
  UsersRound,
} from "lucide-react";

import { AdBlockEditor } from "@/components/owner/ad-block-editor";
import { ArticleEditor } from "@/components/owner/article-editor";
import { UserRoleForm } from "@/components/owner/user-role-form";
import { UserNav } from "@/components/shared/user-nav";
import { Button } from "@/components/ui/button";
import type { CustomerBid, CustomerEvent } from "@/lib/customer/demo-data";
import {
  demoAdBlocks,
  demoAdminTables,
  demoArticles,
  type OwnerAdBlock,
  type OwnerArticle,
  type OwnerUser,
} from "@/lib/owner/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { VendorProfile } from "@/lib/vendor/demo-data";

export const dynamic = "force-dynamic";

async function getOwnerDashboardData() {
  if (!isSupabaseConfigured()) {
    return {
      users: demoAdminTables.users,
      vendors: demoAdminTables.vendors,
      events: demoAdminTables.events,
      bids: demoAdminTables.bids,
      articles: demoArticles,
      adBlocks: demoAdBlocks,
      mode: "Demo mode",
    };
  }

  const supabase = await createClient();

  const [
    usersResponse,
    vendorsResponse,
    eventsResponse,
    bidsResponse,
    articlesResponse,
    adBlocksResponse,
  ] = await Promise.all([
    supabase.from("users").select("id,email,full_name,role,created_at").order("created_at", { ascending: false }),
    supabase.from("vendor_profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("events").select("*").order("created_at", { ascending: false }),
    supabase.from("bids").select("*").order("created_at", { ascending: false }),
    supabase.from("articles").select("*").order("created_at", { ascending: false }),
    supabase.from("ad_blocks").select("*").order("created_at", { ascending: false }),
  ]);

  return {
    users: (usersResponse.data ?? demoAdminTables.users) as OwnerUser[],
    vendors: (vendorsResponse.data ?? demoAdminTables.vendors) as VendorProfile[],
    events: (eventsResponse.data ?? demoAdminTables.events).map((event) => ({
      ...event,
      share_slug: event.share_slug ?? event.id,
    })) as CustomerEvent[],
    bids: (bidsResponse.data ?? demoAdminTables.bids).map((bid) => ({
      id: bid.id,
      event_id: bid.event_id,
      vendor_name: "Vendor",
      amount: bid.amount,
      message: bid.message,
      status: bid.status,
      created_at: bid.created_at,
    })) as CustomerBid[],
    articles: (articlesResponse.data ?? demoArticles) as OwnerArticle[],
    adBlocks: (adBlocksResponse.data ?? demoAdBlocks) as OwnerAdBlock[],
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

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-surface-soft px-3 py-1 text-xs font-semibold text-stone-600">
      {children}
    </span>
  );
}

export default async function OwnerDashboardPage() {
  const { users, vendors, events, bids, articles, adBlocks, mode } =
    await getOwnerDashboardData();
  const publishedArticles = articles.filter((article) => article.status === "published").length;
  const activeAds = adBlocks.filter((adBlock) => adBlock.is_active).length;
  const totalEventBudget = events.reduce((sum, event) => sum + event.budget, 0);
  const leadArticle = articles[0] ?? demoArticles[0];

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
            <p className="text-sm font-semibold text-brand">Platform owner</p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-normal md:text-5xl">
              Publish stories, manage inventory, and keep the marketplace clean.
            </h1>
          </div>

          <aside className="overflow-hidden rounded-2xl bg-stone-950 text-white shadow-airbnb">
            <div className="relative min-h-72 p-5">
              {leadArticle.hero_image_path?.startsWith("http") ? (
                <Image
                  alt=""
                  className="object-cover opacity-45"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  src={leadArticle.hero_image_path}
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
              <div className="relative flex min-h-64 flex-col justify-end">
                <StatusPill>{leadArticle.status}</StatusPill>
                <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-normal">
                  {leadArticle.title}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
                  {leadArticle.excerpt}
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Users", value: users.length, icon: UsersRound },
            { label: "Vendors", value: vendors.length, icon: Store },
            { label: "Published stories", value: publishedArticles, icon: Newspaper },
            { label: "Active ads", value: activeAds, icon: Megaphone },
          ].map(({ label, value, icon: Icon }) => (
            <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line" key={label}>
              <Icon className="size-5 text-brand" />
              <p className="mt-5 text-2xl font-semibold">{value}</p>
              <p className="mt-1 text-sm font-medium text-stone-500">{label}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold text-brand">Editorial CMS</p>
                <h2 className="text-2xl font-semibold tracking-normal">Article editor</h2>
              </div>
              <span className="rounded-full bg-surface-soft px-3 py-2 text-xs font-semibold text-stone-600">
                Typography-ready rich content
              </span>
            </div>
            <div className="mt-6">
              <ArticleEditor article={leadArticle} />
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
              <p className="text-sm font-semibold text-brand">Editorial stream</p>
              <h2 className="text-2xl font-semibold tracking-normal">Stories</h2>
              <div className="mt-5 grid gap-4">
                {articles.map((article) => (
                  <article className="rounded-2xl border border-line p-4" key={article.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold tracking-normal">{article.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-stone-600">{article.excerpt}</p>
                      </div>
                      <StatusPill>{article.status}</StatusPill>
                    </div>
                    <div className="prose prose-stone mt-4 max-w-none text-sm">
                      <p>{article.body_md}</p>
                    </div>
                    <p className="mt-4 text-xs font-semibold text-stone-500">
                      Published {formatDate(article.published_at)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
              <p className="text-sm font-semibold text-brand">Ad space</p>
              <h2 className="text-2xl font-semibold tracking-normal">Native placements</h2>
              <div className="mt-5 grid gap-4">
                {adBlocks.map((adBlock) => (
                  <article className="rounded-2xl bg-surface-soft p-4" key={adBlock.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold tracking-normal">{adBlock.title}</h3>
                        <p className="mt-1 text-sm text-stone-600">{adBlock.placement}</p>
                      </div>
                      <StatusPill>{adBlock.is_active ? "active" : "paused"}</StatusPill>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-6 border-t border-line pt-6">
                <AdBlockEditor />
              </div>
            </section>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand">Admin dashboard</p>
              <h2 className="text-2xl font-semibold tracking-normal">Management tables</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-stone-600">
              <span className="rounded-full bg-surface-soft px-3 py-2">{events.length} events</span>
              <span className="rounded-full bg-surface-soft px-3 py-2">{bids.length} bids</span>
              <span className="rounded-full bg-surface-soft px-3 py-2">
                {formatCurrency(totalEventBudget)} managed budget
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="overflow-hidden rounded-2xl border border-line">
              <div className="flex items-center gap-2 bg-surface-soft px-4 py-3">
                <ShieldCheck className="size-4 text-brand" />
                <h3 className="font-semibold tracking-normal">Users</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="border-b border-line text-xs uppercase text-stone-500">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr className="border-b border-line last:border-b-0" key={user.id}>
                        <td className="px-4 py-3 font-semibold">{user.full_name ?? "No name"}</td>
                        <td className="px-4 py-3 text-stone-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <StatusPill>{user.role}</StatusPill>
                        </td>
                        <td className="px-4 py-3">
                          <UserRoleForm role={user.role} userId={user.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-line">
              <div className="flex items-center gap-2 bg-surface-soft px-4 py-3">
                <BadgeCheck className="size-4 text-brand" />
                <h3 className="font-semibold tracking-normal">Vendors</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="border-b border-line text-xs uppercase text-stone-500">
                    <tr>
                      <th className="px-4 py-3">Business</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Services</th>
                      <th className="px-4 py-3">Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor) => (
                      <tr className="border-b border-line last:border-b-0" key={vendor.id}>
                        <td className="px-4 py-3 font-semibold">{vendor.business_name}</td>
                        <td className="px-4 py-3 text-stone-600">{vendor.base_location}</td>
                        <td className="px-4 py-3 text-stone-600">{vendor.service_categories.join(", ")}</td>
                        <td className="px-4 py-3">
                          <StatusPill>{vendor.is_verified ? "yes" : "no"}</StatusPill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-line">
              <div className="flex items-center gap-2 bg-surface-soft px-4 py-3">
                <CalendarDays className="size-4 text-brand" />
                <h3 className="font-semibold tracking-normal">Events</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="border-b border-line text-xs uppercase text-stone-500">
                    <tr>
                      <th className="px-4 py-3">Event</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Budget</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr className="border-b border-line last:border-b-0" key={event.id}>
                        <td className="px-4 py-3 font-semibold">{event.name}</td>
                        <td className="px-4 py-3 text-stone-600">{formatDate(event.event_date)}</td>
                        <td className="px-4 py-3 text-stone-600">{formatCurrency(event.budget)}</td>
                        <td className="px-4 py-3">
                          <StatusPill>{event.status}</StatusPill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-line">
              <div className="flex items-center gap-2 bg-surface-soft px-4 py-3">
                <LayoutDashboard className="size-4 text-brand" />
                <h3 className="font-semibold tracking-normal">Bids</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="border-b border-line text-xs uppercase text-stone-500">
                    <tr>
                      <th className="px-4 py-3">Vendor</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((bid) => (
                      <tr className="border-b border-line last:border-b-0" key={bid.id}>
                        <td className="px-4 py-3 font-semibold">{bid.vendor_name}</td>
                        <td className="px-4 py-3 text-stone-600">{formatCurrency(bid.amount)}</td>
                        <td className="px-4 py-3">
                          <StatusPill>{bid.status}</StatusPill>
                        </td>
                        <td className="px-4 py-3 text-stone-600">{bid.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-stone-950 p-5 text-white shadow-airbnb">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-white/10">
              <FileText className="size-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-white/60">Owner operations</p>
              <h2 className="text-2xl font-semibold tracking-normal">
                Editorial, ads, users, vendors, events, and bids now share one platform cockpit.
              </h2>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
