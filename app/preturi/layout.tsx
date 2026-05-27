import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prețuri CalyHub — Abonamente saloane grooming de la 57 lei/lună",
  description:
    "Planuri CalyHub pentru saloane de grooming: Basic, Pro și Business. Programări nelimitate, prețuri per talie, remindere WhatsApp, statistici și rapoarte Excel. Primele 3 luni gratuite.",
  alternates: { canonical: "/preturi" },
  keywords: [
    "preturi calyhub",
    "abonament salon grooming",
    "software programari grooming",
    "aplicatie salon caini",
    "pret platforma grooming romania",
  ],
  openGraph: {
    title: "Prețuri CalyHub — Abonamente saloane grooming de la 57 lei/lună",
    description:
      "3 planuri pentru saloane de grooming, mai ieftine decât concurența. Remindere WhatsApp, statistici, rapoarte Excel. Primele 3 luni gratuite pentru primele 10 saloane.",
    url: "/preturi",
    type: "website",
  },
};

export default function PreturiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
