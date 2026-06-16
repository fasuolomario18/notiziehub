import { KindListing } from "@/components/KindListing";

export const revalidate = 3600;
export const metadata = {
  title: "Artisti — più ascoltati e in crescita",
  description:
    "Gli artisti più ascoltati e in crescita, con andamento storico e confronti. Dati pubblici aggiornati in automatico.",
  alternates: { canonical: "/artist" },
};

export default function Page() {
  return <KindListing kind="artist" />;
}
