import { KindListing } from "@/components/KindListing";

export const revalidate = 3600;
export const metadata = {
  title: "Creator — classifica e crescite",
  description:
    "Classifica dei creator italiani per follower, con crescita, movimenti e confronti. Dati pubblici aggiornati in automatico.",
  alternates: { canonical: "/creator" },
};

export default function Page() {
  return <KindListing kind="creator" />;
}
