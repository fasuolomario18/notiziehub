import { SEED, type SeedEntity } from "./seed-data";
import type { EntityView, HistoryPoint, Kind } from "./types";
import { hasDb } from "./db";
import * as DB from "./data-db";

/**
 * Data-layer unico per tutto il sito (dispatcher).
 * - Senza DATABASE_URL: dati seed con storico deterministico (gira ovunque).
 * - Con DATABASE_URL: legge da Postgres via Drizzle (vedi data-db.ts).
 * Le pagine chiamano solo queste funzioni, ignorando la sorgente.
 */

const HISTORY_DAYS = 30;
const MIN_HISTORY_FOR_INDEX = 14;
const MIN_PRIMARY_FOR_INDEX = 1_000;

// ---- PRNG deterministico (mulberry32) per storico seed stabile in SSG ----
function hashSlug(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function buildHistory(e: SeedEntity): HistoryPoint[] {
  const rand = mulberry32(hashSlug(e.slug));
  const points: HistoryPoint[] = [];
  let value = e.primary;
  const today = new Date();
  for (let i = 0; i < HISTORY_DAYS; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    points.push({ day: isoDay(d), value: Math.max(0, Math.round(value)) });
    const noise = (rand() - 0.5) * 2 * e.volatility * Math.abs(e.dailyGrowth);
    value -= e.dailyGrowth + noise;
  }
  return points.reverse();
}
function toView(e: SeedEntity): EntityView {
  const history = buildHistory(e);
  const last = history[history.length - 1].value;
  const prev1 = history[history.length - 2]?.value ?? last;
  const prev7 = history[Math.max(0, history.length - 8)]?.value ?? last;
  const delta24h = last - prev1;
  const delta7d = last - prev7;
  const delta7dPct = prev7 ? delta7d / prev7 : 0;
  const indexable =
    history.length >= MIN_HISTORY_FOR_INDEX && e.primary >= MIN_PRIMARY_FOR_INDEX;
  return {
    kind: e.kind,
    slug: e.slug,
    name: e.name,
    platform: e.platform,
    country: e.country,
    category: e.category,
    avatarUrl: e.avatarUrl,
    description: e.description,
    sourceUrl: e.sourceUrl,
    primary: e.primary,
    secondary: e.secondary,
    delta24h,
    delta7d,
    delta7dPct,
    history,
    indexable,
  };
}

let _cache: EntityView[] | null = null;
function allViews(): EntityView[] {
  if (!_cache) _cache = SEED.map(toView);
  return _cache;
}

export type RankingConfig = {
  platform: string;
  country: string;
  period: string;
};

function lastMonths(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}
function valueAtPeriod(e: EntityView, period: string): number {
  const within = e.history.filter((p) => p.day.startsWith(period));
  if (within.length > 0) return within[within.length - 1].value;
  return e.history[0]?.value ?? e.primary;
}

// ════════════════ API pubblica (dispatcher seed ↔ DB) ════════════════

export function invalidateCache(): void {
  if (hasDb) DB.invalidateCache();
}

export async function getAllEntities(): Promise<EntityView[]> {
  return hasDb ? DB.getAllEntities() : allViews();
}

export async function getCounts(): Promise<{ total: number; byKind: Record<string, number> }> {
  if (hasDb) return DB.getCounts();
  const views = allViews();
  const byKind: Record<string, number> = {};
  for (const e of views) byKind[e.kind] = (byKind[e.kind] ?? 0) + 1;
  return { total: views.length, byKind };
}

/** Slug minimali indicizzabili per la sitemap (scala-ready). */
export async function getSitemapSlugs(): Promise<{ kind: Kind; slug: string }[]> {
  if (hasDb) return DB.getSitemapSlugs();
  return allViews()
    .filter((e) => e.indexable)
    .map((e) => ({ kind: e.kind, slug: e.slug }));
}

export async function getEntitiesByKind(kind: Kind): Promise<EntityView[]> {
  return hasDb ? DB.getEntitiesByKind(kind) : allViews().filter((e) => e.kind === kind);
}

export async function getEntity(
  kind: Kind,
  slug: string
): Promise<EntityView | null> {
  if (hasDb) return DB.getEntity(kind, slug);
  return allViews().find((e) => e.kind === kind && e.slug === slug) ?? null;
}

export async function getBySlug(slug: string): Promise<EntityView | null> {
  if (hasDb) return DB.getBySlug(slug);
  return allViews().find((e) => e.slug === slug) ?? null;
}

export async function search(q: string): Promise<EntityView[]> {
  if (hasDb) return DB.search(q);
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return allViews()
    .filter(
      (e) =>
        e.name.toLowerCase().includes(needle) ||
        e.slug.includes(needle) ||
        e.category.includes(needle)
    )
    .sort((a, b) => b.primary - a.primary);
}

export async function getLeaderboard(opts?: {
  kind?: Kind;
  platform?: string;
  country?: string;
  category?: string;
  sort?: "rising" | "top";
  limit?: number;
}): Promise<EntityView[]> {
  if (hasDb) return DB.getLeaderboard(opts);
  let list = allViews();
  if (opts?.kind) list = list.filter((e) => e.kind === opts.kind);
  if (opts?.platform) list = list.filter((e) => e.platform === opts.platform);
  if (opts?.country) list = list.filter((e) => e.country === opts.country);
  if (opts?.category) list = list.filter((e) => e.category === opts.category);
  const sort = opts?.sort ?? "top";
  list = [...list].sort((a, b) =>
    sort === "rising" ? b.delta7dPct - a.delta7dPct : b.primary - a.primary
  );
  return opts?.limit ? list.slice(0, opts.limit) : list;
}

export async function getTicker(limit = 12): Promise<EntityView[]> {
  if (hasDb) return DB.getTicker(limit);
  return [...allViews()]
    .sort((a, b) => Math.abs(b.delta7dPct) - Math.abs(a.delta7dPct))
    .slice(0, limit);
}

export async function getSimilar(
  entity: EntityView,
  limit = 8
): Promise<EntityView[]> {
  if (hasDb) return DB.getSimilar(entity, limit);
  return allViews()
    .filter((e) => e.slug !== entity.slug && e.kind === entity.kind)
    .map((e) => ({
      e,
      score:
        (e.category === entity.category ? 0 : 1) +
        (e.platform === entity.platform ? 0 : 0.5) +
        Math.abs(Math.log10(e.primary + 1) - Math.log10(entity.primary + 1)),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.e);
}

export async function getVersusPairs(): Promise<[EntityView, EntityView][]> {
  if (hasDb) return DB.getVersusPairs();
  const pairs: [EntityView, EntityView][] = [];
  const byKind = new Map<Kind, EntityView[]>();
  for (const e of allViews()) {
    if (!byKind.has(e.kind)) byKind.set(e.kind, []);
    byKind.get(e.kind)!.push(e);
  }
  for (const group of byKind.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i];
        const b = group[j];
        if (a.category !== b.category) continue;
        const ratio =
          Math.max(a.primary, b.primary) / Math.max(1, Math.min(a.primary, b.primary));
        if (ratio > 5) continue;
        pairs.push(a.primary >= b.primary ? [a, b] : [b, a]);
      }
    }
  }
  return pairs;
}

