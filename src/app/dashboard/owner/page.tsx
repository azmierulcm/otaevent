import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Megaphone,
  Newspaper,
  Store,
  UsersRound,
} from "lucide-react";

import { AdBlockEditor } from "@/components/owner/ad-block-editor";
import { ArticleEditor } from "@/components/owner/article-editor";
import { UserRoleForm } from "@/components/owner/user-role-form";
import { SiteNavbar } from "@/components/shared/site-navbar";
import { UserNav } from "@/components/shared/user-nav";
import { Button } from "@/components/ui/button";
import type { CustomerBid, CustomerEvent } from "@/lib/customer/demo-data";
import type { OwnerArticle, OwnerAdBlock, OwnerUser } from "@/lib/owner/demo-data";
import { createClient } from "@/lib/supabase/server";
import type { VendorProfile } from "@/lib/vendor/demo-data";
import {
  verifyVendorAction,
  deleteUserAction,
  updateEventStatusFormAction,
} from "@/app/actions/owner";
import type { EventStatus } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

async function getAdminData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "owner") redirect(`/dashboard/${profile?.role ?? "customer"}`);

  const [
    usersRes, vendorsRes, eventsRes, bidsRes, articlesRes, adBlocksRes,
  ] = await Promise.all([
    supabase.from("users").select("id,email,full_name,role,created_at").order("created_at", { ascending: false }),
    supabase.from("vendor_profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("events").select("*").order("created_at", { ascending: false }),
    supabase.from("bids").select("*").order("created_at", { ascending: false }),
    supabase.from("articles").select("*").order("created_at", { ascending: false }),
    supabase.from("ad_blocks").select("*").order("created_at", { ascending: false }),
  ]);

  return {
    users: (usersRes.data ?? []) as OwnerUser[],
    vendors: (vendorsRes.data ?? []) as VendorProfile[],
    events: (eventsRes.data ?? []).map((e) => ({ ...e, share_slug: e.share_slug ?? e.id })) as CustomerEvent[],
    bids: (bidsRes.data ?? []).map((b) => ({
      id: b.id, event_id: b.event_id, vendor_name: "Vendor",
      amount: b.amount, message: b.message, status: b.status, created_at: b.created_at,
    })) as CustomerBid[],
    articles: (articlesRes.data ?? []) as OwnerArticle[],
    adBlocks: (adBlocksRes.data ?? []) as OwnerAdBlock[],
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-MY", { currency: "MYR", maximumFractionDigits: 0, style: "currency" }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function StatusPill({ children, color = "default" }: { children: React.ReactNode; color?: "default" | "green" | "amber" | "red" | "blue" }) {
  const colors = {
    default: "bg-surface-soft text-stone-600",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
}

const eventStatusColors: Record<string, "green" | "amber" | "red" | "blue" | "default"> = {
  open: "green", matched: "blue", completed: "default", cancelled: "red", draft: "amber",
};

export default async function OwnerDashboardPage() {
  const { users, vendors, events, bids, articles, adBlocks } = await getAdminData();

  const publishedArticles = articles.filter((a) => a.status === "published").length;
  const activeAds = adBlocks.filter((a) => a.is_active).length;
  const totalEventBudget = events.reduce((sum, e) => sum + e.budget, 0);
  const verifiedVendors = vendors.filter((v) => v.is_verified).length;
  const leadArticle = articles[0];

  return (
    <div className="min-h-screen bg-background pb-24">
      <SiteNavbar right={<UserNav />} />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8 md:py-10">

        {/* ── Platform overview ── */}
        <section>
          <p className="text-sm font-semibold text-brand">Admin dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal md:text-4xl">Platform control centre</h1>

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Total users", value: users.length, icon: UsersRound },
              { label: "Verified vendors", value: `${verifiedVendors} / ${vendors.length}`, icon: BadgeCheck },
              { label: "Live events", value: events.filter((e) => e.status === "open").length, icon: CalendarDays },
              { label: "Platform budget", value: formatCurrency(totalEventBudget), icon: CircleDollarSign },
            ].map(({ label, value, icon: Icon }) => (
              <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line" key={label}>
                <Icon className="size-5 text-brand" />
                <p className="mt-5 text-2xl font-semibold">{value}</p>
                <p className="mt-1 text-sm font-medium text-stone-500">{label}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Users ── */}
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-line">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
            <div className="flex items-center gap-2">
              <UsersRound className="size-4 text-brand" />
              <h2 className="font-semibold tracking-normal">Users</h2>
            </div>
            <span className="text-sm text-stone-500">{users.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase text-stone-400">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Change role</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td className="px-5 py-8 text-center text-stone-400" colSpan={6}>No users yet</td></tr>
                ) : users.map((user) => (
                  <tr className="border-b border-line last:border-b-0" key={user.id}>
                    <td className="px-5 py-3 font-semibold">{user.full_name ?? "—"}</td>
                    <td className="px-5 py-3 text-stone-600">{user.email}</td>
                    <td className="px-5 py-3">
                      <StatusPill color={user.role === "owner" ? "blue" : user.role === "vendor" ? "green" : "default"}>
                        {user.role}
                      </StatusPill>
                    </td>
                    <td className="px-5 py-3 text-stone-500">{formatDate(user.created_at)}</td>
                    <td className="px-5 py-3"><UserRoleForm role={user.role} userId={user.id} /></td>
                    <td className="px-5 py-3">
                      <form action={deleteUserAction.bind(null, user.id)}>
                        <button className="rounded-full px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50" type="submit">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Vendors ── */}
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-line">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
            <div className="flex items-center gap-2">
              <Store className="size-4 text-brand" />
              <h2 className="font-semibold tracking-normal">Vendors</h2>
            </div>
            <span className="text-sm text-stone-500">{vendors.length} total · {verifiedVendors} verified</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase text-stone-400">
                <tr>
                  <th className="px-5 py-3">Business</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Services</th>
                  <th className="px-5 py-3">Price floor</th>
                  <th className="px-5 py-3">Verified</th>
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr><td className="px-5 py-8 text-center text-stone-400" colSpan={5}>No vendors yet</td></tr>
                ) : vendors.map((vendor) => (
                  <tr className="border-b border-line last:border-b-0" key={vendor.id}>
                    <td className="px-5 py-3 font-semibold">{vendor.business_name}</td>
                    <td className="px-5 py-3 text-stone-600">{vendor.base_location ?? "—"}</td>
                    <td className="px-5 py-3 text-stone-600">{vendor.service_categories.join(", ") || "—"}</td>
                    <td className="px-5 py-3 text-stone-600">
                      {vendor.price_floor ? formatCurrency(vendor.price_floor) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <form action={verifyVendorAction.bind(null, vendor.id, !vendor.is_verified)}>
                        <button
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            vendor.is_verified
                              ? "bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-700"
                              : "bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                          type="submit"
                        >
                          {vendor.is_verified ? "Verified ✓" : "Unverified"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Events ── */}
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-line">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-brand" />
              <h2 className="font-semibold tracking-normal">Events</h2>
            </div>
            <span className="text-sm text-stone-500">{events.length} total · {formatCurrency(totalEventBudget)} budget</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase text-stone-400">
                <tr>
                  <th className="px-5 py-3">Event</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Budget</th>
                  <th className="px-5 py-3">Guests</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Change status</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr><td className="px-5 py-8 text-center text-stone-400" colSpan={6}>No events yet</td></tr>
                ) : events.map((event) => (
                  <tr className="border-b border-line last:border-b-0" key={event.id}>
                    <td className="px-5 py-3 font-semibold">{event.name}</td>
                    <td className="px-5 py-3 text-stone-600">{formatDate(event.event_date)}</td>
                    <td className="px-5 py-3 text-stone-600">{formatCurrency(event.budget)}</td>
                    <td className="px-5 py-3 text-stone-600">{event.capacity}</td>
                    <td className="px-5 py-3">
                      <StatusPill color={eventStatusColors[event.status] ?? "default"}>{event.status}</StatusPill>
                    </td>
                    <td className="px-5 py-3">
                      <EventStatusSelect eventId={event.id} currentStatus={event.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Bids ── */}
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-line">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="size-4 text-brand" />
              <h2 className="font-semibold tracking-normal">Bids</h2>
            </div>
            <span className="text-sm text-stone-500">{bids.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase text-stone-400">
                <tr>
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Message</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {bids.length === 0 ? (
                  <tr><td className="px-5 py-8 text-center text-stone-400" colSpan={5}>No bids yet</td></tr>
                ) : bids.map((bid) => (
                  <tr className="border-b border-line last:border-b-0" key={bid.id}>
                    <td className="px-5 py-3 font-semibold">{bid.vendor_name}</td>
                    <td className="px-5 py-3 text-stone-600">{formatCurrency(bid.amount)}</td>
                    <td className="px-5 py-3">
                      <StatusPill color={eventStatusColors[bid.status] ?? "default"}>{bid.status}</StatusPill>
                    </td>
                    <td className="px-5 py-3 max-w-xs truncate text-stone-600">{bid.message ?? "—"}</td>
                    <td className="px-5 py-3 text-stone-500">{formatDate(bid.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Editorial CMS ── */}
        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
            <div className="flex items-center gap-2">
              <Newspaper className="size-4 text-brand" />
              <div>
                <p className="text-sm font-semibold text-brand">Editorial</p>
                <h2 className="text-2xl font-semibold tracking-normal">Article editor</h2>
              </div>
            </div>
            <div className="mt-6">
              {leadArticle ? (
                <ArticleEditor article={leadArticle} />
              ) : (
                <ArticleEditor article={null} />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Newspaper className="size-4 text-brand" />
                  <h2 className="text-2xl font-semibold tracking-normal">Stories</h2>
                </div>
                <span className="text-xs text-stone-500">{publishedArticles} published</span>
              </div>
              {articles.length === 0 ? (
                <p className="mt-6 py-4 text-center text-sm text-stone-400">No articles yet. Write the first story above.</p>
              ) : (
                <div className="mt-5 grid gap-4">
                  {articles.map((article) => (
                    <article className="rounded-2xl border border-line p-4" key={article.id}>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold tracking-normal">{article.title}</h3>
                        <StatusPill color={article.status === "published" ? "green" : "amber"}>
                          {article.status}
                        </StatusPill>
                      </div>
                      {article.excerpt && (
                        <p className="mt-2 text-sm leading-6 text-stone-600">{article.excerpt}</p>
                      )}
                      <p className="mt-3 text-xs text-stone-400">{formatDate(article.published_at)}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line">
              <div className="flex items-center gap-2">
                <Megaphone className="size-4 text-brand" />
                <div>
                  <p className="text-sm font-semibold text-brand">Ad inventory</p>
                  <h2 className="text-2xl font-semibold tracking-normal">Native placements</h2>
                </div>
              </div>
              {adBlocks.length > 0 && (
                <div className="mt-4 grid gap-3">
                  {adBlocks.map((ad) => (
                    <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-soft px-4 py-3" key={ad.id}>
                      <div>
                        <p className="text-sm font-semibold">{ad.title}</p>
                        <p className="text-xs text-stone-500">{ad.placement}</p>
                      </div>
                      <StatusPill color={ad.is_active ? "green" : "default"}>
                        {ad.is_active ? "active" : "paused"}
                      </StatusPill>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-5 border-t border-line pt-5">
                <AdBlockEditor />
              </div>
            </section>
          </div>
        </section>

        <div className="rounded-2xl bg-stone-950 p-5 text-white shadow-airbnb">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-white/10">
              <FileText className="size-5" />
            </span>
            <p className="text-sm font-medium text-white/60">Admin</p>
            <p className="font-semibold">
              {users.length} users · {vendors.length} vendors · {events.length} events · {bids.length} bids
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function EventStatusSelect({ eventId, currentStatus }: { eventId: string; currentStatus: string }) {
  const statuses: EventStatus[] = ["open", "matched", "completed", "cancelled", "draft"];
  return (
    <form action={updateEventStatusFormAction}>
      <input type="hidden" name="event_id" value={eventId} />
      <select
        className="rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold text-stone-700 focus:outline-none"
        defaultValue={currentStatus}
        name="status"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button className="ml-2 rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold text-white transition hover:bg-stone-700" type="submit">
        Save
      </button>
    </form>
  );
}
