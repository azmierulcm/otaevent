"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { signIn } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, null);

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
          <Link className="text-sm font-semibold text-stone-500 transition hover:text-stone-950" href="/auth/signup">
            Create account
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-semibold tracking-normal">Sign in</h1>
          <p className="mt-2 text-sm text-stone-500">
            Don&apos;t have an account?{" "}
            <Link className="font-semibold text-brand hover:underline" href="/auth/signup">
              Create one
            </Link>
          </p>

          <form action={formAction} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" htmlFor="email">
                Email
              </label>
              <input
                autoComplete="email"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" htmlFor="password">
                Password
              </label>
              <input
                autoComplete="current-password"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                type="password"
              />
            </div>

            {state?.error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {state.error}
              </p>
            ) : null}

            <Button className="w-full" disabled={pending} type="submit">
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
