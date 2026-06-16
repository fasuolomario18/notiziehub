/**
 * Backfill film + serie TV da TMDB (discover anno per anno + bulk insert).
 *   npm run tmdb:full      Richiede: DATABASE_URL, TMDB_API_KEY
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { fetchDiscoverByYears } from "../src/lib/sources/tmdb";
import { slugify } from "../src/lib/sources/youtube";
import type { Watchable } from "../src/lib/sources/persist";

async function main() {
  const { db, hasDb } = await import("../src/lib/db");
  const schema = await import("../src/lib/schema");
  const { bulkUpsertWatchables } = await import("../src/lib/sources/persist");
  if (!hasDb || !db || !process.env.TMDB_API_KEY) {
    console.error("Servono DATABASE_URL e TMDB_API_KEY.");
    process.exit(1);
  }

  for (const [type, kind, fromY, minVotes] of [
    ["movie", "movie", 1960, 20],
    ["tv", "tv", 1970, 8],
  ] as const) {
    console.log(`\n=== ${kind}: backfill ${fromY}→2026 (anno per anno)…`);
    let total = 0;
    for (let year = 2026; year >= fromY; year--) {
      const items = await fetchDiscoverByYears(type, year, year, minVotes, 100000);
      if (!items.length) continue;
      const watchables: Watchable[] = items.map((it) => ({
        kind,
        slug: slugify(it.title),
        name: it.title,
        platform: "tmdb",
        country: "US",
        category: null,
        avatarUrl: it.poster,
        description: it.overview,
        sourceUrl: `https://www.themoviedb.org/${type}/${it.id}`,
        primary: it.voteCount,
        secondary: Math.round(it.voteAverage * 10),
      }));
      const n = await bulkUpsertWatchables(db, schema, watchables);
      total += n;
      console.log(`${kind} ${year}: +${n} (totale ${total})`);
    }
    console.log(`${kind}: completato, ${total}.`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
