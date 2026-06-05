"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { forgotPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPassword, null);
  const sent = state && "success" in state;

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

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-semibold tracking-normal">Reset password</h1>
          <p className="mt-2 text-sm text-stone-500">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {sent ? (
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-center">
              <p className="font-semibold text-emerald-800">Link sent!</p>
              <p className="mt-1 text-sm text-emerald-700">
                {"success" in state ? state.success : ""}
              </p>
              <Button asChild className="mt-4 w-full" variant="secondary">
                <Link href="/auth/login">Back to sign in</Link>
              </Button>
            </div>
          ) : (
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

              {state && "error" in state ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {state.error}
                </p>
              ) : null}

              <Button className="w-full" disabled={pending} type="submit">
                {pending ? "Sending…" : "Send reset link"}
              </Button>

              <p className="text-center text-sm text-stone-500">
                Remembered it?{" "}
                <Link className="font-semibold text-brand hover:underline" href="/auth/login">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
