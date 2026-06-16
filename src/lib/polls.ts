/**
 * Sondaggi della community (brief Fase 4).
 * In produzione i voti vanno su Postgres (tabelle polls/poll_votes nello schema).
 * Senza DB il conteggio è in-memory (riparte a ogni deploy) — utile per la demo.
 */

export type Poll = {
  slug: string;
  question: string;
  options: { id: string; label: string }[];
};

export const SEED_POLLS: Poll[] = [
  {
    slug: "miglior-rapper-2026",
    question: "Chi è il miglior rapper italiano del 2026?",
    options: [
      { id: "lazza", label: "Lazza" },
      { id: "geolier", label: "Geolier" },
      { id: "sfera", label: "Sfera Ebbasta" },
      { id: "tananai", label: "Tananai" },
    ],
  },
  {
    slug: "creator-dell-anno",
    question: "Creator dell'anno?",
    options: [
      { id: "khaby", label: "Khaby Lame" },
      { id: "favij", label: "Favij" },
      { id: "grenbaud", label: "Grenbaud" },
    ],
  },
];

// Conteggio base in-memory (slug → optionId → voti)
const tally = new Map<string, Map<string, number>>();
const BASE: Record<string, Record<string, number>> = {
  "miglior-rapper-2026": { lazza: 1240, geolier: 1890, sfera: 760, tananai: 540 },
  "creator-dell-anno": { khaby: 3200, favij: 1100, grenbaud: 1450 },
};

function ensure(slug: string): Map<string, number> {
  if (!tally.has(slug)) {
    const m = new Map<string, number>();
    for (const [k, v] of Object.entries(BASE[slug] ?? {})) m.set(k, v);
    tally.set(slug, m);
  }
  return tally.get(slug)!;
}

export function getPoll(slug: string): Poll | undefined {
  return SEED_POLLS.find((p) => p.slug === slug);
}

export function getResults(slug: string): Record<string, number> {
  const m = ensure(slug);
  return Object.fromEntries(m.entries());
}

export function vote(slug: string, optionId: string): Record<string, number> {
  const poll = getPoll(slug);
  if (!poll || !poll.options.some((o) => o.id === optionId)) {
    throw new Error("voto non valido");
  }
  const m = ensure(slug);
  m.set(optionId, (m.get(optionId) ?? 0) + 1);
  return Object.fromEntries(m.entries());
}
