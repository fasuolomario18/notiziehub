import { notFound } from "next/navigation";
import Link from "next/link";
import { getRanking, getRankingConfigs } from "@/lib/data";
import { PLATFORM_LABEL } from "@/lib/types";
import type { Platform } from "@/lib/types";
import { entityHref } from "@/lib/links";
import { formatCompact } from "@/lib/format";
import { Container, Breadcrumbs, Card } from "@/components/ui";
import { DeltaBadge } from "@/components/DeltaBadge";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = true;
export const revalidate = 3600;

const MONTHS = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];
function periodLabel(p: string) {
  const [y, m] = p.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

export async function generateStaticParams() {
  if (process.env.NODE_ENV === "production") return [];
  const configs = await getRankingConfigs();
  return configs.map((c) => ({
    platform: c.platform,
    country: c.country,
    period: c.period,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string; country: string; period: string }>;
}) {
  const { platform, country, period } = await params;
  const label = PLATFORM_LABEL[platform as Platform] ?? platform;
  const title = `Classifica ${label} ${country} — ${periodLabel(period)}`;
  const description = `Top ${label} in ${country} a ${periodLabel(
    period
  )}: i più seguiti, con valori e crescita. Dati pubblici aggregati.`;
  const ranking = await getRanking(platform, country, period, 1);
  return {
    title,
    description,
    alternates: {
      canonical: `/classifiche/${platform}/${country}/${period}`,
    },
    robots:
      ranking.length > 0
        ? { index: true, follow: true }
        : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/classifiche/${platform}/${country}/${period}`),
    },
  };
}

export default async function RankingPage({
  params,
}: {
  params: Promise<{ platform: string; country: string; period: string }>;
}) {
  const { platform, country, period } = await params;
  const ranking = await getRanking(platform, country, period, 50);
  if (ranking.length === 0) notFound();
  const label = PLATFORM_LABEL[platform as Platform] ?? platform;
  const max = ranking[0].value;

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Classifica ${label} ${country} ${periodLabel(period)}`,
    numberOfItems: ranking.length,
    itemListElement: ranking.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(entityHref(r.entity)),
      name: r.entity.name,
    })),
  };

  return (
    <>
      <JsonLd data={schema} />
      <Container>
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Classifiche", path: "/classifiche" },
            {
              name: `${label} ${country} ${periodLabel(period)}`,
              path: `/classifiche/${platform}/${country}/${period}`,
            },
          ]}
        />
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
          Classifica {label} · {country}
        </h1>
        <p className="mt-1 text-muted">{periodLabel(period)}</p>

        <AdSlot slot="classifica-top" />

        <Card className="mt-4 overflow-hidden">
          <ol>
            {ranking.map((r, i) => {
              const w = Math.max(4, Math.round((r.value / max) * 100));
              return (
                <li
                  key={r.entity.slug}
                  className="border-b border-line last:border-0"
                >
                  <Link
                    href={entityHref(r.entity)}
                    className="grid grid-cols-[2.2rem_1fr_auto] items-center gap-3 px-3 py-3 hover:bg-surface-2/60"
                  >
                    <span
                      className={`tabnum text-right text-lg ${
                        i === 0 ? "text-peak" : "text-muted"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="truncate font-medium">
                        {r.entity.name}
                      </span>
                      <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-surface">
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${w}%`,
                            background: i === 0 ? "var(--peak)" : "var(--rise)",
                          }}
                        />
                      </span>
                    </span>
                    <span className="flex flex-col items-end">
                      <span className="tabnum">{formatCompact(r.value)}</span>
                      <DeltaBadge
                        value={r.entity.delta7d}
                        pct={r.entity.delta7dPct}
                        size="sm"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Card>
      </Container>
    </>
  );
}
