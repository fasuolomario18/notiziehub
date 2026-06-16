/**
 * Scoperta automatica canali YouTube italiani (cresce la piattaforma da sola).
 *   per ogni query → search.list → channels.list (stats) → filtro qualità → upsert DB.
 *
 * Esecuzione:  npm run discover
 * Richiede: DATABASE_URL, YOUTUBE_API_KEY
 * Quota: ~100 unità per query (search.list). Le query sono dosate per stare sotto i 10k/giorno.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import {
  discoverChannelIds,
  fetchChannels,
} from "../src/lib/sources/youtube";

const MIN_SUBS = 20_000; // soglia qualità: niente micro-canali (evita pagine sottili)

// Query per categoria: ognuna porta fino a ~50 canali. Aggiungerne = più copertura.
const QUERIES: Record<string, string[]> = {
  gaming: ["gaming italiano", "videogiochi ita", "minecraft ita", "fortnite ita", "gameplay italiano", "streamer italiano"],
  musica: ["rap italiano", "trap italiana", "musica italiana", "cantante italiano", "indie italiano", "pop italiano"],
  comedy: ["comedy italiano", "sketch comici", "comici italiani", "parodie italiane"],
  scienza: ["divulgazione scientifica", "scienza italiano", "storia italiano", "documentari italiano"],
  intrattenimento: ["intrattenimento italiano", "vlog italiano", "reaction italiano", "challenge italiano"],
  tech: ["tecnologia italiano", "recensioni tech ita", "smartphone italiano", "informatica italiano"],
  attualita: ["attualità italiano", "news italiano", "approfondimento italiano"],
  sport: ["calcio italiano youtube", "sport italiano", "fitness italiano", "palestra italiano"],
  cucina: ["ricette italiane", "cucina italiano", "food italiano"],
  beauty: ["beauty italiano", "makeup italiano", "moda italiano"],
  viaggi: ["viaggi italiano", "travel italiano"],
  finanza: ["finanza personale italiano", "investimenti italiano", "economia italiano"],
  auto: ["auto italiano youtube", "motori italiano"],
};

async function main() {
  const { db, hasDb } = await import("../src/lib/db");
  const schema = await import("../src/lib/schema");
  const { upsertCreator } = await import("../src/lib/sources/persist");

  if (!hasDb || !db) {
    console.error("DATABASE_URL mancante.");
    process.exit(1);
  }
  if (!process.env.YOUTUBE_API_KEY) {
    console.error("YOUTUBE_API_KEY mancante.");
    process.exit(1);
  }

  // 1) scoperta ID per categoria
  const catByChannel = new Map<string, string>();
  for (const [category, queries] of Object.entries(QUERIES)) {
    for (const q of queries) {
      try {
        const ids = await discoverChannelIds(q, 1);
        for (const id of ids) if (!catByChannel.has(id)) catByChannel.set(id, category);
        console.log(`"${q}" → ${ids.length} canali`);
      } catch (err) {
        console.warn(`query "${q}" errore:`, (err as Error).message);
      }
    }
  }
  const allIds = [...catByChannel.keys()];
  console.log(`Totale canali unici scoperti: ${allIds.length}`);

  // 2) statistiche in batch (1 unità ogni 50)
  const stats = await fetchChannels(allIds);

  // 3) filtro qualità + upsert
  let added = 0;
  for (const s of stats) {
    if (s.subscribers < MIN_SUBS) continue;
    // accetta canali IT o senza paese dichiarato (molti non lo impostano)
    if (s.country && s.country !== "IT") continue;
    await upsertCreator(db, schema, s, catByChannel.get(s.channelId));
    added++;
  }
  console.log(`Aggiunti/aggiornati ${added} canali (≥${MIN_SUBS} iscritti).`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
