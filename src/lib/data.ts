import { SEED, type SeedEntity } from "./seed-data";
import type { EntityView, HistoryPoint, Kind } from "./types";

/**
 * Data-layer unico per tutto il sito.
 * - Senza DATABASE_URL: costruisce le viste dai dati seed con storico deterministico.
 * - Con DATABASE_URL: (TODO Fase 0.5) legge da Postgres via Drizzle.
 * Le pagine SSG chiamano solo queste funzioni, ignorando la sorgente.
 */

const HISTORY_DAYS = 30;
/** Soglia "regola d'oro" (sez. 2): sotto questi punti dati la pagina va in noindex. */
const MIN_HISTORY_FOR_INDEX = 14;
const MIN_PRIMARY_FOR_INDEX = 1_000;

// ---- PRNG deterministico (mulberry32) per storico stabile in SSG ----
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

/** Genera lo storico a ritroso dal valore attuale, applicando crescita+rumore. */
function buildHistory(e: SeedEntity): HistoryPoint[] {
  const rand = mulberry32(hashSlug(e.slug));
  const points: HistoryPoint[] = [];
  let value = e.primary;
  const today = new Date();
  for (let i = 0; i < HISTORY_DAYS; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    points.push({ day: isoDay(d), value: Math.max(0, Math.round(value)) });
    // passo indietro: togli la crescita del giorno ± rumore
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

// ---- API pubblica del data-layer ----

let _cache: EntityView[] | null = null;
function allViews(): EntityView[] {
  if (!_cache) _cache = SEED.map(toView);
  return _cache;
}

export async function getAllEntities(): Promise<EntityView[]> {
  return allViews();
}

export async function getEntitiesByKind(kind: Kind): Promise<EntityView[]> {
  return allViews().filter((e) => e.kind === kind);
}

export async function getEntity(
  kind: Kind,
  slug: string
): Promise<EntityView | null> {
  return allViews().find((e) => e.kind === kind && e.slug === slug) ?? null;
}

/** Lookup per solo slug (usato dalle pagine /vs/[a]/[b]). */
export async function getBySlug(slug: string): Promise<EntityView | null> {
  return allViews().find((e) => e.slug === slug) ?? null;
}

/** Cerca per nome/slug/categoria (pagina /cerca). */
export async function search(q: string): Promise<EntityView[]> {
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

/** Classifica per delta7d (chi sta salendo) o per valore assoluto. */
export async function getLeaderboard(opts?: {
  kind?: Kind;
  platform?: string;
  country?: string;
  category?: string;
  sort?: "rising" | "top";
  limit?: number;
}): Promise<EntityView[]> {
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

/** Voci per il ticker: top movers (salita e discesa). */
export async function getTicker(limit = 12): Promise<EntityView[]> {
  return [...allViews()]
    .sort((a, b) => Math.abs(b.delta7dPct) - Math.abs(a.delta7dPct))
    .slice(0, limit);
}

/** Entità simili: stessa categoria o piattaforma, dimensioni vicine. */
export async function getSimilar(
  entity: EntityView,
  limit = 8
): Promise<EntityView[]> {
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

/**
 * Coppie /vs sensate: stessa categoria e dimensioni simili (sez. 2).
 * Evita "doorway pages" da combinazioni assurde.
 */
export async function getVersusPairs(): Promise<[EntityView, EntityView][]> {
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
        if (ratio > 5) continue; // dimensioni troppo diverse
        pairs.push(a.primary >= b.primary ? [a, b] : [b, a]);
      }
    }
  }
  return pairs;
}

export async function getCategories(): Promise<string[]> {
  return [...new Set(allViews().map((e) => e.category))].sort();
}

export async function getEntitiesByCategory(
  category: string
): Promise<EntityView[]> {
  return allViews()
    .filter((e) => e.category === category)
    .sort((a, b) => b.primary - a.primary);
}

// ---- CLASSIFICHE DATATE (archivi storici → nuovi URL nel tempo) ----

export type RankingConfig = {
  platform: string;
  country: string; // "italia" | "global"
  period: string; // "YYYY-MM"
};

/** Ultimi N mesi come periodi mensili. */
function lastMonths(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

/** Combinazioni di classifica disponibili (solo dove ci sono abbastanza entità). */
export async function getRankingConfigs(): Promise<RankingConfig[]> {
  const views = allViews();
  const platforms = [...new Set(views.map((e) => e.platform))];
  const periods = lastMonths(2); // mese corrente + precedente (coperti dallo storico)
  const configs: RankingConfig[] = [];
  for (const platform of platforms) {
    const count = views.filter((e) => e.platform === platform).length;
    if (count < 3) continue; // sotto soglia non si genera (sez. 2)
    for (const period of periods) {
      configs.push({ platform, country: "italia", period });
    }
  }
  return configs;
}

/** Valore storico di un'entità alla fine del mese `period` (YYYY-MM). */
function valueAtPeriod(e: EntityView, period: string): number {
  const within = e.history.filter((p) => p.day.startsWith(period));
  if (within.length > 0) return within[within.length - 1].value;
  // periodo prima dello storico: stima a ritroso dal primo punto
  return e.history[0]?.value ?? e.primary;
}

export async function getRanking(
  platform: string,
  country: string,
  period: string,
  limit = 50
): Promise<{ entity: EntityView; value: number }[]> {
  return allViews()
    .filter((e) => e.platform === platform)
    .filter((e) => (country === "italia" ? e.country === "IT" : true))
    .map((e) => ({ entity: e, value: valueAtPeriod(e, period) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}
