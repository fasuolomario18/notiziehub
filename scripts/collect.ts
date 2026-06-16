/**
 * Job di raccolta (cron). Brief sez. 5 — il loop "gira da solo":
 *   API ufficiali → upsert DB → riga storica datata → (ISR rigenera) → sitemap.
 *
 * Aggiorna TUTTI i canali già nel DB (storico giornaliero + crescita per ognuno)
 * e si assicura che i canali curati esistano.
 *
 * Esecuzione:  npm run collect      Richiede: DATABASE_URL, YOUTUBE_API_KEY
 */
import { config } from "dotenv";
config({ path: ".env.local" }); // in locale; in CI le env vengono dai secrets
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { fetchChannels, fetchByHandle } from "../src/lib/sources/youtube";

function channelIdFromUrl(url: string | null): string | null {
  const m = url?.match(/channel\/(UC[0-9A-Za-z_-]{20,})/);
  return m ? m[1] : null;
}

async function main() {
  // import dinamici DOPO il caricamento env (db.ts legge process.env al load)
  const { db, hasDb } = await import("../src/lib/db");
  const schema = await import("../src/lib/schema");
  const { upsertCreator } = await import("../src/lib/sources/persist");

  if (!hasDb || !db) {
    console.error("DATABASE_URL mancante: il job richiede un Postgres.");
    process.exit(1);
  }
  if (!process.env.YOUTUBE_API_KEY) {
    console.error("YOUTUBE_API_KEY mancante.");
    process.exit(1);
  }

  // 1) Assicura i canali curati (per handle) — utile al primo avvio.
  const cfg = JSON.parse(
    readFileSync(join(process.cwd(), "data", "youtube-channels.json"), "utf8")
  ) as { channels: { handle?: string; category?: string }[] };
  for (const c of cfg.channels.filter((c) => c.handle)) {
    try {
      const stat = await fetchByHandle(c.handle!);
      if (stat) await upsertCreator(db, schema, stat, c.category);
    } catch {
      /* tollerato */
    }
  }

  // 2) Rinfresca TUTTI i creator YouTube già nel DB (storico+crescita per ognuno).
  const rows = await db
    .select({
      sourceUrl: schema.entities.sourceUrl,
      category: schema.entities.category,
    })
    .from(schema.entities)
    .where(eq(schema.entities.platform, "youtube"));

  const idToCat = new Map<string, string | undefined>();
  for (const r of rows) {
    const id = channelIdFromUrl(r.sourceUrl);
    if (id) idToCat.set(id, r.category ?? undefined);
  }
  const ids = [...idToCat.keys()];
  console.log(`Aggiorno ${ids.length} canali esistenti…`);

  const stats = await fetchChannels(ids); // 1 unità ogni 50 → economico
  let updated = 0;
  for (const s of stats) {
    await upsertCreator(db, schema, s, idToCat.get(s.channelId));
    updated++;
  }

  console.log(`Fatto: ${updated} canali aggiornati (storico + crescita).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
