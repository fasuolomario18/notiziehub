/**
 * AniList GraphQL API — anime (e manga). Pubblica, GRATIS, nessuna chiave.
 * Doc: https://anilist.gitbook.io/anilist-apiv2-docs/
 */
export type AnimeItem = {
  id: number;
  title: string;
  popularity: number; // n. utenti che lo seguono
  averageScore: number; // 0-100
  genres: string[];
  cover?: string;
  siteUrl: string;
  description: string;
};

const ENDPOINT = "https://graphql.anilist.co";

const QUERY = `
query ($page: Int, $perPage: Int, $type: MediaType) {
  Page(page: $page, perPage: $perPage) {
    media(type: $type, sort: POPULARITY_DESC) {
      id
      title { romaji english }
      popularity
      averageScore
      genres
      siteUrl
      coverImage { medium }
      description(asHtml: false)
    }
  }
}`;

function stripHtml(s: string | null): string {
  return (s ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

/** Top media (ANIME|MANGA) per popolarità. perPage max 50; pages per paginare. */
export async function fetchTopMedia(
  type: "ANIME" | "MANGA",
  pages = 2,
  perPage = 50
): Promise<AnimeItem[]> {
  const out: AnimeItem[] = [];
  for (let page = 1; page <= pages; page++) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { page, perPage, type } }),
    });
    if (!res.ok) {
      console.warn(`AniList ${res.status}: ${await res.text()}`);
      break;
    }
    const json = (await res.json()) as {
      data?: {
        Page?: {
          media?: Array<{
            id: number;
            title: { romaji?: string; english?: string };
            popularity: number;
            averageScore: number | null;
            genres: string[];
            siteUrl: string;
            coverImage?: { medium?: string };
            description?: string;
          }>;
        };
      };
    };
    for (const m of json.data?.Page?.media ?? []) {
      out.push({
        id: m.id,
        title: m.title.english || m.title.romaji || `Anime ${m.id}`,
        popularity: m.popularity ?? 0,
        averageScore: m.averageScore ?? 0,
        genres: m.genres ?? [],
        cover: m.coverImage?.medium,
        siteUrl: m.siteUrl,
        description: stripHtml(m.description ?? ""),
      });
    }
    // rispetta il rate limit di AniList (degradato a ~30 req/min)
    await new Promise((r) => setTimeout(r, 2100));
  }
  return out;
}

export const fetchTopAnime = (pages = 2, perPage = 50) =>
  fetchTopMedia("ANIME", pages, perPage);
export const fetchTopManga = (pages = 2, perPage = 50) =>
  fetchTopMedia("MANGA", pages, perPage);

const YEAR_QUERY = `
query ($page: Int, $perPage: Int, $type: MediaType, $from: FuzzyDateInt, $to: FuzzyDateInt) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { hasNextPage }
    media(type: $type, sort: POPULARITY_DESC, startDate_greater: $from, startDate_lesser: $to) {
      id
      title { romaji english }
      popularity
      averageScore
      genres
      siteUrl
      coverImage { medium }
      description(asHtml: false)
    }
  }
}`;

/**
 * Cataloghi INTERI: pagina anno per anno (così si supera il tetto di 5000 entries
 * della paginazione semplice). Recente → vecchio. Stop a maxItems.
 */
export async function fetchMediaByYears(
  type: "ANIME" | "MANGA",
  fromYear: number,
  toYear: number,
  maxItems = 100000
): Promise<AnimeItem[]> {
  const out: AnimeItem[] = [];
  const seen = new Set<number>();
  for (let year = toYear; year >= fromYear && out.length < maxItems; year--) {
    let page = 1;
    while (out.length < maxItems) {
      let json: {
        data?: { Page?: { pageInfo?: { hasNextPage?: boolean }; media?: Array<Record<string, unknown>> } };
      };
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            query: YEAR_QUERY,
            variables: { page, perPage: 50, type, from: year * 10000, to: (year + 1) * 10000 },
          }),
        });
        if (res.status === 429) {
          await new Promise((r) => setTimeout(r, 60000)); // rate limit: aspetta
          continue;
        }
        if (!res.ok) break;
        json = await res.json();
      } catch {
        break;
      }
      const media = json.data?.Page?.media ?? [];
      for (const m of media as Array<{
        id: number;
        title: { romaji?: string; english?: string };
        popularity: number;
        averageScore: number | null;
        genres: string[];
        siteUrl: string;
        coverImage?: { medium?: string };
        description?: string;
      }>) {
        if (seen.has(m.id)) continue;
        seen.add(m.id);
        out.push({
          id: m.id,
          title: m.title.english || m.title.romaji || `#${m.id}`,
          popularity: m.popularity ?? 0,
          averageScore: m.averageScore ?? 0,
          genres: m.genres ?? [],
          cover: m.coverImage?.medium,
          siteUrl: m.siteUrl,
          description: stripHtml(m.description ?? ""),
        });
      }
      await new Promise((r) => setTimeout(r, 2100));
      if (!json.data?.Page?.pageInfo?.hasNextPage) break;
      page++;
    }
  }
  return out;
}
