import {
  pgTable,
  text,
  integer,
  bigint,
  timestamp,
  date,
  serial,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Entità = qualsiasi "cosa" tracciata (creator, brano, artista, gioco, trend).
 * Un'unica tabella polimorfica tiene il modello semplice e permette le pagine /vs
 * e le classifiche cross-categoria senza join complicati.
 */
export const entities = pgTable(
  "entities",
  {
    id: serial("id").primaryKey(),
    // "creator" | "track" | "artist" | "game" | "trend"
    kind: text("kind").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    // piattaforma principale: youtube | tiktok | twitch | instagram | spotify
    platform: text("platform").notNull(),
    country: text("country"), // ISO2, es. IT
    category: text("category"), // es. "rap-italiano", "gaming"
    avatarUrl: text("avatar_url"),
    description: text("description"),
    sourceUrl: text("source_url"), // link alla fonte (obbligo legale)
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("entities_kind_slug_idx").on(t.kind, t.slug),
    index("entities_kind_idx").on(t.kind),
    index("entities_platform_idx").on(t.platform),
    index("entities_country_idx").on(t.country),
  ]
);

/**
 * Stato corrente di un'entità: una sola riga per entità, sovrascritta a ogni run.
 * Tenuta separata dallo storico per letture veloci nelle classifiche.
 */
export const stats = pgTable("stats", {
  entityId: integer("entity_id")
    .primaryKey()
    .references(() => entities.id, { onDelete: "cascade" }),
  // metrica primaria (follower / stream / viewer medi)
  primaryMetric: bigint("primary_metric", { mode: "number" }).notNull().default(0),
  // metrica secondaria (views totali / like ...)
  secondaryMetric: bigint("secondary_metric", { mode: "number" }).default(0),
  // delta sulle ultime 24h e 7 giorni (calcolato dal job)
  delta24h: bigint("delta_24h", { mode: "number" }).default(0),
  delta7d: bigint("delta_7d", { mode: "number" }).default(0),
  capturedAt: timestamp("captured_at").defaultNow().notNull(),
});

/**
 * Storico datato: UNA riga per entità per giorno.
 * È IL valore del sito — genera gli archivi e i grafici di crescita,
 * e nessuno può copiarlo. (Brief, sez. 4 e 11/Fase 4.)
 */
export const history = pgTable(
  "history",
  {
    id: serial("id").primaryKey(),
    entityId: integer("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
    primaryMetric: bigint("primary_metric", { mode: "number" }).notNull(),
    secondaryMetric: bigint("secondary_metric", { mode: "number" }),
  },
  (t) => [
    uniqueIndex("history_entity_day_idx").on(t.entityId, t.day),
    index("history_day_idx").on(t.day),
  ]
);

/**
 * Snapshot datato di una classifica = archivio storico.
 * Ogni run del cron ne salva una versione → /classifiche/.../2026-06 (nuovi URL nel tempo).
 */
export const rankingSnapshots = pgTable(
  "ranking_snapshots",
  {
    id: serial("id").primaryKey(),
    platform: text("platform").notNull(), // youtube | tiktok | twitch | spotify
    country: text("country").notNull(), // "italia" | "global" ...
    period: text("period").notNull(), // "2026-06" (mensile) o "2026-06-16" (giornaliero)
    // lista ordinata di { entityId, value } serializzata
    entries: text("entries").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("ranking_unique_idx").on(t.platform, t.country, t.period),
  ]
);

/** Sondaggi della community (Fase 4). */
export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  question: text("question").notNull(),
  // opzioni serializzate [{id,label}]
  options: text("options").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pollVotes = pgTable(
  "poll_votes",
  {
    id: serial("id").primaryKey(),
    pollId: integer("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    optionId: text("option_id").notNull(),
    // hash IP+UA per anti-doppio-voto, mai IP in chiaro (privacy, sez. 8)
    voterHash: text("voter_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("poll_voter_idx").on(t.pollId, t.voterHash)]
);

export type Entity = typeof entities.$inferSelect;
export type Stat = typeof stats.$inferSelect;
export type History = typeof history.$inferSelect;
