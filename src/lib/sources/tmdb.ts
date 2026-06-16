/**
 * TMDB (The Movie Database) — film e serie TV. Gratis con API key (TMDB_API_KEY).
 * Doc: https://developer.themoviedb.org/
 */
export type TmdbItem = {
  id: number;
  title: string;
  popularity: number;
  voteCount: number;
  voteAverage: number; // 0-10
  poster?: string;
  overview: string;
};

const IMG = "https://image.tmdb.org/t/p/w185";

/** Popolari per tipo (movie|tv). pages per paginare (20 risultati/pagina). */
export async function fetchPopular(
  type: "movie" | "tv",
  pages = 3
): Promise<TmdbItem[]> {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY mancante");
  const out: TmdbItem[] = [];
  for (let page = 1; page <= pages; page++) {
    const url =
      `https://api.themoviedb.org/3/${type}/popular?api_key=${key}` +
      `&language=it-IT&region=IT&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`TMDB ${type} ${res.status}: ${await res.text()}`);
      break;
    }
    const json = (await res.json()) as {
      results?: Array<{
        id: number;
        title?: string;
        name?: string;
        popularity: number;
        vote_count: number;
        vote_average: number;
        poster_path?: string;
        overview?: string;
      }>;
    };
    for (const r of json.results ?? []) {
      out.push({
        id: r.id,
        title: r.title || r.name || `#${r.id}`,
        popularity: r.popularity ?? 0,
        voteCount: r.vote_count ?? 0,
        voteAverage: r.vote_average ?? 0,
        poster: r.poster_path ? `${IMG}${r.poster_path}` : undefined,
        overview: (r.overview ?? "").slice(0, 300),
      });
    }
  }
  return out;
}
