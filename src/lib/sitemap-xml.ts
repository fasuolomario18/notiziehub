import type { MetadataRoute } from "next";
import { collectUrls } from "./urls";
import { SITE, absoluteUrl } from "./site";

const CHUNK = SITE.sitemapChunkSize;

function iso(d: string | Date | undefined): string {
  if (!d) return new Date().toISOString();
  return (typeof d === "string" ? new Date(d) : d).toISOString();
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Numero di chunk necessari per coprire tutti gli URL. */
export async function chunkCount(): Promise<number> {
  const urls = await collectUrls();
  return Math.max(1, Math.ceil(urls.length / CHUNK));
}

/** Sitemap index che referenzia /sitemaps/0.xml … */
export async function sitemapIndexXml(): Promise<string> {
  const n = await chunkCount();
  const items = Array.from({ length: n }, (_, i) => {
    return `  <sitemap><loc>${absoluteUrl(
      `/sitemaps/${i}.xml`
    )}</loc><lastmod>${iso(new Date())}</lastmod></sitemap>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>`;
}

/** Un singolo chunk urlset. */
export async function sitemapChunkXml(idx: number): Promise<string | null> {
  const urls: MetadataRoute.Sitemap = await collectUrls();
  const start = idx * CHUNK;
  const slice = urls.slice(start, start + CHUNK);
  if (slice.length === 0) return null;
  const items = slice
    .map((u) => {
      const parts = [`    <loc>${esc(u.url)}</loc>`];
      if (u.lastModified) parts.push(`    <lastmod>${iso(u.lastModified)}</lastmod>`);
      if (u.changeFrequency)
        parts.push(`    <changefreq>${u.changeFrequency}</changefreq>`);
      if (typeof u.priority === "number")
        parts.push(`    <priority>${u.priority}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>`;
}
