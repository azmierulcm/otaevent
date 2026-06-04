import Link from "next/link";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <div className="flex items-center gap-3">
      <span className="hidden rounded-full bg-surface-soft px-3 py-2 text-sm font-semibold text-stone-600 md:inline-flex">
        {displayName}
      </span>
      <form action={signOut}>
        <Button type="submit" variant="secondary">
          Sign out
        </Button>
      </form>
    </div>
  );
}
