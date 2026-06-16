/**
 * Fonte ufficiale: YouTube Data API v3 (brief sez. 4).
 * Gratis, quota 10.000 unità/giorno → channels.list costa 1 unità a chiamata
 * con fino a 50 id per richiesta. Cache aggressiva consigliata.
 *
 * Richiede env YOUTUBE_API_KEY.
 */

export type ChannelStat = {
  channelId: string;
  title: string;
  description: string;
  thumbnail?: string;
  country?: string;
  subscribers: number;
  views: number;
  videos: number;
};

const API = "https://www.googleapis.com/youtube/v3/channels";

type ApiItem = {
  id: string;
  snippet: {
    title: string;
    description: string;
    country?: string;
    thumbnails?: { medium?: { url: string } };
  };
  statistics: {
    subscriberCount?: string;
    viewCount?: string;
    videoCount?: string;
  };
};

function mapItem(item: ApiItem): ChannelStat {
  return {
    channelId: item.id,
    title: item.snippet.title,
    description: item.snippet.description?.slice(0, 280) ?? "",
    thumbnail: item.snippet.thumbnails?.medium?.url,
    country: item.snippet.country,
    subscribers: Number(item.statistics.subscriberCount ?? 0),
    views: Number(item.statistics.viewCount ?? 0),
    videos: Number(item.statistics.videoCount ?? 0),
  };
}

/** Recupera statistiche per fino a 50 canali per ID in una sola chiamata (1 unità). */
export async function fetchChannels(ids: string[]): Promise<ChannelStat[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY mancante");
  const out: ChannelStat[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const url = `${API}?part=snippet,statistics&id=${batch.join(",")}&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube API ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { items?: ApiItem[] };
    for (const item of json.items ?? []) out.push(mapItem(item));
  }
  return out;
}

/** Risolve un handle (@nome) in statistiche canale (1 unità). null se non trovato. */
export async function fetchByHandle(handle: string): Promise<ChannelStat | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY mancante");
  const h = handle.replace(/^@/, "");
  const url = `${API}?part=snippet,statistics&forHandle=${encodeURIComponent(h)}&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as { items?: ApiItem[] };
  const item = json.items?.[0];
  return item ? mapItem(item) : null;
}

/**
 * Scoperta canali via search.list (100 unità/chiamata).
 * Restituisce gli ID canale trovati per una query, regione IT.
 * pages>1 pagina i risultati (50 per pagina) — occhio alla quota.
 */
export async function discoverChannelIds(
  query: string,
  pages = 1
): Promise<string[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY mancante");
  const ids: string[] = [];
  let pageToken = "";
  for (let p = 0; p < pages; p++) {
    const url =
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel` +
      `&regionCode=IT&relevanceLanguage=it&maxResults=50&q=${encodeURIComponent(query)}` +
      (pageToken ? `&pageToken=${pageToken}` : "") +
      `&key=${key}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`search "${query}" ${res.status}: ${await res.text()}`);
      break;
    }
    const json = (await res.json()) as {
      nextPageToken?: string;
      items?: Array<{ id?: { channelId?: string }; snippet?: { channelId?: string } }>;
    };
    for (const it of json.items ?? []) {
      const id = it.id?.channelId ?? it.snippet?.channelId;
      if (id) ids.push(id);
    }
    if (!json.nextPageToken) break;
    pageToken = json.nextPageToken;
  }
  return ids;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
