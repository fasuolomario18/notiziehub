import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Connessione Postgres opzionale.
 * Se DATABASE_URL non è impostata, db === null e il data-layer usa i dati seed.
 * Così il sito gira in locale senza dipendenze esterne e diventa "live" appena
 * colleghi Neon/Supabase.
 */
const url = process.env.DATABASE_URL;

export const hasDb = Boolean(url);

const client = url
  ? postgres(url, { prepare: false, max: 5 })
  : null;

export const db = client ? drizzle(client, { schema }) : null;

export { schema };
