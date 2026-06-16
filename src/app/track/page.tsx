import { KindListing } from "@/components/KindListing";

export const revalidate = 3600;
export const metadata = {
  title: "Brani — più stream e movimenti",
  description:
    "I brani con più stream e i loro movimenti settimanali. Dati pubblici aggiornati in automatico.",
  alternates: { canonical: "/track" },
};

export default function Page() {
  return <KindListing kind="track" />;
}
