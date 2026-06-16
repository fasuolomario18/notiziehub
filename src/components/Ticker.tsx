import Link from "next/link";
import type { EntityView } from "@/lib/types";
import { entityHref } from "@/lib/links";
import { formatDelta, direction } from "@/lib/format";

/**
 * Ticker orizzontale stile borsa (brief, sez. 6).
 * Scorre con CSS; gli elementi sono duplicati per il loop continuo.
 * Su prefers-reduced-motion l'animazione è disattivata (vedi globals.css).
 */
export function Ticker({ items }: { items: EntityView[] }) {
  if (items.length === 0) return null;
  const row = [...items, ...items]; // duplicato per loop seamless
  return (
    <div
      className="overflow-hidden border-b border-line bg-surface/60"
      aria-label="Movimenti in tempo reale"
    >
      <div className="ticker-track py-2">
        {row.map((e, i) => {
          const dir = direction(e.delta7d);
          const color =
            dir === "up" ? "text-rise" : dir === "down" ? "text-signal" : "text-muted";
          const arrow = dir === "up" ? "▲" : dir === "down" ? "▼" : "▬";
          return (
            <Link
              key={`${e.slug}-${i}`}
              href={entityHref(e)}
              className="mx-4 inline-flex items-center gap-2 text-sm hover:opacity-80"
            >
              <span className={`${color}`} aria-hidden>
                {arrow}
              </span>
              <span className="font-medium">{e.name}</span>
              <span className={`tabnum ${color}`}>{formatDelta(e.delta7d)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
