import { notFound } from "next/navigation";
import { getCategories, getEntitiesByCategory } from "@/lib/data";
import { Container, Breadcrumbs, Card } from "@/components/ui";
import { Leaderboard } from "@/components/Leaderboard";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { itemListSchema } from "@/lib/schema-org";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const items = await getEntitiesByCategory(category);
  const title = `${category.replace(/-/g, " ")} — classifica e crescite`;
  const description = `Tutto su ${category.replace(
    /-/g,
    " "
  )}: creator, artisti e brani della nicchia, con classifiche e movimenti.`;
  return {
    title,
    description,
    alternates: { canonical: `/tag/${category}` },
    robots:
      items.length >= 3
        ? { index: true, follow: true }
        : { index: false, follow: true },
    openGraph: { title, description, url: absoluteUrl(`/tag/${category}`) },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const items = await getEntitiesByCategory(category);
  if (items.length === 0) notFound();
  return (
    <>
      <JsonLd data={itemListSchema(items, category)} />
      <Container>
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: `#${category}`, path: `/tag/${category}` },
          ]}
        />
        <h1 className="font-display text-4xl capitalize tracking-tight">
          {category.replace(/-/g, " ")}
        </h1>
        <p className="mt-2 text-muted">
          Creator, artisti e brani della nicchia, ordinati per dimensione.
        </p>

        <AdSlot slot="tag-top" />

        <Card className="mt-6 overflow-hidden">
          <Leaderboard items={items} />
        </Card>
      </Container>
    </>
  );
}
