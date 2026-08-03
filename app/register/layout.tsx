import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creează cont gratuit — CalyHub",
  description:
    "Înregistrează-te gratuit pe CalyHub. Ca și client rezervi la saloane de înfrumusețare și de grooming; ca salon primești programări online, cu trial gratuit la început.",
  alternates: { canonical: "/register" },
  keywords: ["cont gratuit CalyHub", "inregistrare salon", "inregistrare client", "salon infrumusetare", "salon grooming"],
  openGraph: {
    title: "Creează cont gratuit — CalyHub",
    description: "Un cont pentru programările tale sau pentru salonul tău — înfrumusețare și grooming.",
    url: "/register",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
