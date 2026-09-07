import type { Metadata } from "next";

// Pagină funcțională, doar-invitație — nu are ce căuta în căutările Google.
export const metadata: Metadata = {
  title: "Cont de specialist — CalyHub",
  robots: { index: false, follow: false },
};

export default function InregistrareSpecialistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
