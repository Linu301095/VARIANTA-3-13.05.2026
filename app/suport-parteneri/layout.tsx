import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suport parteneri — Ajutor pentru saloanele partenere | CalyHub",
  description:
    "Centrul de suport CalyHub pentru saloanele de înfrumusețare și de grooming: ghiduri de configurare, întrebări frecvente și contact direct pe email.",
  alternates: { canonical: "/suport-parteneri" },
  keywords: ["suport CalyHub", "ajutor salon", "ghid partener CalyHub", "intrebari frecvente saloane"],
  openGraph: {
    title: "Suport parteneri — CalyHub",
    description: "Ghiduri, întrebări frecvente și contact direct pentru saloanele partenere CalyHub.",
    url: "/suport-parteneri",
    type: "website",
  },
};

export default function SuportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
