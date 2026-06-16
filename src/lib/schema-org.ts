import type { EntityView } from "./types";
import { SITE, absoluteUrl } from "./site";
import { entityHref } from "./links";

/** WebSite + SearchAction per la home. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: absoluteUrl(),
    description: SITE.description,
    inLanguage: "it-IT",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/cerca?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

/** Person (creator), MusicGroup (artista) o MusicRecording (brano). */
export function entitySchema(e: EntityView) {
  const url = absoluteUrl(entityHref(e));
  const base = {
    "@context": "https://schema.org",
    name: e.name,
    url,
    description: e.description,
    sameAs: [e.sourceUrl],
  };
  if (e.kind === "artist") {
    return { ...base, "@type": "MusicGroup", genre: e.category };
  }
  if (e.kind === "track") {
    return { ...base, "@type": "MusicRecording", genre: e.category };
  }
  // creator / trend / game → Person/Thing con metriche interaction
  return {
    ...base,
    "@type": e.kind === "creator" ? "Person" : "Thing",
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/FollowAction",
      userInteractionCount: e.primary,
    },
  };
}

/** ItemList per classifiche e leaderboard. */
export function itemListSchema(items: EntityView[], name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(entityHref(e)),
      name: e.name,
    })),
  };
}
