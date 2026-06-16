import { EntityProfile } from "@/components/EntityProfile";
import {
  detailMetadata,
  detailStaticParams,
  loadDetail,
} from "@/lib/detail";

export const dynamicParams = true;
export const revalidate = 3600;

export function generateStaticParams() {
  return detailStaticParams("creator");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return detailMetadata("creator", slug);
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { e, similar, versusCandidates } = await loadDetail("creator", slug);
  return (
    <EntityProfile e={e} similar={similar} versusCandidates={versusCandidates} />
  );
}
