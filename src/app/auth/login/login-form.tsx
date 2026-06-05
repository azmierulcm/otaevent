"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signIn } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
  next?: string;
  errorParam?: string;
  messageParam?: string;
}

export function LoginForm({ next, errorParam, messageParam }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(signIn, null);

  const errorMessage =
    (state && "error" in state ? state.error : null) ?? errorParam ?? null;

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {next ? <input name="next" type="hidden" value={next} /> : null}

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
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold" htmlFor="password">
            Password
          </label>
          <Link
            className="text-xs font-semibold text-brand hover:underline"
            href="/auth/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
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

      {messageParam ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {messageParam}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