export async function getCategories(): Promise<string[]> {
  if (hasDb) return DB.getCategories();
  return [...new Set(allViews().map((e) => e.category))].sort();
}

export async function getEntitiesByCategory(
  category: string
): Promise<EntityView[]> {
  if (hasDb) return DB.getEntitiesByCategory(category);
  return allViews()
    .filter((e) => e.category === category)
    .sort((a, b) => b.primary - a.primary);
}

export async function getRankingConfigs(): Promise<RankingConfig[]> {
  if (hasDb) return DB.getRankingConfigs();
  const views = allViews();
  const platforms = [...new Set(views.map((e) => e.platform))];
  const periods = lastMonths(2);
  const configs: RankingConfig[] = [];
  for (const platform of platforms) {
    if (views.filter((e) => e.platform === platform).length < 3) continue;
    for (const period of periods) {
      configs.push({ platform, country: "italia", period });
    }
  }
  return configs;
}

export async function getRanking(
  platform: string,
  country: string,
  period: string,
  limit = 50
): Promise<{ entity: EntityView; value: number }[]> {
  if (hasDb) return DB.getRanking(platform, country, period, limit);
  return allViews()
    .filter((e) => e.platform === platform)
    .filter((e) => (country === "italia" ? e.country === "IT" : true))
    .map((e) => ({ entity: e, value: valueAtPeriod(e, period) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}
