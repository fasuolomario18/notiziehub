/** Glossario editoriale (brief sez. 2: poche pagine, scritte a mano). */
export type GlossaryEntry = {
  slug: string;
  term: string;
  short: string;
  body: string[]; // paragrafi
};

export const GLOSSARY: GlossaryEntry[] = [
  {
    slug: "dissing",
    term: "Dissing",
    short:
      "Scambio di brani o contenuti tra artisti in cui ci si sfida apertamente.",
    body: [
      "Un dissing è uno scontro pubblico tra artisti — di solito rapper — portato avanti a colpi di brani, freestyle o uscite social. Nasce nella cultura hip hop e ha radici nei battle storici tra MC.",
      "Su notiziehub trattiamo il dissing come fenomeno musicale e di pubblico: guardiamo l'impatto sui numeri (stream, ascolti, crescita social) e raccogliamo i sondaggi della community su chi ha avuto la meglio. Non pubblichiamo accuse né ricostruzioni diffamatorie: solo i dati pubblici e le reazioni del pubblico.",
      "È un formato che genera molto traffico perché muove fandom intere nello stesso momento — ma proprio per questo va raccontato con i fatti, non con il gossip.",
    ],
  },
  {
    slug: "creator-economy",
    term: "Creator economy",
    short:
      "L'insieme di attività economiche generate da chi crea contenuti online.",
    body: [
      "La creator economy comprende tutti i modi in cui un creator monetizza: pubblicità, sponsorizzazioni, abbonamenti, merchandising, prodotti propri.",
      "I numeri di follower e visualizzazioni che tracciamo sono il primo indicatore del valore di mercato di un creator: più pubblico fedele, più potere contrattuale.",
    ],
  },
  {
    slug: "cpm",
    term: "CPM",
    short:
      "Costo per mille impression: quanto vale pubblicitariamente mille visualizzazioni.",
    body: [
      "Il CPM (Cost Per Mille) indica quanto un inserzionista paga per mille impression di un annuncio. È la metrica base con cui si stima il valore pubblicitario di un pubblico.",
      "I contenuti gaming e tech tendono ad avere CPM più alti del lifestyle puro: per questo notiziehub mescola nicchie ad alto traffico e nicchie ad alto valore.",
    ],
  },
];

export function getGlossaryEntry(slug: string): GlossaryEntry | undefined {
  return GLOSSARY.find((g) => g.slug === slug);
}
