/**
 * Dati seed realistici per far girare il sito SENZA DB né chiavi API.
 * Quando DATABASE_URL è configurato, il data-layer (data.ts) usa il DB e ignora questo file.
 *
 * NB: numeri verosimili a scopo dimostrativo. In produzione arrivano dalle API
 * ufficiali (YouTube/Spotify/Twitch) e ogni entità linka la sua fonte.
 */

export type SeedEntity = {
  kind: "creator" | "track" | "artist" | "game" | "trend";
  slug: string;
  name: string;
  platform: "youtube" | "tiktok" | "twitch" | "instagram" | "spotify";
  country: string; // ISO2
  category: string;
  avatarUrl?: string;
  description: string;
  sourceUrl: string;
  // metrica primaria attuale (follower/stream/viewer)
  primary: number;
  secondary: number;
  // crescita media giornaliera (per generare lo storico)
  dailyGrowth: number;
  volatility: number; // 0..1
};

export const SEED: SeedEntity[] = [
  // ---- CREATOR ----
  {
    kind: "creator", slug: "khaby-lame", name: "Khaby Lame", platform: "tiktok",
    country: "IT", category: "comedy",
    description: "Creator comedy senza-parole, tra i più seguiti al mondo.",
    sourceUrl: "https://www.tiktok.com/@khaby.lame",
    primary: 162_400_000, secondary: 2_500_000_000, dailyGrowth: 38_000, volatility: 0.4,
  },
  {
    kind: "creator", slug: "favij", name: "Favij", platform: "youtube",
    country: "IT", category: "gaming",
    description: "Storico youtuber gaming italiano.",
    sourceUrl: "https://www.youtube.com/@favij",
    primary: 6_350_000, secondary: 3_900_000_000, dailyGrowth: 900, volatility: 0.6,
  },
  {
    kind: "creator", slug: "elisa-maino", name: "Elisa Maino", platform: "instagram",
    country: "IT", category: "lifestyle",
    description: "Creator lifestyle e moda.",
    sourceUrl: "https://www.instagram.com/elisamaino",
    primary: 3_180_000, secondary: 0, dailyGrowth: 400, volatility: 0.5,
  },
  {
    kind: "creator", slug: "illuminati-crew", name: "iLLuminati Crew", platform: "youtube",
    country: "IT", category: "gaming",
    description: "Collettivo gaming/intrattenimento.",
    sourceUrl: "https://www.youtube.com/@iLLuminatiCrew",
    primary: 2_010_000, secondary: 720_000_000, dailyGrowth: 1_200, volatility: 0.7,
  },
  {
    kind: "creator", slug: "marcoz", name: "Marcoz", platform: "twitch",
    country: "IT", category: "gaming",
    description: "Streamer Twitch, gaming e just chatting.",
    sourceUrl: "https://www.twitch.tv/marcoz",
    primary: 720_000, secondary: 0, dailyGrowth: 2_100, volatility: 0.9,
  },
  {
    kind: "creator", slug: "pow3r", name: "POW3R", platform: "twitch",
    country: "IT", category: "gaming",
    description: "Pro player e streamer.",
    sourceUrl: "https://www.twitch.tv/pow3r",
    primary: 1_150_000, secondary: 0, dailyGrowth: 1_500, volatility: 0.8,
  },
  {
    kind: "creator", slug: "grenbaud", name: "Grenbaud", platform: "twitch",
    country: "IT", category: "gaming",
    description: "Streamer in forte crescita.",
    sourceUrl: "https://www.twitch.tv/grenbaud",
    primary: 980_000, secondary: 0, dailyGrowth: 3_400, volatility: 0.9,
  },
  {
    kind: "creator", slug: "luis-sal", name: "Luis Sal", platform: "youtube",
    country: "IT", category: "comedy",
    description: "Creator comedy/intrattenimento.",
    sourceUrl: "https://www.youtube.com/@LuisSal",
    primary: 3_420_000, secondary: 480_000_000, dailyGrowth: -200, volatility: 0.5,
  },
  // ---- ARTISTI ----
  {
    kind: "artist", slug: "lazza", name: "Lazza", platform: "spotify",
    country: "IT", category: "rap-italiano",
    description: "Rapper e produttore, tra i più ascoltati in Italia.",
    sourceUrl: "https://open.spotify.com/artist/lazza",
    primary: 9_200_000, secondary: 0, dailyGrowth: 6_000, volatility: 0.5,
  },
  {
    kind: "artist", slug: "geolier", name: "Geolier", platform: "spotify",
    country: "IT", category: "rap-italiano",
    description: "Rapper napoletano, numeri da record.",
    sourceUrl: "https://open.spotify.com/artist/geolier",
    primary: 8_700_000, secondary: 0, dailyGrowth: 9_800, volatility: 0.6,
  },
  {
    kind: "artist", slug: "sfera-ebbasta", name: "Sfera Ebbasta", platform: "spotify",
    country: "IT", category: "trap-italiano",
    description: "Pioniere della trap italiana.",
    sourceUrl: "https://open.spotify.com/artist/sfera-ebbasta",
    primary: 7_900_000, secondary: 0, dailyGrowth: 2_200, volatility: 0.4,
  },
  {
    kind: "artist", slug: "tananai", name: "Tananai", platform: "spotify",
    country: "IT", category: "pop-italiano",
    description: "Cantante pop, ascolti in crescita.",
    sourceUrl: "https://open.spotify.com/artist/tananai",
    primary: 5_100_000, secondary: 0, dailyGrowth: 4_500, volatility: 0.7,
  },
  // ---- BRANI / TRACK ----
  {
    kind: "track", slug: "100-messaggi", name: "100 Messaggi — Lazza", platform: "spotify",
    country: "IT", category: "rap-italiano",
    description: "Singolo certificato multiplatino.",
    sourceUrl: "https://open.spotify.com/track/100-messaggi",
    primary: 210_000_000, secondary: 0, dailyGrowth: 320_000, volatility: 0.3,
  },
  {
    kind: "track", slug: "i-p-a-bb-tt", name: "I p' me, tu p' te — Geolier", platform: "spotify",
    country: "IT", category: "rap-italiano",
    description: "Brano sanremese da numeri enormi.",
    sourceUrl: "https://open.spotify.com/track/i-p-me-tu-p-te",
    primary: 185_000_000, secondary: 0, dailyGrowth: 410_000, volatility: 0.4,
  },
  {
    kind: "track", slug: "tuta-gold", name: "Tuta Gold — Mahmood", platform: "spotify",
    country: "IT", category: "pop-italiano",
    description: "Hit pop con streaming costanti.",
    sourceUrl: "https://open.spotify.com/track/tuta-gold",
    primary: 142_000_000, secondary: 0, dailyGrowth: 260_000, volatility: 0.3,
  },
  // ---- TREND ----
  {
    kind: "trend", slug: "italianbrainrot", name: "#italianbrainrot", platform: "tiktok",
    country: "IT", category: "trend",
    description: "Trend audio/meme virale.",
    sourceUrl: "https://www.tiktok.com/tag/italianbrainrot",
    primary: 4_800_000, secondary: 0, dailyGrowth: 120_000, volatility: 1.0,
  },
  {
    kind: "trend", slug: "gymtok", name: "#gymtok", platform: "tiktok",
    country: "IT", category: "trend",
    description: "Fitness e palestra su TikTok.",
    sourceUrl: "https://www.tiktok.com/tag/gymtok",
    primary: 12_300_000, secondary: 0, dailyGrowth: 45_000, volatility: 0.6,
  },
];
