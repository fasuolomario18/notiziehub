/**
 * Spotify Web API (client credentials). Artisti + brani con follower/popolarità.
 * Richiede SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET.
 * Endpoint usati: /search (artist|track) — attivi anche per le app nuove.
 */
export type SpotifyArtist = {
  id: string;
  name: string;
  followers: number;
  popularity: number;
  genres: string[];
  image?: string;
  url: string;
};
export type SpotifyTrack = {
  id: string;
  name: string;
  artist: string;
  popularity: number;
  image?: string;
  url: string;
};

let _token: { value: string; exp: number } | null = null;

async function getToken(): Promise<string> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Spotify creds mancanti");
  if (_token && Date.now() < _token.exp) return _token.value;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Spotify token ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  _token = { value: json.access_token, exp: Date.now() + (json.expires_in - 60) * 1000 };
  return _token.value;
}

async function searchPage(
  q: string,
  type: "artist" | "track",
  offset: number,
  token: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const url =
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}` +
    `&type=${type}&limit=50&offset=${offset}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 429) {
    const wait = Number(res.headers.get("retry-after") ?? "2") * 1000;
    await new Promise((r) => setTimeout(r, wait + 500));
    return searchPage(q, type, offset, token);
  }
  if (!res.ok) return null;
  return res.json();
}

/** Artisti per generi (fino a 1000 per genere, limite offset Spotify). */
export async function fetchArtistsByGenres(genres: string[]): Promise<SpotifyArtist[]> {
  const token = await getToken();
  const out: SpotifyArtist[] = [];
  const seen = new Set<string>();
  for (const g of genres) {
    for (let offset = 0; offset <= 950; offset += 50) {
      const json = await searchPage(`genre:"${g}"`, "artist", offset, token);
      const items = json?.artists?.items ?? [];
      if (!items.length) break;
      for (const a of items) {
        if (seen.has(a.id)) continue;
        seen.add(a.id);
        out.push({
          id: a.id,
          name: a.name,
          followers: a.followers?.total ?? 0,
          popularity: a.popularity ?? 0,
          genres: a.genres ?? [],
          image: a.images?.[1]?.url ?? a.images?.[0]?.url,
          url: a.external_urls?.spotify ?? `https://open.spotify.com/artist/${a.id}`,
        });
      }
      if (items.length < 50) break;
    }
  }
  return out;
}

/** Brani per anno (fino a 1000 per anno). */
export async function fetchTracksByYears(fromYear: number, toYear: number): Promise<SpotifyTrack[]> {
  const token = await getToken();
  const out: SpotifyTrack[] = [];
  const seen = new Set<string>();
  for (let year = toYear; year >= fromYear; year--) {
    for (let offset = 0; offset <= 950; offset += 50) {
      const json = await searchPage(`year:${year}`, "track", offset, token);
      const items = json?.tracks?.items ?? [];
      if (!items.length) break;
      for (const t of items) {
        if (seen.has(t.id)) continue;
        seen.add(t.id);
        out.push({
          id: t.id,
          name: t.name,
          artist: t.artists?.[0]?.name ?? "",
          popularity: t.popularity ?? 0,
          image: t.album?.images?.[1]?.url ?? t.album?.images?.[0]?.url,
          url: t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`,
        });
      }
      if (items.length < 50) break;
    }
  }
  return out;
}
