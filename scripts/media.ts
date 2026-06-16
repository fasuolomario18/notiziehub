/**
 * Raccolta "mondo dell'intrattenimento": anime (AniList, gratis senza chiave)
 * + film/serie TV (TMDB, se TMDB_API_KEY presente).
 *
 * Esecuzione:  npm run media      Richiede: DATABASE_URL (+ TMDB_API_KEY per film/serie)
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { fetchTopAnime, fetchTopManga } from "../src/lib/sources/anilist";
import { fetchPopular } from "../src/lib/sources/tmdb";
import { slugify } from "../src/lib/sources/youtube";

async function main() {
  const { db, hasDb } = await import("../src/lib/db");
  const schema = await import("../src/lib/schema");
  const { upsertWatchable } = await import("../src/lib/sources/persist");

  if (!hasDb || !db) {
    console.error("DATABASE_URL mancante.");
    process.exit(1);
  }

  // ANIME + MANGA (AniList, nessuna chiave) — cataloghi ampi
  for (const [type, kind, pages] of [
    ["ANIME", "anime", 120],
    ["MANGA", "manga", 120],
  ] as const) {
    try {
      const items =
        type === "ANIME" ? await fetchTopAnime(pages, 50) : await fetchTopManga(pages, 50);
      let n = 0;
      for (const a of items) {
        await upsertWatchable(db, schema, {
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
        });
        n++;
      }
      console.log(`${kind} aggiornati: ${n}`);
    } catch (err) {
      console.warn(`${kind}:`, (err as Error).message);
    }
  }

  // FILM + SERIE TV (TMDB, se chiave presente)
  if (process.env.TMDB_API_KEY) {
    for (const [type, kind] of [
      ["movie", "movie"],
      ["tv", "tv"],
    ] as const) {
      try {
        const items = await fetchPopular(type, 5);
        for (const it of items) {
          await upsertWatchable(db, schema, {
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
          });
        }
        console.log(`${kind} aggiornati: ${items.length}`);
      } catch (err) {
        console.warn(`${kind}:`, (err as Error).message);
      }
    }
  } else {
    console.log("TMDB_API_KEY assente: salto film/serie TV (anime fatto).");
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
