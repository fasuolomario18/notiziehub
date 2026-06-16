import Link from "next/link";
import { GLOSSARY } from "@/lib/glossary";
import { Container, Breadcrumbs, Card } from "@/components/ui";

export const metadata = {
  title: "Glossario — le parole della cultura giovane",
  description:
    "Cosa significano dissing, creator economy, CPM e gli altri termini del mondo creator e musica. Spiegazioni chiare.",
  alternates: { canonical: "/cos-e" },
};

export default function Page() {
  return (
    <Container>
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Glossario", path: "/cos-e" },
        ]}
      />
      <h1 className="font-display text-4xl tracking-tight">Glossario</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Le parole della cultura giovane, spiegate con chiarezza.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GLOSSARY.map((g) => (
          <Link key={g.slug} href={`/cos-e/${g.slug}`}>
            <Card className="p-4 transition hover:bg-surface-2">
              <p className="font-display text-lg">{g.term}</p>
              <p className="mt-1 text-sm text-muted">{g.short}</p>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
