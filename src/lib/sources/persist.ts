import { sql } from "drizzle-orm";
import type { ChannelStat, TrendingVideo } from "./youtube";
import { slugify } from "./youtube";

/**
 * Upsert di un canale YouTube nel DB: entità + riga storica datata + stato corrente con delta.
 * db e schema vengono passati dal chiamante (che li importa dopo aver caricato le env).
 */
export async function upsertCreator(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any,
  r: ChannelStat,
  category?: string
): Promise<void> {
  const { entities, stats, history } = schema;
  const today = new Date().toISOString().slice(0, 10);
  const slug = slugify(r.title);

  const [row] = await db
    .insert(entities)
    .values({
      kind: "creator",
      slug,
      name: r.title,
      platform: "youtube",
      country: r.country ?? null,
      category: category ?? null,
      avatarUrl: r.thumbnail ?? null,
      description: r.description,
      sourceUrl: `https://www.youtube.com/channel/${r.channelId}`,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [entities.kind, entities.slug],
      set: { name: r.title, avatarUrl: r.thumbnail ?? null, updatedAt: new Date() },
    })
    .returning({ id: entities.id });

  const entityId = row.id;

  await db
    .insert(history)
    .values({
      entityId,
      day: today,
      primaryMetric: r.subscribers,
      secondaryMetric: r.views,
    })
    .onConflictDoNothing();

  const prev = await db.execute(sql`
    SELECT primary_metric FROM history
    WHERE entity_id = ${entityId} AND day < ${today}
    ORDER BY day DESC LIMIT 1
  `);
  const prev7 = await db.execute(sql`
    SELECT primary_metric FROM history
    WHERE entity_id = ${entityId} AND day <= (CURRENT_DATE - INTERVAL '7 day')
    ORDER BY day DESC LIMIT 1
  `);
  const prevVal = Number(prev?.[0]?.primary_metric ?? r.subscribers);
  const prev7Val = Number(prev7?.[0]?.primary_metric ?? r.subscribers);

  await db
    .insert(stats)
    .values({
      entityId,
      primaryMetric: r.subscribers,
      secondaryMetric: r.views,
      delta24h: r.subscribers - prevVal,
      delta7d: r.subscribers - prev7Val,
      capturedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: stats.entityId,
      set: {
        primaryMetric: r.subscribers,
        secondaryMetric: r.views,
        delta24h: r.subscribers - prevVal,
        delta7d: r.subscribers - prev7Val,
        capturedAt: new Date(),
      },
    });
}

export type Watchable = {
  kind: "anime" | "manga" | "movie" | "tv";
  slug: string;
  name: string;
  platform: "anilist" | "tmdb";
  country: string;
  category: string | null;
  avatarUrl?: string;
  description: string;
  sourceUrl: string;
  primary: number; // popolarità / n. voti
  secondary: number; // punteggio
};

/** Upsert generico per anime/film/serie (kind dato): primary=popolarità, secondary=punteggio. */
export async function upsertWatchable(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any,
  w: Watchable
): Promise<void> {
  const { entities, stats, history } = schema;
  const today = new Date().toISOString().slice(0, 10);

  const [row] = await db
    .insert(entities)
    .values({
      kind: w.kind,
      slug: w.slug,
      name: w.name,
      platform: w.platform,
      country: w.country,
      category: w.category,
      avatarUrl: w.avatarUrl ?? null,
      description: w.description,
      sourceUrl: w.sourceUrl,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [entities.kind, entities.slug],
      set: {
        name: w.name,
        avatarUrl: w.avatarUrl ?? null,
        description: w.description,
        updatedAt: new Date(),
      },
    })
    .returning({ id: entities.id });

  const entityId = row.id;

  await db
    .insert(history)
    .values({ entityId, day: today, primaryMetric: w.primary, secondaryMetric: w.secondary })
    .onConflictDoNothing();

  const prev = await db.execute(sql`
    SELECT primary_metric FROM history
    WHERE entity_id = ${entityId} AND day < ${today}
    ORDER BY day DESC LIMIT 1
  `);
  const prev7 = await db.execute(sql`
    SELECT primary_metric FROM history
    WHERE entity_id = ${entityId} AND day <= (CURRENT_DATE - INTERVAL '7 day')
    ORDER BY day DESC LIMIT 1
  `);
  const prevVal = Number(prev?.[0]?.primary_metric ?? w.primary);
  const prev7Val = Number(prev7?.[0]?.primary_metric ?? w.primary);

  await db
    .insert(stats)
    .values({
      entityId,
      primaryMetric: w.primary,
      secondaryMetric: w.secondary,
      delta24h: w.primary - prevVal,
      delta7d: w.primary - prev7Val,
      capturedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: stats.entityId,
      set: {
        primaryMetric: w.primary,
        secondaryMetric: w.secondary,
        delta24h: w.primary - prevVal,
        delta7d: w.primary - prev7Val,
        capturedAt: new Date(),
      },
    });
}

/** Upsert di un video di tendenza (kind="video"): primary=views, secondary=likes. */
export async function upsertVideo(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any,
  v: TrendingVideo
): Promise<void> {
  const { entities, stats, history } = schema;
  const today = new Date().toISOString().slice(0, 10);

  const [row] = await db
    .insert(entities)
    .values({
      kind: "video",
      slug: v.videoId,
      name: v.title,
      platform: "youtube",
      country: "IT",
      category: "virali",
      avatarUrl: v.thumbnail ?? null,
      description: `Video di ${v.channelTitle}`,
      sourceUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [entities.kind, entities.slug],
      set: { name: v.title, avatarUrl: v.thumbnail ?? null, updatedAt: new Date() },
    })
    .returning({ id: entities.id });

  const entityId = row.id;

  await db
    .insert(history)
    .values({ entityId, day: today, primaryMetric: v.views, secondaryMetric: v.likes })
    .onConflictDoNothing();

  const prev = await db.execute(sql`
    SELECT primary_metric FROM history
    WHERE entity_id = ${entityId} AND day < ${today}
    ORDER BY day DESC LIMIT 1
  `);
  const prevVal = Number(prev?.[0]?.primary_metric ?? v.views);

  await db
    .insert(stats)
    .values({
      entityId,
      primaryMetric: v.views,
      secondaryMetric: v.likes,
      delta24h: v.views - prevVal,
      delta7d: v.views - prevVal,
      capturedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: stats.entityId,
      set: {
        primaryMetric: v.views,
        secondaryMetric: v.likes,
        delta24h: v.views - prevVal,
        capturedAt: new Date(),
      },
    });
}
