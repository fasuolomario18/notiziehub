import { KindListing } from "@/components/KindListing";

export const revalidate = 3600;
export const metadata = {
  title: "Video virali in Italia — i più visti",
  description:
    "I video YouTube più visti del momento in Italia, con visualizzazioni, like e crescita. Aggiornati ogni giorno.",
  alternates: { canonical: "/video" },
};

export default function Page() {
  return <KindListing kind="video" />;
}
