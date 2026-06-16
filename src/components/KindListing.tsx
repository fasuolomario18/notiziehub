import { getLeaderboard } from "@/lib/data";
import type { Kind } from "@/lib/types";
import { Container, Breadcrumbs, Card } from "./ui";
import { Leaderboard } from "./Leaderboard";
import { AdSlot } from "./AdSlot";
import { JsonLd } from "./JsonLd";
import { itemListSchema } from "@/lib/schema-org";

const TITLES: Record<Kind, { h1: string; intro: string; plural: string }> = {
  creator: {
    h1: "Creator",
    plural: "Creator",
    intro:
      "Classifica dei creator per follower, con crescita e movimenti. Dati pubblici aggiornati in automatico.",
  },
  artist: {
    h1: "Artisti",
    plural: "Artisti",
    intro:
      "Gli artisti più ascoltati e in crescita, con andamento storico e confronti.",
  },
  track: {
    h1: "Brani",
    plural: "Brani",
    intro: "I brani con più stream e i loro movimenti settimanali.",
  },
  trend: {
    h1: "Trend",
    plural: "Trend",
    intro: "Hashtag, sound e challenge tracciati come fenomeni, con numeri.",
  },
  game: {
    h1: "Giochi",
    plural: "Giochi",
    intro: "I giochi più seguiti su Twitch e dintorni.",
  },
  video: {
    h1: "Video virali",
    plural: "Video",
    intro:
      "I video più visti del momento in Italia, con visualizzazioni, like e crescita. Aggiornati ogni giorno.",
  },
  anime: {
    h1: "Anime",
    plural: "Anime",
    intro:
      "Gli anime più popolari e meglio votati, con punteggio, fan e classifiche. Dati pubblici da AniList.",
  },
  movie: {
    h1: "Film",
    plural: "Film",
    intro:
      "I film più popolari e votati del momento, con voti, valutazione e tendenze. Dati pubblici da TMDB.",
  },
  tv: {
    h1: "Serie TV",
    plural: "Serie TV",
    intro:
      "Le serie TV più seguite e votate, con voti, valutazione e tendenze. Dati pubblici da TMDB.",
  },
};

export async function KindListing({ kind }: { kind: Kind }) {
  const t = TITLES[kind];
  const [rising, top] = await Promise.all([
    getLeaderboard({ kind, sort: "rising", limit: 15 }),
    getLeaderboard({ kind, sort: "top" }),
  ]);

  return (
    <>
      <JsonLd data={itemListSchema(top, t.h1)} />
      <Container>
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: t.plural, path: `/${kind}` },
          ]}
        />
        <h1 className="font-display text-4xl tracking-tight">{t.h1}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t.intro}</p>

        <AdSlot slot={`listing-${kind}-top`} />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="border-b border-line px-4 py-3">
              <h2 className="font-display text-lg text-rise">In salita ora</h2>
            </div>
            <Leaderboard items={rising} />
          </Card>
          <Card className="overflow-hidden">
            <div className="border-b border-line px-4 py-3">
              <h2 className="font-display text-lg">Top per dimensione</h2>
            </div>
            <Leaderboard items={top} />
          </Card>
        </div>
      </Container>
    </>
  );
}
