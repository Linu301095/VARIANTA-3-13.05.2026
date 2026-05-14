import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conectare — Intră în contul tău CalyHub",
  description:
    "Conectează-te la contul tău CalyHub pentru a gestiona programările la salonul de grooming sau pentru a administra propriul salon.",
  alternates: { canonical: "/login" },
  robots: { index: true, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
