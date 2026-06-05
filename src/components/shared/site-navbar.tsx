import Link from "next/link";
import { Sparkles } from "lucide-react";

export function SiteNavbar({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 shadow-sm backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link
          className="flex items-center gap-2 text-lg font-semibold tracking-normal"
          href="/"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
            <Sparkles className="size-4" />
          </span>
          <span>Otaevent</span>
        </Link>
        {right ? (
          <div className="flex items-center gap-3">{right}</div>
        ) : null}
      </nav>
    </header>
  );
}
