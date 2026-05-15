import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setează parolă nouă — CalyHub",
  description: "Setează o parolă nouă pentru contul tău CalyHub.",
  alternates: { canonical: "/reset-password" },
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
