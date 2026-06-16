/** Formattazione numeri stile scoreboard (cifre compatte e delta con segno). */

const NF = new Intl.NumberFormat("it-IT");

export function formatFull(n: number): string {
  return NF.format(Math.round(n));
}

/** 1.2M, 162.4M, 9.2K — compatto per leaderboard e ticker. */
export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`;
  return `${sign}${abs}`;
}

/** Delta con segno esplicito: +38.0K / -300K */
export function formatDelta(n: number): string {
  if (n === 0) return "0";
  const s = formatCompact(Math.abs(n));
  return n > 0 ? `+${s}` : `-${s}`;
}

export function formatPct(n: number): string {
  const v = (n * 100).toFixed(1);
  return n > 0 ? `+${v}%` : `${v}%`;
}

export function direction(n: number): "up" | "down" | "flat" {
  if (n > 0) return "up";
  if (n < 0) return "down";
  return "flat";
}
