/**
 * Import Twitch: streamer live + giochi per spettatori correnti.
 *   npm run twitch   Richiede: DATABASE_URL, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { fetchTopStreams } from "../src/lib/sources/twitch";
import { slugify } from "../src/lib/sources/youtube";
import type { Watchable } from "../src/lib/sources/persist";

async function main() {
  const { db, hasDb } = await import("../src/lib/db");
  const schema = await import("../src/lib/schema");
  const { bulkUpsertWatchables } = await import("../src/lib/sources/persist");
  if (!hasDb || !db || !process.env.TWITCH_CLIENT_ID) {
    console.error("Servono DATABASE_URL e credenziali Twitch.");
    process.exit(1);
  }

  const streams = await fetchTopStreams(20); // ~2000 stream live top
  console.log(`Stream live: ${streams.length}`);

  // Streamer (kind creator, platform twitch)
  const streamers: Watchable[] = streams.map((s) => ({
    kind: "creator",
    slug: slugify(s.userLogin),
    name: s.userName || s.userLogin,
    platform: "twitch",
    country: "",
    category: "streamer",
    avatarUrl: s.thumbnail,
    description: s.game ? `In diretta: ${s.game}` : "Streamer Twitch",
    sourceUrl: `https://www.twitch.tv/${s.userLogin}`,
    primary: s.viewers,
    secondary: 0,
  }));

  // Giochi (kind game): spettatori correnti aggregati
  const byGame = new Map<string, number>();
  for (const s of streams) {
    if (!s.game) continue;
    byGame.set(s.game, (byGame.get(s.game) ?? 0) + s.viewers);
  }
  const games: Watchable[] = [...byGame.entries()].map(([game, viewers]) => ({
    kind: "game",
    slug: slugify(game),
    name: game,
    platform: "twitch",
    country: "",
    category: "gaming",
    description: `Spettatori in diretta su Twitch`,
    sourceUrl: `https://www.twitch.tv/directory/game/${encodeURIComponent(game)}`,
    primary: viewers,
    secondary: 0,
  }));

  console.log(`Streamer salvati: ${await bulkUpsertWatchables(db, schema, streamers)}`);
  console.log(`Giochi salvati: ${await bulkUpsertWatchables(db, schema, games)}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
