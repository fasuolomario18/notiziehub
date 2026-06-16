import Link from "next/link";
import type { EntityView } from "@/lib/types";
import { metricLabel, KIND_LABEL, PLATFORM_LABEL } from "@/lib/types";
import { entityHref } from "@/lib/links";
import { formatCompact, formatFull, formatPct } from "@/lib/format";
import { GrowthChart } from "./GrowthChart";
import { Odometer } from "./Odometer";
import { DeltaBadge } from "./DeltaBadge";
import { Container, Card, StatBlock, Breadcrumbs } from "./ui";
import { AdSlot } from "./AdSlot";
import { JsonLd } from "./JsonLd";
import { entitySchema } from "@/lib/schema-org";

const PLURAL: Record<string, string> = {
  creator: "Creator",
  artist: "Artisti",
  track: "Brani",
  trend: "Trend",
  game: "Giochi",
};

export function EntityProfile({
  e,
  similar,
  versusCandidates = [],
}: {
  e: EntityView;
  similar: EntityView[];
  versusCandidates?: EntityView[];
}) {
  const color = e.delta7d >= 0 ? "var(--rise)" : "var(--signal)";
  return (
    <>
      <JsonLd data={entitySchema(e)} />
      <Container>
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: PLURAL[e.kind] ?? e.kind, path: `/${e.kind}` },
            { name: e.name, path: entityHref(e) },
          ]}
        />

        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
              <span>{KIND_LABEL[e.kind]}</span>
              <span aria-hidden>·</span>
              <span>{PLATFORM_LABEL[e.platform]}</span>
              {e.category ? (
                <>
                  <span aria-hidden>·</span>
                  <Link href={`/tag/${e.category}`} className="hover:text-paper">
                    #{e.category}
                  </Link>
                </>
              ) : null}
            </div>
            <h1 className="mt-1 font-display text-4xl tracking-tight sm:text-5xl">
              {e.name}
            </h1>
            <p className="mt-2 max-w-2xl text-muted">{e.description}</p>
          </div>
          <div className="text-right">
            <Odometer value={e.primary} className="text-4xl" />
            <p className="text-sm text-muted">{metricLabel(e.kind, e.platform)}</p>
            <div className="mt-1 flex justify-end">
              <DeltaBadge value={e.delta7d} pct={e.delta7dPct} />
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock label="Totale" value={formatFull(e.primary)} />
          <StatBlock
            label="Ultime 24h"
            value={formatCompact(e.delta24h)}
            accent={e.delta24h >= 0 ? "rise" : "signal"}
          />
          <StatBlock
            label="Ultimi 7 giorni"
            value={formatCompact(e.delta7d)}
            accent={e.delta7d >= 0 ? "rise" : "signal"}
          />
          <StatBlock
            label="Variazione 7g"
            value={formatPct(e.delta7dPct)}
            accent={e.delta7dPct >= 0 ? "rise" : "signal"}
          />
        </div>

        <Card className="mt-6 p-4">
          <h2 className="mb-2 font-display text-xl">Crescita (30 giorni)</h2>
          <GrowthChart data={e.history} color={color} />
        </Card>

        <AdSlot slot="profile" />

        {versusCandidates.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-3 font-display text-xl">Confronti</h2>
            <div className="flex flex-wrap gap-2">
              {versusCandidates.map((c) => (
                <Link
                  key={c.slug}
                  href={`/vs/${e.slug}/${c.slug}`}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm hover:bg-surface-2"
                >
                  {e.name} <span className="text-muted">vs</span> {c.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {similar.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-3 font-display text-xl">Simili</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {similar.map((s) => (
                <Link
                  key={s.slug}
                  href={entityHref(s)}
                  className="rounded-xl border border-line bg-surface p-3 hover:bg-surface-2"
                >
                  <p className="truncate font-medium">{s.name}</p>
                  <p className="tabnum text-lg">{formatCompact(s.primary)}</p>
                  <DeltaBadge value={s.delta7d} pct={s.delta7dPct} size="sm" />
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-8 text-sm text-muted">
          Fonte dati:{" "}
          <a
            href={e.sourceUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-rise underline"
          >
            {PLATFORM_LABEL[e.platform]} ↗
          </a>
        </p>
      </Container>
    </>
  );
}
