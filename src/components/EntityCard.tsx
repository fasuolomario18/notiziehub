import Link from "next/link";
import type { EntityView } from "@/lib/types";
import { entityHref } from "@/lib/links";
import { formatCompact } from "@/lib/format";
import { metricLabel } from "@/lib/types";
import { DeltaBadge } from "./DeltaBadge";

export function EntityCard({ e }: { e: EntityView }) {
  return (
    <Link
      href={entityHref(e)}
      className="block rounded-xl border border-line bg-surface p-4 transition hover:border-muted hover:bg-surface-2"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded bg-ink/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
          {e.platform}
        </span>
        <DeltaBadge value={e.delta7d} pct={e.delta7dPct} size="sm" />
      </div>
      <h3 className="mt-2 truncate font-display text-lg">{e.name}</h3>
      <p className="tabnum mt-1 text-2xl">{formatCompact(e.primary)}</p>
      <p className="text-xs text-muted">{metricLabel(e.kind, e.platform)}</p>
    </Link>
  );
}
