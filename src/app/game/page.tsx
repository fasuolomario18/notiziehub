import { KindListing } from "@/components/KindListing";

export const revalidate = 3600;
export const metadata = {
  title: "Giochi su Twitch — i più guardati in diretta",
  description:
    "I giochi più guardati in live su Twitch per spettatori correnti, con classifiche e tendenze. Dati pubblici.",
  alternates: { canonical: "/game" },
};

export default function Page() {
  return <KindListing kind="game" />;
}
