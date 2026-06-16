import Link from "next/link";
import { search, invalidateCache } from "@/lib/data";
import { hasDb, db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { searchChannelIds, fetchChannels } from "@/lib/sources/youtube";
import { upsertCreator } from "@/lib/sources/persist";
import { entityHref } from "@/lib/links";
import { formatCompact } from "@/lib/format";
import { metricLabel, KIND_LABEL } from "@/lib/types";
import { Container, Card } from "@/components/ui";
import { DeltaBadge } from "@/components/DeltaBadge";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cerca",
  description: "Cerca creator, artisti, brani, anime e altro. Se non c'è, lo troviamo per te.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  let results = await search(q);

  // RICERCA INFINITA: se nel DB ci sono pochi risultati, cerca su YouTube dal vivo,
  // aggiunge i canali trovati alla piattaforma e li mostra.
  let added = 0;
  if (q && results.length < 5 && hasDb && db && process.env.YOUTUBE_API_KEY) {
    try {
      const ids = await searchChannelIds(q, 8);
      if (ids.length) {
        const stats = await fetchChannels(ids);
        for (const s of stats) {
          await upsertCreator(db, schema, s, undefined);
          added++;
        }
        invalidateCache();
        results = await search(q);
      }
    } catch {
      /* se la ricerca live fallisce, mostra solo i risultati locali */
    }
  }

  return (
    <Container className="py-6">
      <h1 className="font-display text-3xl tracking-tight">Cerca</h1>
      <form action="/cerca" className="mt-4">
        <input
          name="q"
          defaultValue={q}
          autoFocus
          placeholder="creator, artista, brano, anime…"
          className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-paper placeholder:text-muted"
        />
      </form>

      {q ? (
        <p className="mt-4 text-sm text-muted">
          {results.length} risultati per “{q}”
          {added > 0 ? (
            <span className="text-rise"> · {added} nuovi aggiunti dal vivo ✨</span>
          ) : null}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((e) => (
          <Link key={`${e.kind}-${e.slug}`} href={entityHref(e)}>
            <Card className="p-4 transition hover:bg-surface-2">
              <p className="text-xs uppercase tracking-wide text-muted">
                {KIND_LABEL[e.kind]} · {e.platform}
              </p>
              <p className="mt-1 font-display text-lg">{e.name}</p>
              <p className="tabnum text-xl">{formatCompact(e.primary)}</p>
              <p className="text-xs text-muted">
                {metricLabel(e.kind, e.platform)}
              </p>
              <div className="mt-1">
                <DeltaBadge value={e.delta7d} pct={e.delta7dPct} size="sm" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {q && results.length === 0 ? (
        <p className="mt-6 text-muted">
          Nessun risultato. Prova con un altro nome, oppure{" "}
          <Link href="/aggiungi" className="text-rise underline">
            aggiungi tu il canale
          </Link>
          .
        </p>
      ) : null}
    </Container>
  );
}
