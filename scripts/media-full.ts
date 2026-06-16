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

  // Incrementale per anno: salva man mano (resiliente alle interruzioni).
  for (const [type, kind, fromY] of [
    ["ANIME", "anime", 1960],
    ["MANGA", "manga", 1980],
  ] as const) {
    console.log(`\n=== ${kind}: backfill ${fromY}→2026 (anno per anno)…`);
    let total = 0;
    for (let year = 2026; year >= fromY; year--) {
      const items = await fetchMediaByYears(type, year, year, 100000);
      if (!items.length) continue;
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
      total += n;
      console.log(`${kind} ${year}: +${n} (totale ${total})`);
    }
    console.log(`${kind}: completato, ${total} salvati.`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
