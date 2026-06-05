"use client";

import { useActionState } from "react";
import Link from "next/link";
import { HeartHandshake, Sparkles, Store } from "lucide-react";

import { signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const roles = [
  {
    value: "customer",
    label: "Planner",
    caption: "Create event requests, compare bids, and share RSVP and registry pages.",
    icon: HeartHandshake,
    accent: "bg-rose-500",
  },
  {
    value: "vendor",
    label: "Vendor",
    caption: "Publish a gallery profile, browse open events, and send polished bids.",
    icon: Store,
    accent: "bg-emerald-600",
  },
] as const;

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, null);

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
          <Link className="text-sm font-semibold text-stone-500 transition hover:text-stone-950" href="/auth/login">
            Sign in
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <h1 className="text-3xl font-semibold tracking-normal">Create an account</h1>
          <p className="mt-2 text-sm text-stone-500">
            Already have an account?{" "}
            <Link className="font-semibold text-brand hover:underline" href="/auth/login">
              Sign in
            </Link>
          </p>

          <form action={formAction} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" htmlFor="full_name">
                Full name
              </label>
              <input
                autoComplete="name"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                id="full_name"
                name="full_name"
                placeholder="Your name"
                required
                type="text"
              />
            </div>

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
                autoComplete="new-password"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                id="password"
                name="password"
                minLength={8}
                placeholder="Min. 8 characters"
                required
                type="password"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">I want to join as a</legend>
              <div className="grid grid-cols-2 gap-3">
                {roles.map(({ value, label, caption, icon: Icon, accent }) => (
                  <label
                    className="group relative cursor-pointer"
                    htmlFor={`role-${value}`}
                    key={value}
                  >
                    <input
                      className="peer sr-only"
                      defaultChecked={value === "customer"}
                      id={`role-${value}`}
                      name="role"
                      type="radio"
                      value={value}
                    />
                    <span className="flex flex-col gap-3 rounded-2xl border-2 border-line bg-white p-4 transition peer-checked:border-brand peer-checked:bg-rose-50 group-hover:border-stone-300">
                      <span className={`grid size-10 place-items-center rounded-xl text-white ${accent}`}>
                        <Icon className="size-5" />
                      </span>
                      <span>
                        <span className="block font-semibold tracking-normal">{label}</span>
                        <span className="mt-1 block text-xs leading-5 text-stone-500">{caption}</span>
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {state && "error" in state ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {state.error}
              </p>
            ) : null}

            <Button className="w-full" disabled={pending} type="submit">
              {pending ? "Creating account…" : "Create account"}
            </Button>

            <p className="text-center text-xs text-stone-400">
              Owner accounts are invitation-only and managed by the platform.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
