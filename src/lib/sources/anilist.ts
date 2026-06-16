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
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: POPULARITY_DESC) {
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

/** Top anime per popolarità. perPage max 50; pages per paginare. */
export async function fetchTopAnime(pages = 2, perPage = 50): Promise<AnimeItem[]> {
  const out: AnimeItem[] = [];
  for (let page = 1; page <= pages; page++) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { page, perPage } }),
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
