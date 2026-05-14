import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creează cont gratuit — CalyHub",
  description:
    "Înregistrează-te gratuit pe CalyHub. Pentru stăpâni: programări online în 10 secunde. Pentru saloane: primele 3 luni gratuite.",
  alternates: { canonical: "/register" },
  robots: { index: true, follow: true },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
