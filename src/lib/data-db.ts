import { and, eq, ne, desc, sql, gte, between } from "drizzle-orm";
import { db } from "./db";
import { entities, stats, history } from "./schema";
import type { EntityView, HistoryPoint, Kind, Platform } from "./types";

/**
 * Path DB scala-ready: ogni funzione usa SQL con WHERE/ORDER/LIMIT.
 * Niente "carica tutte le righe in memoria" → regge decine/centinaia di migliaia di entità.
 */

const MIN_PRIMARY_FOR_INDEX = 1_000;
const LIST_LIMIT = 100;

type Row = {
  kind: string;
  slug: string;
  name: string;
  platform: string;
  country: string | null;
  category: string | null;
  avatarUrl: string | null;
  description: string | null;
  sourceUrl: string | null;
  primary: number | null;
  secondary: number | null;
  delta24h: number | null;
  delta7d: number | null;
};

function rowToView(r: Row, hist: HistoryPoint[] = []): EntityView {
  const primary = Number(r.primary ?? 0);
  const delta7d = Number(r.delta7d ?? 0);
  const prev7 = primary - delta7d;
  return {
    kind: r.kind as Kind,
    slug: r.slug,
    name: r.name,
    platform: r.platform as Platform,
    country: r.country ?? "",
    category: r.category ?? "",
    avatarUrl: r.avatarUrl ?? undefined,
    description: r.description ?? "",
    sourceUrl: r.sourceUrl ?? "",
    primary,
    secondary: Number(r.secondary ?? 0),
    delta24h: Number(r.delta24h ?? 0),
    delta7d,
    delta7dPct: prev7 > 0 ? delta7d / prev7 : 0,
    history: hist,
    indexable: primary >= MIN_PRIMARY_FOR_INDEX,
  };
}

const SELECT = {
  kind: entities.kind,
  slug: entities.slug,
  name: entities.name,
  platform: entities.platform,
  country: entities.country,
  category: entities.category,
  avatarUrl: entities.avatarUrl,
  description: entities.description,
  sourceUrl: entities.sourceUrl,
  primary: stats.primaryMetric,
  secondary: stats.secondaryMetric,
  delta24h: stats.delta24h,
  delta7d: stats.delta7d,
};

function base() {
  return db!.select(SELECT).from(entities).leftJoin(stats, eq(stats.entityId, entities.id));
}

const risingOrder = sql`(${stats.delta7d}::float / NULLIF(${stats.primaryMetric} - ${stats.delta7d}, 0)) DESC NULLS LAST`;

export async function fetchAllFromDb(): Promise<EntityView[]> {
  const rows = await base();
  return rows.map((r) => rowToView(r as Row));
}

async function historyFor(kind: Kind, slug: string): Promise<HistoryPoint[]> {
  const since = new Date();
  since.setDate(since.getDate() - 60);
  const rows = await db!
    .select({ day: history.day, value: history.primaryMetric })
    .from(history)
    .innerJoin(entities, eq(entities.id, history.entityId))
    .where(and(eq(entities.kind, kind), eq(entities.slug, slug), gte(history.day, since.toISOString().slice(0, 10))))
    .orderBy(history.day);
  return rows.map((r) => ({ day: String(r.day), value: Number(r.value) }));
}

export async function getEntity(kind: Kind, slug: string): Promise<EntityView | null> {
  const rows = await base().where(and(eq(entities.kind, kind), eq(entities.slug, slug))).limit(1);
  if (!rows.length) return null;
  return rowToView(rows[0] as Row, await historyFor(kind, slug));
}

export async function getBySlug(slug: string): Promise<EntityView | null> {
  const rows = await base().where(eq(entities.slug, slug)).limit(1);
  if (!rows.length) return null;
  const r = rows[0] as Row;
  return rowToView(r, await historyFor(r.kind as Kind, slug));
}

export async function getLeaderboard(opts?: {
  kind?: Kind;
  platform?: string;
  country?: string;
  category?: string;
  sort?: "rising" | "top";
  limit?: number;
}): Promise<EntityView[]> {
  const conds = [];
  if (opts?.kind) conds.push(eq(entities.kind, opts.kind));
  if (opts?.platform) conds.push(eq(entities.platform, opts.platform));
  if (opts?.country) conds.push(eq(entities.country, opts.country));
  if (opts?.category) conds.push(eq(entities.category, opts.category));
  let q = base().$dynamic();
  if (conds.length) q = q.where(and(...conds));
  q = q.orderBy(opts?.sort === "rising" ? risingOrder : desc(stats.primaryMetric));
  const rows = await q.limit(opts?.limit ?? LIST_LIMIT);
  return rows.map((r) => rowToView(r as Row));
}

export async function getEntitiesByKind(kind: Kind, limit = LIST_LIMIT): Promise<EntityView[]> {
  const rows = await base()
    .where(eq(entities.kind, kind))
    .orderBy(desc(stats.primaryMetric))
    .limit(limit);
  return rows.map((r) => rowToView(r as Row));
}

export async function getTicker(limit = 12): Promise<EntityView[]> {
  const rows = await base()
    .orderBy(sql`ABS(${stats.delta7d}) DESC NULLS LAST`)
    .limit(limit);
  return rows.map((r) => rowToView(r as Row));
}

export async function getSimilar(entity: EntityView, limit = 8): Promise<EntityView[]> {
  const lo = Math.floor(entity.primary / 4);
  const hi = entity.primary * 4 + 1000;
  const rows = await base()
    .where(
      and(
        eq(entities.kind, entity.kind),
        ne(entities.slug, entity.slug),
        between(stats.primaryMetric, lo, hi)
      )
    )
    .orderBy(desc(stats.primaryMetric))
    .limit(limit);
  return rows.map((r) => rowToView(r as Row));
}

