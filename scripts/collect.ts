/**
 * Job di raccolta (cron). Brief sez. 5 — il loop "gira da solo":
 *   API ufficiali → upsert DB → riga storica datata → (ISR rigenera) → sitemap.
 *
 * Esecuzione:  npm run collect
 * Richiede: DATABASE_URL, YOUTUBE_API_KEY
 *
 * Schedulabile con GitHub Actions cron (gratis) o Vercel Cron.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sql } from "drizzle-orm";
import { db, hasDb } from "../src/lib/db";
import { entities, stats, history } from "../src/lib/schema";
import { fetchChannels, slugify } from "../src/lib/sources/youtube";

async function main() {
  if (!hasDb || !db) {
    console.error("DATABASE_URL mancante: il job richiede un Postgres.");
    process.exit(1);
  }
  if (!process.env.YOUTUBE_API_KEY) {
    console.error("YOUTUBE_API_KEY mancante.");
    process.exit(1);
  }

  const cfg = JSON.parse(
    readFileSync(join(process.cwd(), "data", "youtube-channels.json"), "utf8")
  ) as { channels: { channelId: string; category?: string }[] };

  const ids = cfg.channels.map((c) => c.channelId);
  const catById = new Map(cfg.channels.map((c) => [c.channelId, c.category]));
  console.log(`Raccolta YouTube: ${ids.length} canali…`);

  const results = await fetchChannels(ids);
  const today = new Date().toISOString().slice(0, 10);
  let updated = 0;

  for (const r of results) {
    const slug = slugify(r.title);
    // upsert entità
    const [row] = await db
      .insert(entities)
      .values({
        kind: "creator",
        slug,
        name: r.title,
        platform: "youtube",
        country: r.country ?? null,
        category: catById.get(r.channelId) ?? null,
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

    // riga storica datata (una per giorno)
    await db
      .insert(history)
      .values({
        entityId,
        day: today,
        primaryMetric: r.subscribers,
        secondaryMetric: r.views,
      })
      .onConflictDoNothing();

    // delta da storico
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
    const prevVal = Number((prev as unknown as { primary_metric: number }[])[0]?.primary_metric ?? r.subscribers);
    const prev7Val = Number((prev7 as unknown as { primary_metric: number }[])[0]?.primary_metric ?? r.subscribers);

    // upsert stato corrente
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

    updated++;
  }

  console.log(`Fatto: ${updated} entità aggiornate (${today}).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
