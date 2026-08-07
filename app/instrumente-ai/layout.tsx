import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instrumente AI pentru saloane — CalyHub",
  description:
    "Patru asistenți AI incluși în CalyHub: răspunsuri automate la recenzii, reactivarea clienților inactivi, recomandări de îngrijire după vizită și consultant AI de business. Pentru saloane de înfrumusețare și de grooming.",
  alternates: { canonical: "/instrumente-ai" },
  keywords: ["instrumente AI salon", "asistenti AI", "AI pentru saloane", "consultant AI business", "raspunsuri recenzii AI"],
  openGraph: {
    title: "Instrumente AI pentru saloane — CalyHub",
    description: "Patru asistenți AI care lucrează pe datele reale ale salonului tău, incluși în abonament.",
    url: "/instrumente-ai",
    type: "website",
    // fără asta, pagina pierde imaginea de share definită în layout
    images: ["/og-image.png"],
  },
};

export default function InstrumenteAILayout({ children }: { children: React.ReactNode }) {
  return children;
}
