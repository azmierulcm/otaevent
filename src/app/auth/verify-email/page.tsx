import Link from "next/link";
import { Mail, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
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

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-surface-soft">
            <Mail className="size-8 text-stone-600" />
          </span>

          <h1 className="mt-6 text-3xl font-semibold tracking-normal">Check your inbox</h1>
          <p className="mt-3 text-sm leading-6 text-stone-500">
            We sent a confirmation link to your email address. Click it to verify your account and complete sign-up.
          </p>
          <p className="mt-2 text-sm text-stone-400">
            Didn&apos;t get it? Check your spam folder.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Button asChild variant="secondary">
              <Link href="/auth/signup">Try a different email</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/auth/login">Back to sign in</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
