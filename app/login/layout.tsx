import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conectare — Intră în contul tău CalyHub",
  description:
    "Conectează-te la contul tău CalyHub pentru programările tale la salon — de înfrumusețare sau de grooming — ori pentru a administra agenda propriului salon.",
  alternates: { canonical: "/login" },
  keywords: ["conectare CalyHub", "login salon", "cont CalyHub", "programari salon infrumusetare", "programari grooming"],
  openGraph: {
    title: "Conectare — CalyHub",
    description: "Intră în contul tău CalyHub: programările tale sau agenda salonului.",
    url: "/login",
    type: "website",
    // fără asta, pagina pierde imaginea de share definită în layout
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
