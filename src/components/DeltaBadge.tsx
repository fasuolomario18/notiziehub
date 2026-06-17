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
  const text = size === "sm" ? "text-xs" : "text-sm";
  // Nessun movimento ancora rilevato: lo storico si costruisce un dato al
  // giorno, quindi finché non c'è un delta reale mostriamo uno stato neutro
  // invece di un finto "0.0%" (che ucciderebbe la credibilità del tabellone).
  if (value === 0) {
    return (
      <span
        className={`tabnum inline-flex items-center gap-1 text-muted ${text}`}
        title="Trend in raccolta: registriamo un dato al giorno"
      >
        <span aria-hidden>▬</span>
        <span>—</span>
      </span>
    );
  }
  const dir = direction(value);
  const color = dir === "up" ? "text-rise" : "text-signal";
  const arrow = dir === "up" ? "▲" : "▼";
  return (
    <span className={`tabnum inline-flex items-center gap-1 ${color} ${text}`}>
      <span aria-hidden>{arrow}</span>
      <span>{pct !== undefined ? formatPct(pct) : formatDelta(value)}</span>
    </span>
  );
}
