import { direction, formatDelta, formatPct } from "@/lib/format";

/** Badge direzionale: ▲ menta in salita, ▼ corallo in discesa. */
export function DeltaBadge({
  value,
  pct,
  size = "md",
}: {
  value: number;
  pct?: number;
  size?: "sm" | "md";
}) {
  const dir = direction(value);
  const color =
    dir === "up" ? "text-rise" : dir === "down" ? "text-signal" : "text-muted";
  const arrow = dir === "up" ? "▲" : dir === "down" ? "▼" : "▬";
  const text = size === "sm" ? "text-xs" : "text-sm";
  return (
    <span className={`tabnum inline-flex items-center gap-1 ${color} ${text}`}>
      <span aria-hidden>{arrow}</span>
      <span>{pct !== undefined ? formatPct(pct) : formatDelta(value)}</span>
    </span>
  );
}
