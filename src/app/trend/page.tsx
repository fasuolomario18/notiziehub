import { KindListing } from "@/components/KindListing";

export const revalidate = 3600;
export const metadata = {
  title: "Trend — hashtag e sound virali",
  description:
    "Hashtag, sound e challenge tracciati come fenomeni, con numeri e crescita. Dati pubblici aggiornati in automatico.",
  alternates: { canonical: "/trend" },
};

export default function Page() {
  return <KindListing kind="trend" />;
}
