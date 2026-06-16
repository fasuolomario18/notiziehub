import type { EntityView, Kind } from "./types";

/** URL canonico di un'entità in base al tipo. */
export function entityHref(e: Pick<EntityView, "kind" | "slug">): string {
  switch (e.kind) {
    case "creator":
      return `/creator/${e.slug}`;
    case "track":
      return `/track/${e.slug}`;
    case "artist":
      return `/artist/${e.slug}`;
    case "trend":
      return `/trend/${e.slug}`;
    case "game":
      return `/game/${e.slug}`;
  }
}

export function versusHref(a: EntityView, b: EntityView): string {
  return `/vs/${a.slug}/${b.slug}`;
}

export function rankingHref(platform: string, country: string, period: string): string {
  return `/classifiche/${platform}/${country}/${period}`;
}

export function tagHref(category: string): string {
  return `/tag/${category}`;
}

export const KIND_PLURAL_PATH: Record<Kind, string> = {
  creator: "creator",
  track: "track",
  artist: "artist",
  game: "game",
  trend: "trend",
};
