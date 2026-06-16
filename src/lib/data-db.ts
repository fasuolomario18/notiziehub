import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "./db";
import { entities, stats, history } from "./schema";
import type { EntityView, HistoryPoint, Kind, Platform } from "./types";

/**
 * Path di lettura dal DB (usato quando DATABASE_URL è impostata).
 * Mantiene le stesse firme di data.ts. Le pagine non sanno la differenza.
 */

const MIN_PRIMARY_FOR_INDEX = 1_000;

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

// Memo di processo: collassa le tante chiamate (SSG multi-pagina) in 1 query.
let _rowsCache: { at: number; data: EntityView[] } | null = null;
const ROWS_TTL_MS = 60_000;

async function allRows(): Promise<EntityView[]> {
  const now = Date.now();
  if (_rowsCache && now - _rowsCache.at < ROWS_TTL_MS) return _rowsCache.data;
  const rows = await db!
    .select(SELECT)
    .from(entities)
    .leftJoin(stats, eq(stats.entityId, entities.id));
  const data = rows.map((r) => rowToView(r as Row));
  _rowsCache = { at: now, data };
  return data;
}

async function historyFor(kind: Kind, slug: string): Promise<HistoryPoint[]> {
  const since = new Date();
  since.setDate(since.getDate() - 60);
  const sinceDay = since.toISOString().slice(0, 10);
  const rows = await db!
    .select({ day: history.day, value: history.primaryMetric })
    .from(history)
    .innerJoin(entities, eq(entities.id, history.entityId))
    .where(
      and(
        eq(entities.kind, kind),
        eq(entities.slug, slug),
        gte(history.day, sinceDay)
      )
    )
    .orderBy(history.day);
  return rows.map((r) => ({ day: String(r.day), value: Number(r.value) }));
}

export async function getAllEntities(): Promise<EntityView[]> {
  return allRows();
}

export async function getEntitiesByKind(kind: Kind): Promise<EntityView[]> {
  return (await allRows()).filter((e) => e.kind === kind);
}

export async function getEntity(
  kind: Kind,
  slug: string
): Promise<EntityView | null> {
  const all = await allRows();
  const base = all.find((e) => e.kind === kind && e.slug === slug);
  if (!base) return null;
  const hist = await historyFor(kind, slug);
  return { ...base, history: hist, indexable: base.primary >= MIN_PRIMARY_FOR_INDEX };
}

export async function getBySlug(slug: string): Promise<EntityView | null> {
  const all = await allRows();
  const base = all.find((e) => e.slug === slug);
  if (!base) return null;
  const hist = await historyFor(base.kind, slug);
  return { ...base, history: hist };
}

export async function getLeaderboard(opts?: {
  kind?: Kind;
  platform?: string;
  country?: string;
  category?: string;
  sort?: "rising" | "top";
  limit?: number;
}): Promise<EntityView[]> {
  let list = await allRows();
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
  return [...(await allRows())]
    .sort((a, b) => Math.abs(b.delta7dPct) - Math.abs(a.delta7dPct))
    .slice(0, limit);
}

export async function getSimilar(
  entity: EntityView,
  limit = 8
): Promise<EntityView[]> {
  return (await allRows())
    .filter((e) => e.slug !== entity.slug && e.kind === entity.kind)
    .map((e) => ({
      e,
      score:
        (e.category === entity.category ? 0 : 1) +
        Math.abs(Math.log10(e.primary + 1) - Math.log10(entity.primary + 1)),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.e);
}

export async function getVersusPairs(): Promise<[EntityView, EntityView][]> {
  const pairs: [EntityView, EntityView][] = [];
  const byKind = new Map<Kind, EntityView[]>();
  for (const e of await allRows()) {
    if (!byKind.has(e.kind)) byKind.set(e.kind, []);
    byKind.get(e.kind)!.push(e);
  }
  for (const group of byKind.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i];
        const b = group[j];
        if (!a.category || a.category !== b.category) continue;
        const ratio =
          Math.max(a.primary, b.primary) /
          Math.max(1, Math.min(a.primary, b.primary));
        if (ratio > 5) continue;
        pairs.push(a.primary >= b.primary ? [a, b] : [b, a]);
      }
    }
  }
  return pairs.slice(0, 500); // limite prudenziale
}

export async function getCategories(): Promise<string[]> {
  return [...new Set((await allRows()).map((e) => e.category).filter(Boolean))].sort();
}

export async function getEntitiesByCategory(
  category: string
): Promise<EntityView[]> {
  return (await allRows())
    .filter((e) => e.category === category)
    .sort((a, b) => b.primary - a.primary);
}

export async function search(q: string): Promise<EntityView[]> {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return (await allRows())
    .filter(
      (e) =>
        e.name.toLowerCase().includes(needle) ||
        e.slug.includes(needle) ||
        e.category.includes(needle)
    )
    .sort((a, b) => b.primary - a.primary);
}

// Classifiche
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
  const views = await allRows();
  const platforms = [...new Set(views.map((e) => e.platform))];
  const periods = lastMonths(2);
  const configs: RankingConfig[] = [];
  for (const platform of platforms) {
    if (views.filter((e) => e.platform === platform).length < 3) continue;
    for (const period of periods) configs.push({ platform, country: "italia", period });
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
  const views = (await allRows())
    .filter((e) => e.platform === platform)
    .filter((e) => (country === "italia" ? e.country === "IT" : true));

  // Mese corrente: usa il valore attuale (niente query per-entità → veloce).
  if (period === currentPeriod) {
    return views
      .map((e) => ({ entity: e, value: e.primary }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  // Mesi passati: valore di fine mese da una sola query aggregata.
  const rows = await db!
    .select({
      slug: entities.slug,
      kind: entities.kind,
      value: history.primaryMetric,
      day: history.day,
    })
    .from(history)
    .innerJoin(entities, eq(entities.id, history.entityId))
    .where(
      and(
        eq(entities.platform, platform),
        sql`to_char(${history.day}, 'YYYY-MM') = ${period}`
      )
    )
    .orderBy(history.day);
  const lastByEntity = new Map<string, number>();
  for (const r of rows) lastByEntity.set(`${r.kind}:${r.slug}`, Number(r.value));
  return views
    .map((e) => ({
      entity: e,
      value: lastByEntity.get(`${e.kind}:${e.slug}`) ?? e.primary,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}
