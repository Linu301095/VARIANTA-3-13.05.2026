import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperare parolă — CalyHub",
  description:
    "Ai uitat parola contului CalyHub? Introdu emailul și îți trimitem un link pentru resetare.",
  alternates: { canonical: "/forgot-password" },
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
