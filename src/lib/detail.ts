import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEntitiesByKind, getEntity, getSimilar } from "./data";
import type { Kind } from "./types";
import { KIND_LABEL, PLATFORM_LABEL, metricLabel } from "./types";
import { formatCompact } from "./format";
import { entityHref } from "./links";
import { absoluteUrl } from "./site";

/**
 * Per la scala: prerenderizza solo i top-N (per dimensione); il resto è
 * generato on-demand al primo accesso e poi cachato (ISR). dynamicParams=true.
 */
export async function detailStaticParams(kind: Kind, limit = 60) {
  const list = await getEntitiesByKind(kind);
  return [...list]
    .sort((a, b) => b.primary - a.primary)
    .slice(0, limit)
    .map((e) => ({ slug: e.slug }));
}

export async function detailMetadata(
  kind: Kind,
  slug: string
): Promise<Metadata> {
  const e = await getEntity(kind, slug);
  if (!e) return {};
  const title = `${e.name} — ${formatCompact(e.primary)} ${metricLabel(
    e.kind,
    e.platform
  )}`;
  const description = `${e.name}: ${formatCompact(e.primary)} ${metricLabel(
    e.kind,
    e.platform
  )} su ${PLATFORM_LABEL[e.platform]}, crescita e statistiche aggiornate. ${
    KIND_LABEL[e.kind]
  } — dati pubblici, fonte ufficiale linkata.`;
  const path = entityHref(e);
  return {
    title,
    description,
    alternates: { canonical: path },
    // Regola d'oro (sez. 2): pagine con dati insufficienti vanno in noindex
    robots: e.indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      type: "profile",
    },
  };
}

export async function loadDetail(kind: Kind, slug: string) {
  const e = await getEntity(kind, slug);
  if (!e) notFound();
  const similar = await getSimilar(e, 8);
  const versusCandidates = similar
    .filter((s) => {
      const ratio =
        Math.max(e.primary, s.primary) /
        Math.max(1, Math.min(e.primary, s.primary));
      return s.category === e.category && ratio <= 5;
    })
    .slice(0, 6);
  return { e, similar, versusCandidates };
}
