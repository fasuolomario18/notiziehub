export type Kind =
  | "creator"
  | "track"
  | "artist"
  | "game"
  | "trend"
  | "video"
  | "anime"
  | "manga"
  | "movie"
  | "tv";
export type Platform =
  | "youtube"
  | "tiktok"
  | "twitch"
  | "instagram"
  | "spotify"
  | "anilist"
  | "tmdb";

export type HistoryPoint = {
  day: string; // YYYY-MM-DD
  value: number;
};

export type EntityView = {
  kind: Kind;
  slug: string;
  name: string;
  platform: Platform;
  country: string;
  category: string;
  avatarUrl?: string;
  description: string;
  sourceUrl: string;
  primary: number;
  secondary: number;
  delta24h: number;
  delta7d: number;
  delta7dPct: number;
  history: HistoryPoint[];
  /** true se i dati bastano a indicizzare la pagina (sez. 2: regola d'oro) */
  indexable: boolean;
};

export const KIND_LABEL: Record<Kind, string> = {
  creator: "Creator",
  track: "Brano",
  artist: "Artista",
  game: "Gioco",
  trend: "Trend",
  video: "Video",
  anime: "Anime",
  manga: "Manga",
  movie: "Film",
  tv: "Serie TV",
};

export const PLATFORM_LABEL: Record<Platform, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  twitch: "Twitch",
  instagram: "Instagram",
  spotify: "Spotify",
  anilist: "AniList",
  tmdb: "TMDB",
};

/** Unità della metrica primaria per tipo di entità. */
export function metricLabel(kind: Kind, platform: Platform): string {
  if (kind === "video") return "visualizzazioni";
  if (kind === "anime" || kind === "manga") return "fan";
  if (kind === "movie" || kind === "tv") return "voti";
  if (kind === "track") return "stream";
  if (kind === "trend") return "video";
  if (platform === "twitch") return "follower";
  if (platform === "spotify") return "ascoltatori mensili";
  return "follower";
}
