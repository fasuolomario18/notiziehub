import { EntityProfile } from "@/components/EntityProfile";
import { detailMetadata, detailStaticParams, loadDetail } from "@/lib/detail";

export const dynamicParams = true;
export const revalidate = 3600;

export function generateStaticParams() {
  return detailStaticParams("video");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return detailMetadata("video", slug);
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { e, similar, versusCandidates } = await loadDetail("video", slug);
  return (
    <EntityProfile e={e} similar={similar} versusCandidates={versusCandidates} />
  );
}
