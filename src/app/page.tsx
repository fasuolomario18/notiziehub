import Link from "next/link";
import { getLeaderboard, getTicker, getEntitiesByKind } from "@/lib/data";
import { Ticker } from "@/components/Ticker";
import { Leaderboard } from "@/components/Leaderboard";
import { EntityCard } from "@/components/EntityCard";
import { Odometer } from "@/components/Odometer";
import { Container, SectionTitle, Card } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { websiteSchema, itemListSchema } from "@/lib/schema-org";
import { formatCompact } from "@/lib/format";

export const revalidate = 3600; // ISR: rigenera ogni ora

const PILLARS = [
  { href: "/creator", label: "Creator", color: "var(--signal)" },
  { href: "/artist", label: "Musica", color: "var(--rise)" },
  { href: "/classifiche", label: "Classifiche", color: "var(--peak)" },
  { href: "/trend", label: "Trend", color: "var(--signal)" },
  { href: "/vs", label: "Versus", color: "var(--rise)" },
];

export default async function Home() {
  const [rising, topCreators, artists, trends, videos, anime, manga, movies, series, ticker] =
    await Promise.all([
      getLeaderboard({ sort: "rising", limit: 10 }),
      getLeaderboard({ kind: "creator", sort: "top", limit: 6 }),
      getLeaderboard({ kind: "artist", sort: "top", limit: 6 }),
      getEntitiesByKind("trend"),
      getLeaderboard({ kind: "video", sort: "top", limit: 8 }),
      getLeaderboard({ kind: "anime", sort: "top", limit: 6 }),
      getLeaderboard({ kind: "manga", sort: "top", limit: 6 }),
      getLeaderboard({ kind: "movie", sort: "top", limit: 6 }),
      getLeaderboard({ kind: "tv", sort: "top", limit: 6 }),
      getTicker(14),
    ]);

  const topMover = rising[0];

  return (
    <>
      <JsonLd data={[websiteSchema(), itemListSchema(rising, "In salita ora")]} />
      <Ticker items={ticker} />

      <Container className="py-8">
        {/* HERO: classifica viva, non il "numerone + gradiente" */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-rise">
              In salita ora
            </p>
            <h1 className="mt-1 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
              Il tabellone vivo della{" "}
              <span className="text-signal">cultura giovane</span>
            </h1>
            <p className="mt-3 max-w-xl text-muted">
              Classifiche, crescite e confronti di creator, artisti e brani. Dati
              pubblici, aggiornati in automatico. Niente gossip: solo numeri e
              fonti.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {PILLARS.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm transition hover:bg-surface-2"
                  style={{ boxShadow: `inset 2px 0 0 ${p.color}` }}
                >
                  {p.label}
                </Link>
              ))}
            </div>

            {topMover ? (
              <Card className="mt-6 p-5">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Movimento del giorno
                </p>
                <p className="mt-1 font-display text-2xl">{topMover.name}</p>
                <p className="mt-2">
                  <Odometer
                    value={topMover.primary}
                    className="text-4xl text-peak"
                  />{" "}
                  <span className="text-sm text-muted">{topMover.platform}</span>
                </p>
                <p className="mt-1 text-sm text-rise">
                  +{formatCompact(topMover.delta7d)} negli ultimi 7 giorni
                </p>
              </Card>
            ) : null}
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-line px-4 py-3">
              <h2 className="font-display text-lg">Leaderboard live</h2>
            </div>
            <Leaderboard items={rising} />
          </Card>
        </div>

        <AdSlot slot="home-top" />

        <section className="mt-10">
          <SectionTitle href="/creator">Creator più seguiti</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {topCreators.map((e) => (
              <EntityCard key={e.slug} e={e} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <SectionTitle href="/artist">Artisti del momento</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {artists.map((e) => (
              <EntityCard key={e.slug} e={e} />
            ))}
          </div>
        </section>

        {videos.length > 0 ? (
          <section className="mt-10">
            <SectionTitle href="/video">Video virali in Italia</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {videos.map((e) => (
                <EntityCard key={e.slug} e={e} />
              ))}
            </div>
          </section>
        ) : null}

        {anime.length > 0 ? (
          <section className="mt-10">
            <SectionTitle href="/anime">Anime più popolari</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {anime.map((e) => (
                <EntityCard key={e.slug} e={e} />
              ))}
            </div>
          </section>
        ) : null}

        {manga.length > 0 ? (
          <section className="mt-10">
            <SectionTitle href="/manga">Manga più popolari</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {manga.map((e) => (
                <EntityCard key={e.slug} e={e} />
              ))}
            </div>
          </section>
        ) : null}

        {movies.length > 0 ? (
          <section className="mt-10">
            <SectionTitle href="/film">Film del momento</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {movies.map((e) => (
                <EntityCard key={e.slug} e={e} />
              ))}
            </div>
          </section>
        ) : null}

        {series.length > 0 ? (
          <section className="mt-10">
            <SectionTitle href="/serie-tv">Serie TV del momento</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {series.map((e) => (
                <EntityCard key={e.slug} e={e} />
              ))}
            </div>
          </section>
        ) : null}

        {trends.length > 0 ? (
          <section className="mt-10">
            <SectionTitle href="/trend">Trend che girano</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {trends.map((e) => (
                <EntityCard key={e.slug} e={e} />
              ))}
            </div>
          </section>
        ) : null}

        <AdSlot slot="home-bottom" />
      </Container>
    </>
  );
}
