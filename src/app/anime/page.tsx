import { KindListing } from "@/components/KindListing";

export const revalidate = 3600;
export const metadata = {
  title: "Anime — i più popolari e votati",
  description:
    "Classifica degli anime più popolari e meglio votati, con punteggio, fan e tendenze. Dati pubblici da AniList.",
  alternates: { canonical: "/anime" },
};

export default function Page() {
  return <KindListing kind="anime" />;
}
