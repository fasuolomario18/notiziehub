import { KindListing } from "@/components/KindListing";

export const revalidate = 3600;
export const metadata = {
  title: "Film — i più popolari e votati",
  description:
    "I film più popolari e votati del momento, con voti, valutazione e tendenze. Dati pubblici da TMDB.",
  alternates: { canonical: "/film" },
};

export default function Page() {
  return <KindListing kind="movie" />;
}
