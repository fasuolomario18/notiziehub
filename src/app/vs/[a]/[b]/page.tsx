import { notFound } from "next/navigation";
import Link from "next/link";
import { getBySlug, getVersusPairs } from "@/lib/data";
import type { EntityView } from "@/lib/types";
import { metricLabel, PLATFORM_LABEL } from "@/lib/types";
import { entityHref } from "@/lib/links";
import { formatCompact, formatFull, formatPct } from "@/lib/format";
import { Container, Breadcrumbs, Card } from "@/components/ui";
import { GrowthChart } from "@/components/GrowthChart";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  const pairs = await getVersusPairs();
  return pairs.map(([a, b]) => ({ a: a.slug, b: b.slug }));
}

async function loadPair(a: string, b: string) {
  const [ea, eb] = await Promise.all([getBySlug(a), getBySlug(b)]);
  if (!ea || !eb || ea.slug === eb.slug) return null;
  return { ea, eb };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}) {
  const { a, b } = await params;
  const pair = await loadPair(a, b);
  if (!pair) return {};
  const { ea, eb } = pair;
  const sensible = ea.kind === eb.kind && ea.category === eb.category;
  const title = `${ea.name} vs ${eb.name} — chi ha più ${metricLabel(
    ea.kind,
    ea.platform
  )}?`;
  const description = `Confronto tra ${ea.name} (${formatCompact(
    ea.primary
  )}) e ${eb.name} (${formatCompact(eb.primary)}): ${metricLabel(
    ea.kind,
    ea.platform
  )}, crescita e andamento a confronto.`;
  return {
    title,
    description,
    alternates: { canonical: `/vs/${ea.slug}/${eb.slug}` },
    // Versus sensati = indicizzabili; combinazioni assurde = noindex (sez. 2)
    robots: sensible
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: { title, description, url: absoluteUrl(`/vs/${ea.slug}/${eb.slug}`) },
  };
}

function Side({ e, win }: { e: EntityView; win: boolean }) {
  return (
    <div className={`flex-1 ${win ? "" : "opacity-90"}`}>
      <Link href={entityHref(e)} className="font-display text-2xl hover:underline">
        {e.name}
      </Link>
      <p className="text-xs uppercase tracking-wide text-muted">
        {PLATFORM_LABEL[e.platform]}
      </p>
      <p
        className={`tabnum mt-2 text-4xl ${win ? "text-peak" : "text-paper"}`}
      >
        {formatCompact(e.primary)}
      </p>
      <p className="text-sm text-muted">{metricLabel(e.kind, e.platform)}</p>
    </div>
  );
}

function Row({
  label,
  a,
  b,
  fmt = formatFull,
}: {
  label: string;
  a: number;
  b: number;
  fmt?: (n: number) => string;
}) {
  return (
    <div className="grid grid-cols-3 items-center border-b border-line py-2 text-sm last:border-0">
      <span className={`tabnum ${a >= b ? "text-rise" : "text-muted"}`}>
        {fmt(a)}
      </span>
      <span className="text-center text-xs uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className={`tabnum text-right ${b >= a ? "text-rise" : "text-muted"}`}>
        {fmt(b)}
      </span>
    </div>
  );
}

export default async function VersusPage({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}) {
  const { a, b } = await params;
  const pair = await loadPair(a, b);
  if (!pair) notFound();
  const { ea, eb } = pair;

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${ea.name} vs ${eb.name}`,
    itemListElement: [ea, eb].map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(entityHref(e)),
      name: e.name,
    })),
  };

  return (
    <>
      <JsonLd data={schema} />
      <Container>
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Versus", path: "/vs" },
            { name: `${ea.name} vs ${eb.name}`, path: `/vs/${ea.slug}/${eb.slug}` },
          ]}
        />
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
          {ea.name} <span className="text-signal">vs</span> {eb.name}
        </h1>

        <Card className="mt-6 p-6">
          <div className="flex items-center gap-4">
            <Side e={ea} win={ea.primary >= eb.primary} />
            <span className="font-display text-2xl text-muted">vs</span>
            <Side e={eb} win={eb.primary > ea.primary} />
          </div>
          <div className="mt-6">
            <Row label={metricLabel(ea.kind, ea.platform)} a={ea.primary} b={eb.primary} />
            <Row label="ultimi 7 giorni" a={ea.delta7d} b={eb.delta7d} fmt={formatCompact} />
            <Row
              label="variazione 7g"
              a={ea.delta7dPct}
              b={eb.delta7dPct}
              fmt={formatPct}
            />
          </div>
        </Card>

        <AdSlot slot="versus" />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h2 className="mb-2 font-display text-lg">{ea.name}</h2>
            <GrowthChart data={ea.history} color="#2DE3B0" height={180} />
          </Card>
          <Card className="p-4">
            <h2 className="mb-2 font-display text-lg">{eb.name}</h2>
            <GrowthChart data={eb.history} color="#FF4D6D" height={180} />
          </Card>
        </div>
      </Container>
    </>
  );
}
