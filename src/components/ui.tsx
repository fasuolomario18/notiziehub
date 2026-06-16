import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { breadcrumbSchema } from "@/lib/schema-org";

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 ${className}`}>{children}</div>
  );
}

export function SectionTitle({
  children,
  href,
  cta,
}: {
  children: React.ReactNode;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 className="font-display text-2xl tracking-tight">{children}</h2>
      {href ? (
        <Link href={href} className="text-sm text-muted hover:text-paper">
          {cta ?? "Vedi tutto"} →
        </Link>
      ) : null}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface ${className}`}
    >
      {children}
    </div>
  );
}

/** Breadcrumb visivo + schema.org BreadcrumbList. */
export function Breadcrumbs({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <>
      <JsonLd data={breadcrumbSchema(items)} />
      <nav aria-label="Percorso" className="py-3 text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((it, i) => (
            <li key={it.path} className="flex items-center gap-1.5">
              {i > 0 ? <span aria-hidden>/</span> : null}
              {i < items.length - 1 ? (
                <Link href={it.path} className="hover:text-paper">
                  {it.name}
                </Link>
              ) : (
                <span className="text-paper">{it.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

export function StatBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: "rise" | "signal" | "peak";
}) {
  const color =
    accent === "rise"
      ? "text-rise"
      : accent === "signal"
        ? "text-signal"
        : accent === "peak"
          ? "text-peak"
          : "text-paper";
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className={`tabnum mt-1 text-xl ${color}`}>{value}</div>
    </div>
  );
}
