import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suport parteneri — Ajutor pentru saloanele de grooming",
  description:
    "Centrul de suport CalyHub pentru saloanele partenere: email, chat live, telefon, WhatsApp, knowledge base și tutoriale video. Răspuns sub 4 ore.",
  alternates: { canonical: "/suport-parteneri" },
  openGraph: {
    title: "Suport parteneri — CalyHub",
    description: "Ajutor 24/7 pentru saloanele partenere CalyHub.",
    url: "/suport-parteneri",
  },
};

export default function SuportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
