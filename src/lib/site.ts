/** Configurazione centrale del sito. */
export const SITE = {
  name: "notiziehub",
  tagline: "Il tabellone vivo della cultura giovane",
  description:
    "Classifiche, statistiche e crescite di creator, artisti e brani — dati pubblici aggiornati in automatico. Il tabellone vivo della cultura giovane.",
  // URL pubblico: in produzione impostare NEXT_PUBLIC_SITE_URL.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://notizihub.com",
  locale: "it_IT",
  email: "info@plasmacompany.net",
  // Limite Google per sitemap
  sitemapChunkSize: 45000,
} as const;

export function absoluteUrl(path = ""): string {
  const base = SITE.url.replace(/\/$/, "");
  return path ? `${base}${path.startsWith("/") ? "" : "/"}${path}` : base;
}
