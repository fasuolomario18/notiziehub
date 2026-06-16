/**
 * Backfill COMPLETO cataloghi (one-time): anime + manga interi via paginazione
 * per anno (supera il tetto 5000) + inserimento in blocco veloce.
 *
 * Esecuzione:  npm run media:full      Richiede: DATABASE_URL
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { fetchMediaByYears } from "../src/lib/sources/anilist";
import { slugify } from "../src/lib/sources/youtube";
import type { Watchable } from "../src/lib/sources/persist";

async function main() {
  const { db, hasDb } = await import("../src/lib/db");
  const schema = await import("../src/lib/schema");
  const { bulkUpsertWatchables } = await import("../src/lib/sources/persist");
  if (!hasDb || !db) {
    console.error("DATABASE_URL mancante.");
    process.exit(1);
  }

  for (const [type, kind, fromY, max] of [
    ["ANIME", "anime", 1960, 25000],
    ["MANGA", "manga", 1980, 25000],
  ] as const) {
    console.log(`\n=== ${kind}: scarico catalogo (anno per anno)…`);
    const items = await fetchMediaByYears(type, fromY, 2026, max);
    console.log(`${kind}: ${items.length} titoli scaricati, salvo in blocco…`);
    const watchables: Watchable[] = items.map((a) => ({
      kind,
      slug: slugify(a.title),
      name: a.title,
      platform: "anilist",
      country: "JP",
      category: a.genres[0] ? slugify(a.genres[0]) : null,
      avatarUrl: a.cover,
      description: a.description,
      sourceUrl: a.siteUrl,
      primary: a.popularity,
      secondary: a.averageScore,
    }));
    const n = await bulkUpsertWatchables(db, schema, watchables);
    console.log(`${kind}: ${n} salvati.`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
