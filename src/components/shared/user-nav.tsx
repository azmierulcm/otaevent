import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/supabase/types";

const roleBadge: Record<AppRole, { label: string; className: string }> = {
  customer: { label: "Planner", className: "bg-rose-100 text-rose-700" },
  vendor: { label: "Vendor", className: "bg-emerald-100 text-emerald-700" },
  owner: { label: "Owner", className: "bg-violet-100 text-violet-700" },
};

export async function UserNav() {
  if (!isSupabaseConfigured()) {
    return (
      <Button asChild variant="secondary">
        <Link href="/auth/login">Sign in</Link>
      </Button>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Button asChild variant="secondary">
        <Link href="/auth/login">Sign in</Link>
      </Button>
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name ?? user.email ?? "Account";
  const role = profile?.role ?? "customer";
  const badge = roleBadge[role];

  return (
    <div className="flex items-center gap-2">
      <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold md:inline-flex ${badge.className}`}>
        {badge.label}
      </span>
      <span className="hidden rounded-full bg-surface-soft px-3 py-2 text-sm font-semibold text-stone-600 md:inline-flex">
        {displayName}
      </span>
      <Button asChild variant="secondary" size="sm">
        <Link href={`/dashboard/${role}`}>
          <LayoutDashboard className="size-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
      </Button>
      <form action={signOut}>
        <Button type="submit" variant="secondary" size="sm">
          Sign out
        </Button>
      </form>
    </div>
  );
}
