import { notFound } from "next/navigation";
import { GLOSSARY, getGlossaryEntry } from "@/lib/glossary";
import { Container, Breadcrumbs } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return GLOSSARY.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = getGlossaryEntry(slug);
  if (!g) return {};
  return {
    title: `Cos'è il ${g.term}? Significato`,
    description: g.short,
    alternates: { canonical: `/cos-e/${g.slug}` },
    openGraph: { title: `Cos'è ${g.term}`, description: g.short },
  };
}

export default async function GlossaryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = getGlossaryEntry(slug);
  if (!g) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: g.term,
    description: g.short,
    url: absoluteUrl(`/cos-e/${g.slug}`),
  };

  return (
    <>
      <JsonLd data={schema} />
      <Container className="max-w-3xl">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Glossario", path: "/cos-e" },
            { name: g.term, path: `/cos-e/${g.slug}` },
          ]}
        />
        <h1 className="font-display text-4xl tracking-tight">
          Cos&apos;è il {g.term}?
        </h1>
        <p className="mt-3 text-lg text-muted">{g.short}</p>
        <AdSlot slot="glossary" />
        <article className="prose-invert mt-4 space-y-4 leading-relaxed">
          {g.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
      </Container>
    </>
  );
}
