import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Connessione Postgres opzionale.
 * Se DATABASE_URL non è impostata, db === null e il data-layer usa i dati seed.
 * Così il sito gira in locale senza dipendenze esterne e diventa "live" appena
 * colleghi Neon/Supabase.
 */
// In build (SSG su DB free-tier) il transaction pooler 6543 dà ETIMEDOUT:
// preferiamo la session pooler (DIRECT_URL, 5432) quando disponibile.
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;

export const hasDb = Boolean(url);

// Pool piccolo: in build (9 worker SSG) tante connessioni saturano il pooler
// free-tier. max:1 + il memo di processo (data-db) = 1 query per worker.
const client = url
  ? postgres(url, { prepare: false, max: 1, idle_timeout: 20, connect_timeout: 30 })
  : null;

export const db = client ? drizzle(client, { schema }) : null;

export { schema };
