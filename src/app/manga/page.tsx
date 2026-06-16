import { KindListing } from "@/components/KindListing";

export const revalidate = 3600;
export const metadata = {
  title: "Manga — i più popolari e votati",
  description:
    "Classifica dei manga più popolari e meglio votati, con punteggio, fan e tendenze. Dati pubblici da AniList.",
  alternates: { canonical: "/manga" },
};

export default function Page() {
  return <KindListing kind="manga" />;
}
