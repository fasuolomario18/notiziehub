import Link from "next/link";
import { getVersusPairs } from "@/lib/data";
import { Container, Breadcrumbs, Card } from "@/components/ui";
import { formatCompact } from "@/lib/format";
import { AdSlot } from "@/components/AdSlot";

export const revalidate = 3600;
export const metadata = {
  title: "Versus — confronti tra creator e artisti",
  description:
    "Confronti diretti: chi ha più follower, stream o crescita. Solo confronti sensati, tra entità della stessa categoria e dimensioni simili.",
  alternates: { canonical: "/vs" },
};

export default async function Page() {
  const pairs = await getVersusPairs();
  return (
    <Container>
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Versus", path: "/vs" },
        ]}
      />
      <h1 className="font-display text-4xl tracking-tight">Confronti</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Chi vince? Confronti diretti tra entità della stessa categoria e
        dimensioni simili — niente accostamenti senza senso.
      </p>

      <AdSlot slot="vs-index-top" />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pairs.map(([a, b]) => (
          <Link
            key={`${a.slug}-${b.slug}`}
            href={`/vs/${a.slug}/${b.slug}`}
            className="block"
          >
            <Card className="p-4 transition hover:bg-surface-2">
              <p className="text-xs uppercase tracking-wide text-muted">
                #{a.category}
              </p>
              <p className="mt-1 font-display text-lg">
                {a.name} <span className="text-signal">vs</span> {b.name}
              </p>
              <p className="tabnum mt-1 text-sm text-muted">
                {formatCompact(a.primary)} vs {formatCompact(b.primary)}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
