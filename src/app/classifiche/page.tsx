import Link from "next/link";
import { getRankingConfigs } from "@/lib/data";
import { PLATFORM_LABEL } from "@/lib/types";
import type { Platform } from "@/lib/types";
import { Container, Breadcrumbs, Card } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { rankingHref } from "@/lib/links";

export const revalidate = 3600;
export const metadata = {
  title: "Classifiche — per piattaforma, paese e mese",
  description:
    "Classifiche mensili di creator, artisti e brani per piattaforma e paese. Ogni mese viene archiviato: un tabellone storico della cultura giovane.",
  alternates: { canonical: "/classifiche" },
};

function periodLabel(p: string) {
  const [y, m] = p.split("-");
  const months = [
    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
  ];
  return `${months[Number(m) - 1]} ${y}`;
}

export default async function Page() {
  const configs = await getRankingConfigs();
  return (
    <Container>
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Classifiche", path: "/classifiche" },
        ]}
      />
      <h1 className="font-display text-4xl tracking-tight">Classifiche</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Per piattaforma, paese e mese. Ogni mese resta archiviato: nel tempo si
        costruisce uno storico che nessuno può copiarti.
      </p>

      <AdSlot slot="classifiche-index" />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {configs.map((c) => (
          <Link
            key={`${c.platform}-${c.country}-${c.period}`}
            href={rankingHref(c.platform, c.country, c.period)}
          >
            <Card className="p-4 transition hover:bg-surface-2">
              <p className="font-display text-lg">
                {PLATFORM_LABEL[c.platform as Platform] ?? c.platform} ·{" "}
                {c.country}
              </p>
              <p className="text-sm text-muted">{periodLabel(c.period)}</p>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
