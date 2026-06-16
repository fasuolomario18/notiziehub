import type { MetadataRoute } from "next";
import {
  getSitemapSlugs,
  getVersusPairs,
  getRankingConfigs,
  getCategories,
} from "./data";
import { entityHref, versusHref, rankingHref, tagHref } from "./links";
import { absoluteUrl } from "./site";
import { GLOSSARY } from "./glossary";

type Entry = MetadataRoute.Sitemap[number];

/**
 * Tutti gli URL indicizzabili (scala-ready: usa query slug minimali).
 */
export async function collectUrls(): Promise<Entry[]> {
  const now = new Date();
  const entries: Entry[] = [];

  const staticPaths: [string, number, Entry["changeFrequency"]][] = [
    ["/", 1, "hourly"],
    ["/creator", 0.9, "hourly"],
    ["/artist", 0.8, "daily"],
    ["/track", 0.7, "daily"],
    ["/video", 0.8, "daily"],
    ["/anime", 0.9, "daily"],
    ["/film", 0.8, "daily"],
    ["/serie-tv", 0.8, "daily"],
    ["/trend", 0.7, "daily"],
    ["/classifiche", 0.8, "daily"],
    ["/vs", 0.6, "weekly"],
    ["/cos-e", 0.5, "monthly"],
    ["/metodo", 0.4, "monthly"],
    ["/aggiungi", 0.5, "monthly"],
  ];
  for (const [path, priority, changeFrequency] of staticPaths) {
    entries.push({ url: absoluteUrl(path), lastModified: now, priority, changeFrequency });
  }

  // Entità indicizzabili (minimal: kind+slug)
  for (const e of await getSitemapSlugs()) {
    entries.push({
      url: absoluteUrl(entityHref(e)),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Confronti sensati (bounded)
  for (const [a, b] of await getVersusPairs()) {
    entries.push({ url: absoluteUrl(versusHref(a, b)), lastModified: now, priority: 0.5 });
  }

  // Classifiche datate
  for (const c of await getRankingConfigs()) {
    entries.push({
      url: absoluteUrl(rankingHref(c.platform, c.country, c.period)),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  // Tag (categorie con abbastanza entità)
  for (const cat of await getCategories()) {
    entries.push({ url: absoluteUrl(tagHref(cat)), lastModified: now, priority: 0.5 });
  }

  // Glossario
  for (const g of GLOSSARY) {
    entries.push({ url: absoluteUrl(`/cos-e/${g.slug}`), lastModified: now, priority: 0.4 });
  }

  return entries;
}
