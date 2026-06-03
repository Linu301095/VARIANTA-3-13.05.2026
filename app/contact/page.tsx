import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "../../components/Footer";
import { Building2, MapPin, Mail, Scale, Clock, Phone, Info, type LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — CalyHub",
  description:
    "Date de contact CalyHub: adresă sediu, email suport clienți, email legal și program de lucru. Suntem aici să te ajutăm.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — CalyHub",
    description: "Date de contact CalyHub: adresă, email suport, email legal și program de lucru.",
    url: "/contact",
    type: "website",
  },
  keywords: ["contact CalyHub", "suport CalyHub", "adresa CalyHub", "telefon CalyHub", "email CalyHub"],
  robots: { index: true, follow: true },
};

const DATE_FIRMA: { Icon: LucideIcon; label: string; valoare: string; href?: string }[] = [
  { Icon: Building2, label: "Companie", valoare: "CalyHub SRL" },
  { Icon: MapPin, label: "Adresă", valoare: "Al. Mizil 56-58, Sector 3, București" },
  { Icon: Mail, label: "Suport clienți", valoare: "support@calyhub.ro", href: "mailto:support@calyhub.ro" },
  { Icon: Scale, label: "Email legal", valoare: "legal@calyhub.ro", href: "mailto:legal@calyhub.ro" },
  { Icon: Clock, label: "Program", valoare: "Luni–Vineri, 09:00–18:00" },
];

export default function ContactPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          <nav className="hdr-nav" style={{ display: "flex", gap: 8 }}>
            <Link href="/login" className="hdr-btn" style={{ padding: "9px 20px", borderRadius: 50, border: "1.5px solid #DDD", background: "#fff", fontSize: 14, fontWeight: 700, color: "#1A1A1A", textDecoration: "none" }}>Conectare</Link>
            <Link href="/register" className="hdr-btn" style={{ padding: "9px 20px", borderRadius: 50, background: "#FF6B00", fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,0,.35)" }}>Înregistrare gratuită</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <section style={{ background: "#fff", padding: "56px 20px 48px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFF3EA", color: "#FF6B00", padding: "6px 18px", borderRadius: 50, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}><Phone size={13} strokeWidth={2} /> Contact</div>
          <h1 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 900, color: "#1A1A1A", marginBottom: 12 }}>Hai să luăm legătura</h1>
          <p style={{ fontSize: 15, color: "#6B7280", maxWidth: 540, margin: "0 auto", lineHeight: 1.6 }}>
            Ai o întrebare, o sugestie sau ai nevoie de ajutor? Scrie-ne și îți răspundem cât mai repede posibil.
          </p>
        </section>

        <section style={{ padding: "56px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {DATE_FIRMA.map((item) => (
                <div key={item.label} style={{ background: "#FAFAFA", border: "1.5px solid #EBEBEB", borderRadius: 16, padding: "20px 22px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FFF3EA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><item.Icon size={22} color="#FF6B00" strokeWidth={1.8} /></div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>{item.label}</div>
                    {item.href ? (
                      <a href={item.href} style={{ fontSize: 15, fontWeight: 800, color: "#FF6B00", textDecoration: "none", wordBreak: "break-word" }}>{item.valoare}</a>
                    ) : (
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#1A1A1A", wordBreak: "break-word" }}>{item.valoare}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 36, padding: "22px 26px", background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FF6B00", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><Info size={15} strokeWidth={2} /> Răspundem în maxim 24 de ore</div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                Pentru întrebări tehnice sau probleme cu contul, folosește <strong>support@calyhub.ro</strong>. Pentru aspecte legale, contracte sau colaborări, scrie la <strong>legal@calyhub.ro</strong>.
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </div>
  );
}
