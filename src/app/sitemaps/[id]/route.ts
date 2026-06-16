import { sitemapChunkXml, chunkCount } from "@/lib/sitemap-xml";

export const revalidate = 3600;

export async function generateStaticParams() {
  const n = await chunkCount();
  return Array.from({ length: n }, (_, i) => ({ id: `${i}.xml` }));
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const idx = Number(id.replace(/\.xml$/, ""));
  if (!Number.isFinite(idx) || idx < 0) {
    return new Response("Not found", { status: 404 });
  }
  const xml = await sitemapChunkXml(idx);
  if (!xml) return new Response("Not found", { status: 404 });
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
