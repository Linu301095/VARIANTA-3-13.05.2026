import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planuri CalyHub — Abonamente pentru saloane, de la 57 lei/lună",
  description:
    "Planurile CalyHub pentru saloane de înfrumusețare și de grooming: Basic, Pro și Business. O singură subscripție pe salon, programări nelimitate, 0% comision și asistenți AI incluși. Începi cu trial gratuit.",
  alternates: { canonical: "/preturi" },
  keywords: [
    "planuri calyhub",
    "preturi calyhub",
    "abonament salon infrumusetare",
    "abonament salon grooming",
    "software programari salon",
    "aplicatie frizerie coafor",
    "pret platforma salon romania",
  ],
  openGraph: {
    title: "Planuri CalyHub — Abonamente pentru saloane, de la 57 lei/lună",
    description:
      "Trei planuri pentru saloane de înfrumusețare și grooming. O subscripție pe salon, nu per angajat. 0% comision, asistenți AI incluși, trial gratuit la început.",
    url: "/preturi",
    type: "website",
    // fără asta, pagina pierde imaginea de share definită în layout
    images: ["/og-image.png"],
  },
};

export default function PreturiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
