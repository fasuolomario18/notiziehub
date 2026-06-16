/**
 * Import Spotify: artisti (per genere) + brani (per anno). bulk insert.
 *   npm run spotify   Richiede: DATABASE_URL, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { fetchArtistsByGenres, fetchTracksByYears } from "../src/lib/sources/spotify";
import { slugify } from "../src/lib/sources/youtube";
import type { Watchable } from "../src/lib/sources/persist";

const GENRES = [
  "italian hip hop", "italian pop", "italian indie", "italian rock", "rap napoletano",
  "pop", "rock", "hip hop", "rap", "trap", "indie", "edm", "dance pop", "r&b",
  "latin", "reggaeton", "k-pop", "metal", "jazz", "classical", "country",
  "house", "techno", "soul", "punk", "folk", "funk", "lo-fi", "drill", "afrobeats",
];

async function main() {
  const { db, hasDb } = await import("../src/lib/db");
  const schema = await import("../src/lib/schema");
  const { bulkUpsertWatchables } = await import("../src/lib/sources/persist");
  if (!hasDb || !db || !process.env.SPOTIFY_CLIENT_ID) {
    console.error("Servono DATABASE_URL e credenziali Spotify.");
    process.exit(1);
  }

  // Artisti
  const artists = await fetchArtistsByGenres(GENRES);
  const aw: Watchable[] = artists.map((a) => ({
    kind: "artist",
    slug: slugify(a.name),
    name: a.name,
    platform: "spotify",
    country: a.genres.some((g) => g.includes("italian")) ? "IT" : "",
    category: a.genres[0] ? slugify(a.genres[0]) : null,
    avatarUrl: a.image,
    description: a.genres.slice(0, 3).join(", "),
    sourceUrl: a.url,
    primary: a.followers,
    secondary: a.popularity,
  }));
  console.log(`Artisti: ${aw.length}, salvo…`);
  console.log(`Artisti salvati: ${await bulkUpsertWatchables(db, schema, aw)}`);

  // Brani
  const tracks = await fetchTracksByYears(2010, 2026);
  const tw: Watchable[] = tracks.map((t) => ({
    kind: "track",
    slug: slugify(`${t.name}-${t.artist}`),
    name: `${t.name} — ${t.artist}`,
    platform: "spotify",
    country: "",
    category: null,
    avatarUrl: t.image,
    description: `Brano di ${t.artist}`,
    sourceUrl: t.url,
    primary: t.popularity, // indice di popolarità Spotify (0-100)
    secondary: t.popularity,
  }));
  console.log(`Brani: ${tw.length}, salvo…`);
  console.log(`Brani salvati: ${await bulkUpsertWatchables(db, schema, tw)}`);

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
