import Link from "next/link";
import { redirect } from "next/navigation";
import { HeartHandshake, Sparkles, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { VendorSetupForm } from "./vendor-setup-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "customer";
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  // Owners skip onboarding
  if (role === "owner") redirect("/dashboard/owner");

  // Vendors who already have a profile skip onboarding
  if (role === "vendor") {
    const { data: vendorProfile } = await supabase
      .from("vendor_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (vendorProfile) redirect("/dashboard/vendor");
  }

  // Customers who already have events have completed onboarding
  if (role === "customer") {
    const { count } = await supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", user.id);

    if (count && count > 0) redirect("/dashboard/customer");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 shadow-sm backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link className="flex items-center gap-2 text-lg font-semibold tracking-normal" href="/">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
              <Sparkles className="size-4" />
            </span>
            Otaevent
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-12">
        {role === "vendor" ? (
          <div className="w-full max-w-lg">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Store className="size-3.5" />
              Vendor account
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal">
              Welcome, {firstName}!
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Let&apos;s set up your vendor profile so planners can find you. You&apos;ll be able to add photos and more details from your dashboard.
            </p>
            <VendorSetupForm />
          </div>
        ) : (
          <div className="w-full max-w-sm text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-rose-100">
              <HeartHandshake className="size-8 text-rose-600" />
            </span>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
              Planner account
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal">
              Welcome, {firstName}!
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-500">
              You&apos;re all set. Create your first event request and start receiving bids from verified vendors.
            </p>
            <Button asChild className="mt-8 w-full">
              <Link href="/dashboard/customer">Go to my dashboard</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
