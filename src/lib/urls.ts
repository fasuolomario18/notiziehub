import type { MetadataRoute } from "next";
import {
  getAllEntities,
  getVersusPairs,
  getRankingConfigs,
  getCategories,
  getEntitiesByCategory,
} from "./data";
import { entityHref, versusHref, rankingHref, tagHref } from "./links";
import { absoluteUrl } from "./site";
import { GLOSSARY } from "./glossary";

type Entry = MetadataRoute.Sitemap[number];

/**
 * Tutti gli URL indicizzabili del sito, in un'unica lista.
 * Esclude (noindex) le pagine con dati insufficienti — la "regola d'oro" (sez. 2)
 * è applicata qui prima ancora che a livello di meta robots.
 */
export async function collectUrls(): Promise<Entry[]> {
  const now = new Date();
  const entries: Entry[] = [];

  // Pagine statiche / hub
  const staticPaths: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["/", 1, "hourly"],
    ["/creator", 0.9, "hourly"],
    ["/artist", 0.9, "hourly"],
    ["/track", 0.8, "daily"],
    ["/trend", 0.8, "daily"],
    ["/classifiche", 0.8, "daily"],
    ["/vs", 0.7, "weekly"],
    ["/cos-e", 0.5, "monthly"],
    ["/metodo", 0.4, "monthly"],
  ];
  for (const [path, priority, changeFrequency] of staticPaths) {
    entries.push({ url: absoluteUrl(path), lastModified: now, priority, changeFrequency });
  }

  // Entità (solo indicizzabili)
  const all = await getAllEntities();
  for (const e of all) {
    if (!e.indexable) continue;
    entries.push({
      url: absoluteUrl(entityHref(e)),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  // Confronti sensati
  const pairs = await getVersusPairs();
  for (const [a, b] of pairs) {
    entries.push({
      url: absoluteUrl(versusHref(a, b)),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // Classifiche datate
  const configs = await getRankingConfigs();
  for (const c of configs) {
    entries.push({
      url: absoluteUrl(rankingHref(c.platform, c.country, c.period)),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  // Tag (categorie con abbastanza entità)
  const categories = await getCategories();
  for (const cat of categories) {
    const items = await getEntitiesByCategory(cat);
    if (items.length < 3) continue;
    entries.push({
      url: absoluteUrl(tagHref(cat)),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  // Glossario
  for (const g of GLOSSARY) {
    entries.push({
      url: absoluteUrl(`/cos-e/${g.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }

  return entries;
}
