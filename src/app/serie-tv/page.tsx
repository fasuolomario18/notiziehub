import { KindListing } from "@/components/KindListing";

export const revalidate = 3600;
export const metadata = {
  title: "Serie TV — le più seguite e votate",
  description:
    "Le serie TV più seguite e votate del momento, con voti, valutazione e tendenze. Dati pubblici da TMDB.",
  alternates: { canonical: "/serie-tv" },
};

export default function Page() {
  return <KindListing kind="tv" />;
}
