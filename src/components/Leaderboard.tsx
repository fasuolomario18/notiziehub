import Link from "next/link";
import type { EntityView } from "@/lib/types";
import { entityHref } from "@/lib/links";
import { formatCompact } from "@/lib/format";
import { DeltaBadge } from "./DeltaBadge";

/** Classifica viva: barre proporzionali, #1 in ambra (brief sez. 6). */
export function Leaderboard({
  items,
  metric = "primary",
}: {
  items: EntityView[];
  metric?: "primary" | "secondary";
}) {
  const max = Math.max(1, ...items.map((e) => e[metric] || 0));
  return (
    <ol className="flex flex-col">
      {items.map((e, i) => {
        const value = e[metric] || 0;
        const w = Math.max(4, Math.round((value / max) * 100));
        const isTop = i === 0;
        return (
          <li key={e.slug} className="border-b border-line last:border-0">
            <Link
              href={entityHref(e)}
              className="group grid grid-cols-[2.2rem_1fr_auto] items-center gap-3 px-2 py-3 hover:bg-surface-2/60"
            >
              <span
                className={`tabnum text-right text-lg ${
                  isTop ? "text-peak" : "text-muted"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="truncate font-medium group-hover:underline">
                    {e.name}
                  </span>
                  <span className="shrink-0 rounded bg-surface px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                    {e.platform}
                  </span>
                </span>
                <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-surface">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${w}%`,
                      background: isTop ? "var(--peak)" : "var(--rise)",
                    }}
                  />
                </span>
              </span>
              <span className="flex flex-col items-end gap-0.5">
                <span className="tabnum text-base">{formatCompact(value)}</span>
                <DeltaBadge value={e.delta7d} pct={e.delta7dPct} size="sm" />
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
