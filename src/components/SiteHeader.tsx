import Link from "next/link";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/creator", label: "Creator" },
  { href: "/artist", label: "Musica" },
  { href: "/classifiche", label: "Classifiche" },
  { href: "/trend", label: "Trend" },
  { href: "/vs", label: "Versus" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="font-display text-xl tracking-tight">
          notizi<span className="text-signal">hub</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted transition hover:bg-surface hover:text-paper"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/aggiungi"
          className="hidden whitespace-nowrap rounded-full border border-signal/60 px-3 py-1.5 text-sm text-signal transition hover:bg-signal hover:text-ink sm:inline-block"
        >
          + Aggiungi
        </Link>
        <form action="/cerca" className="flex-1 md:flex-none">
          <label htmlFor="q" className="sr-only">
            Cerca creator, artisti, brani
          </label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="Cerca creator…"
            className="w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-paper placeholder:text-muted md:w-56"
          />
        </form>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-1.5 md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="whitespace-nowrap rounded-md px-3 py-1 text-sm text-muted"
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <span className="sr-only">{SITE.tagline}</span>
    </header>
  );
}
