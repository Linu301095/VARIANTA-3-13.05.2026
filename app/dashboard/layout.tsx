import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panou de control — CalyHub",
  robots: { index: false, follow: false, nocache: true },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
