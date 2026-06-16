import Link from "next/link";
import { search } from "@/lib/data";
import { entityHref } from "@/lib/links";
import { formatCompact } from "@/lib/format";
import { metricLabel, KIND_LABEL } from "@/lib/types";
import { Container, Card } from "@/components/ui";
import { DeltaBadge } from "@/components/DeltaBadge";

export const metadata = {
  title: "Cerca",
  description: "Cerca creator, artisti, brani e trend.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = await search(q);
  return (
    <Container className="py-6">
      <h1 className="font-display text-3xl tracking-tight">Cerca</h1>
      <form action="/cerca" className="mt-4">
        <input
          name="q"
          defaultValue={q}
          autoFocus
          placeholder="creator, artista, brano…"
          className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-paper placeholder:text-muted"
        />
      </form>

      {q ? (
        <p className="mt-4 text-sm text-muted">
          {results.length} risultati per “{q}”
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((e) => (
          <Link key={e.slug} href={entityHref(e)}>
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
    </Container>
  );
}
