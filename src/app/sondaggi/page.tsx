import { SEED_POLLS, getResults } from "@/lib/polls";
import { PollCard } from "@/components/PollCard";
import { Container, Breadcrumbs } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sondaggi della community",
  description:
    "Vota e di' la tua: chi è il miglior rapper, il creator dell'anno e i fenomeni del momento. I sondaggi della community di notiziehub.",
  alternates: { canonical: "/sondaggi" },
};

export default function Page() {
  return (
    <Container className="max-w-3xl">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Sondaggi", path: "/sondaggi" },
        ]}
      />
      <h1 className="font-display text-4xl tracking-tight">Sondaggi</h1>
      <p className="mt-2 text-muted">
        Di&apos; la tua. I risultati sono della community, in tempo reale.
      </p>

      <AdSlot slot="sondaggi" />

      <div className="mt-6 grid gap-4">
        {SEED_POLLS.map((p) => (
          <PollCard key={p.slug} poll={p} initial={getResults(p.slug)} />
        ))}
      </div>
    </Container>
  );
}
