import Link from "next/link";
import { Sparkles } from "lucide-react";

import { LoginForm } from "./login-form";

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string; message?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error, message } = await searchParams;

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

          <LoginForm
            errorParam={error}
            messageParam={message}
            next={next}
          />
        </div>
      </main>
    </div>
  );
}
