/**
 * Twitch Helix API (client credentials). Stream live → streamer + giochi per
 * spettatori correnti. Richiede TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET.
 */
export type TwitchStream = {
  userLogin: string;
  userName: string;
  viewers: number;
  game: string;
  thumbnail?: string;
};

let _token: { value: string; exp: number } | null = null;

async function getToken(): Promise<string> {
  const id = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Twitch creds mancanti");
  if (_token && Date.now() < _token.exp) return _token.value;
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error(`Twitch token ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  _token = { value: json.access_token, exp: Date.now() + (json.expires_in - 60) * 1000 };
  return _token.value;
}

/** Top stream live (paginati), fino a maxPages × 100. */
export async function fetchTopStreams(maxPages = 10): Promise<TwitchStream[]> {
  const token = await getToken();
  const id = process.env.TWITCH_CLIENT_ID!;
  const out: TwitchStream[] = [];
  let cursor = "";
  for (let p = 0; p < maxPages; p++) {
    const url =
      `https://api.twitch.tv/helix/streams?first=100` + (cursor ? `&after=${cursor}` : "");
    const res = await fetch(url, {
      headers: { "Client-Id": id, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) break;
    const json = (await res.json()) as {
      data?: Array<{
        user_login: string;
        user_name: string;
        viewer_count: number;
        game_name: string;
        thumbnail_url?: string;
      }>;
      pagination?: { cursor?: string };
    };
    for (const s of json.data ?? []) {
      out.push({
        userLogin: s.user_login,
        userName: s.user_name,
        viewers: s.viewer_count ?? 0,
        game: s.game_name ?? "",
        thumbnail: s.thumbnail_url?.replace("{width}", "320").replace("{height}", "180"),
      });
    }
    cursor = json.pagination?.cursor ?? "";
    if (!cursor) break;
  }
  return out;
}