export async function getVersusPairs(): Promise<[EntityView, EntityView][]> {
  // Solo i top per popolarità → coppie sensate, niente esplosione su 50k entità.
  const top = (await base().orderBy(desc(stats.primaryMetric)).limit(400)).map((r) =>
    rowToView(r as Row)
  );
  const pairs: [EntityView, EntityView][] = [];
  const byKey = new Map<string, EntityView[]>();
  for (const e of top) {
    const k = `${e.kind}:${e.category}`;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(e);
  }
  for (const group of byKey.values()) {
    for (let i = 0; i < group.length && pairs.length < 500; i++) {
      for (let j = i + 1; j < group.length && pairs.length < 500; j++) {
        const a = group[i];
        const b = group[j];
        const ratio = Math.max(a.primary, b.primary) / Math.max(1, Math.min(a.primary, b.primary));
        if (ratio > 5) continue;
        pairs.push(a.primary >= b.primary ? [a, b] : [b, a]);
      }
    }
  }
  return pairs;
}

export async function getCategories(): Promise<string[]> {
  const rows = await db!
    .select({ category: entities.category, n: sql<number>`count(*)::int` })
    .from(entities)
    .where(sql`${entities.category} is not null`)
    .groupBy(entities.category)
    .orderBy(sql`count(*) DESC`)
    .limit(200);
  return rows.map((r) => r.category!).filter(Boolean);
}

export async function getEntitiesByCategory(category: string, limit = LIST_LIMIT): Promise<EntityView[]> {
  const rows = await base()
    .where(eq(entities.category, category))
    .orderBy(desc(stats.primaryMetric))
    .limit(limit);
  return rows.map((r) => rowToView(r as Row));
}

export async function search(q: string, limit = 40): Promise<EntityView[]> {
  const needle = q.trim();
  if (!needle) return [];
  const like = `%${needle}%`;
  const rows = await base()
    .where(sql`(${entities.name} ILIKE ${like} OR ${entities.slug} ILIKE ${like})`)
    .orderBy(desc(stats.primaryMetric))
    .limit(limit);
  return rows.map((r) => rowToView(r as Row));
}

export async function getAllEntities(): Promise<EntityView[]> {
  return fetchAllFromDb();
}

/** Conteggi per la home (totale + per tipo). */
export async function getCounts(): Promise<{ total: number; byKind: Record<string, number> }> {
  const rows = await db!
    .select({ kind: entities.kind, n: sql<number>`count(*)::int` })
    .from(entities)
    .groupBy(entities.kind);
  const byKind: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    byKind[r.kind] = r.n;
    total += r.n;
  }
  return { total, byKind };
}

/** Slug minimali per la sitemap (solo entità indicizzabili). Leggero anche a 100k. */
export async function getSitemapSlugs(): Promise<{ kind: Kind; slug: string }[]> {
  const rows = await db!
    .select({ kind: entities.kind, slug: entities.slug })
    .from(entities)
    .innerJoin(stats, eq(stats.entityId, entities.id))
    .where(gte(stats.primaryMetric, MIN_PRIMARY_FOR_INDEX))
    .orderBy(desc(stats.primaryMetric))
    .limit(200_000);
  return rows.map((r) => ({ kind: r.kind as Kind, slug: r.slug }));
}

// ---- Classifiche ----
export type RankingConfig = { platform: string; country: string; period: string };

function lastMonths(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

export async function getRankingConfigs(): Promise<RankingConfig[]> {
  const rows = await db!
    .select({ platform: entities.platform, n: sql<number>`count(*)::int` })
    .from(entities)
    .groupBy(entities.platform)
    .having(sql`count(*) >= 3`);
  const periods = lastMonths(2);
  const configs: RankingConfig[] = [];
  for (const r of rows) {
    for (const period of periods) configs.push({ platform: r.platform, country: "italia", period });
  }
  return configs;
}

export async function getRanking(
  platform: string,
  country: string,
  period: string,
  limit = 50
): Promise<{ entity: EntityView; value: number }[]> {
  const currentPeriod = lastMonths(1)[0];
  const conds = [eq(entities.platform, platform)];
  if (country === "italia") conds.push(eq(entities.country, "IT"));

  if (period === currentPeriod) {
    const rows = await base().where(and(...conds)).orderBy(desc(stats.primaryMetric)).limit(limit);
    return rows.map((r) => {
      const e = rowToView(r as Row);
      return { entity: e, value: e.primary };
    });
  }

  // mesi passati: valore di fine mese da una query aggregata
  const rows = await db!
    .select({ slug: entities.slug, kind: entities.kind, value: history.primaryMetric, day: history.day })
    .from(history)
    .innerJoin(entities, eq(entities.id, history.entityId))
    .where(and(eq(entities.platform, platform), sql`to_char(${history.day}, 'YYYY-MM') = ${period}`))
    .orderBy(history.day);
  const lastByEntity = new Map<string, number>();
  for (const r of rows) lastByEntity.set(`${r.kind}:${r.slug}`, Number(r.value));
  const top = await base().where(and(...conds)).orderBy(desc(stats.primaryMetric)).limit(limit);
  return top
    .map((r) => {
      const e = rowToView(r as Row);
      return { entity: e, value: lastByEntity.get(`${e.kind}:${e.slug}`) ?? e.primary };
    })
    .sort((a, b) => b.value - a.value);
}

let _cacheNull: null = null;
export function invalidateCache(): void {
  _cacheNull = null;
  void _cacheNull;
}
