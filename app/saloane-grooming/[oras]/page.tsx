import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../../components/Footer";

type OrasData = {
  slug: string;
  nume: string;
  numeArticulat: string;
  judet: string;
  populatie: string;
  nrSaloane: number;
  cartiere: string[];
  intro: string;
};

const ORASE: Record<string, OrasData> = {
  bucuresti: {
    slug: "bucuresti",
    nume: "București",
    numeArticulat: "în București",
    judet: "Ilfov",
    populatie: "1.9M locuitori",
    nrSaloane: 47,
    cartiere: ["Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5", "Sector 6", "Pipera", "Băneasa", "Herăstrău", "Floreasca"],
    intro:
      "Capitala are cea mai largă rețea de saloane de grooming din țară. Pe CalyHub găsești saloane în toate cele 6 sectoare, plus zonele Pipera, Băneasa și Floreasca.",
  },
  cluj: {
    slug: "cluj",
    nume: "Cluj-Napoca",
    numeArticulat: "în Cluj-Napoca",
    judet: "Cluj",
    populatie: "320.000 locuitori",
    nrSaloane: 18,
    cartiere: ["Centru", "Mănăștur", "Mărăști", "Gheorgheni", "Zorilor", "Grigorescu", "Bună Ziua", "Andrei Mureșanu"],
    intro:
      "Cluj-Napoca, capitala neoficială a Transilvaniei, are o comunitate mare de iubitori de animale. Pe CalyHub găsești saloane premium în Centru, Mănăștur și Gheorgheni.",
  },
  timisoara: {
    slug: "timisoara",
    nume: "Timișoara",
    numeArticulat: "în Timișoara",
    judet: "Timiș",
    populatie: "250.000 locuitori",
    nrSaloane: 14,
    cartiere: ["Cetate", "Iosefin", "Fabric", "Elisabetin", "Complex Studențesc", "Dâmbovița", "Lipovei"],
    intro:
      "Timișoara, Capitală Europeană a Culturii 2023, are o comunitate vibrantă de stăpâni de animale. Programează grooming în Cetate, Iosefin sau Fabric.",
  },
  iasi: {
    slug: "iasi",
    nume: "Iași",
    numeArticulat: "în Iași",
    judet: "Iași",
    populatie: "290.000 locuitori",
    nrSaloane: 11,
    cartiere: ["Centru", "Copou", "Tătărași", "Păcurari", "Alexandru cel Bun", "Galata", "Nicolina"],
    intro:
      "Iași, capitala Moldovei, oferă saloane de grooming bine echipate în Copou, Tătărași și Păcurari. Stăpânii din Iași își rezervă programări online în câteva secunde.",
  },
  brasov: {
    slug: "brasov",
    nume: "Brașov",
    numeArticulat: "în Brașov",
    judet: "Brașov",
    populatie: "240.000 locuitori",
    nrSaloane: 9,
    cartiere: ["Centrul Vechi", "Astra", "Răcădău", "Tractorul", "Noua", "Bartolomeu", "Stupini"],
    intro:
      "Brașov, perla Transilvaniei, are saloane de grooming în Centrul Vechi, Astra și Răcădău. Stăpânii din Brașov își pot programa animalul online direct pe CalyHub.",
  },
};

export function generateStaticParams() {
  return Object.keys(ORASE).map((oras) => ({ oras }));
}

export async function generateMetadata({ params }: { params: Promise<{ oras: string }> }): Promise<Metadata> {
  const { oras } = await params;
  const data = ORASE[oras];
  if (!data) return {};

  const title = `Saloane grooming ${data.nume} — Programări online | CalyHub`;
  const description = `${data.nrSaloane}+ saloane de grooming pentru câini și pisici ${data.numeArticulat}. Compară prețuri, vezi review-uri și rezervă online în 10 secunde. Gratuit pentru stăpâni.`;

  return {
    title,
    description,
    keywords: [
      `grooming ${data.nume}`,
      `salon grooming ${data.nume}`,
      `tuns caine ${data.nume}`,
      `tuns pisica ${data.nume}`,
      `frizerie animale ${data.nume}`,
      `programare grooming ${data.nume}`,
    ],
    alternates: { canonical: `/saloane-grooming-${data.slug}` },
    openGraph: {
      title,
      description,
      url: `/saloane-grooming-${data.slug}`,
      type: "website",
    },
  };
}

export default async function OrasPage({ params }: { params: Promise<{ oras: string }> }) {
  const { oras } = await params;
  const data = ORASE[oras];
  if (!data) notFound();

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://calyhub.ro/saloane-grooming-${data.slug}`,
    name: `CalyHub — Saloane grooming ${data.nume}`,
    description: `Platformă de programări online la saloane de grooming pentru animale de companie ${data.numeArticulat}.`,
    url: `https://calyhub.ro/saloane-grooming-${data.slug}`,
    image: "https://calyhub.ro/og-image.png",
    address: { "@type": "PostalAddress", addressLocality: data.nume, addressCountry: "RO" },
    areaServed: { "@type": "City", name: data.nume },
    priceRange: "$$",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: "https://calyhub.ro/" },
      { "@type": "ListItem", position: 2, name: `Saloane ${data.nume}`, item: `https://calyhub.ro/saloane-grooming-${data.slug}` },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          <Link href="/register" style={{ padding: "10px 22px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontWeight: 800, fontSize: 14, textDecoration: "none" }}>Programează acum</Link>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <section style={{ background: "linear-gradient(135deg, #FFF3EA 0%, #FAFAFA 100%)", padding: "60px 20px 50px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <nav style={{ fontSize: 13, color: "#6B7280", marginBottom: 18 }}>
              <Link href="/" style={{ color: "#6B7280", textDecoration: "none" }}>Acasă</Link>
              <span style={{ margin: "0 8px" }}>›</span>
              <span style={{ color: "#1A1A1A", fontWeight: 700 }}>Saloane grooming {data.nume}</span>
            </nav>
            <div style={{ display: "inline-block", background: "#FF6B00", color: "#fff", padding: "6px 14px", borderRadius: 50, fontSize: 12, fontWeight: 800, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>📍 {data.nume}, jud. {data.judet}</div>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, color: "#1A1A1A", marginBottom: 16, lineHeight: 1.15, maxWidth: 800 }}>
              Saloane de grooming {data.numeArticulat} — programări online
            </h1>
            <p style={{ fontSize: 17, color: "#4B5563", maxWidth: 720, lineHeight: 1.65, marginBottom: 24 }}>
              {data.intro}
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link href="/register" style={{ padding: "14px 32px", borderRadius: 50, background: "#FF6B00", color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none", boxShadow: "0 8px 24px rgba(255,107,0,.35)" }}>Caută salon {data.numeArticulat} →</Link>
              <Link href="/cum-functioneaza" style={{ padding: "14px 32px", borderRadius: 50, background: "#fff", color: "#1A1A1A", fontWeight: 800, fontSize: 15, textDecoration: "none", border: "2px solid #EBEBEB" }}>Cum funcționează</Link>
            </div>
          </div>
        </section>

        <section style={{ padding: "50px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {[
              { val: `${data.nrSaloane}+`, lbl: "Saloane partenere" },
              { val: data.populatie, lbl: "Populația orașului" },
              { val: "10 sec", lbl: "Timp mediu rezervare" },
              { val: "4.8★", lbl: "Rating mediu saloane" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#FAFAFA", padding: "24px 22px", borderRadius: 20, border: "1.5px solid #EBEBEB" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#FF6B00", marginBottom: 4 }}>{s.val}</div>
                <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: "60px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 900, marginBottom: 24, color: "#1A1A1A" }}>Zone deservite {data.numeArticulat}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              {data.cartiere.map((c, i) => (
                <div key={i} style={{ background: "#fff", padding: "16px 18px", borderRadius: 14, border: "1.5px solid #EBEBEB", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B00" }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "60px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 900, marginBottom: 28, color: "#1A1A1A", textAlign: "center" }}>De ce să rezervi prin CalyHub {data.numeArticulat}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {[
                { icon: "⚡", t: "Rezervi în 10 secunde", d: "Alegi salonul, ora, serviciul. Gata. Fără telefon, fără mesaje." },
                { icon: "⭐", t: "Review-uri reale", d: `Vezi ce spun alți stăpâni ${data.numeArticulat} despre fiecare salon.` },
                { icon: "💰", t: "Compari prețuri", d: "Vezi prețurile tuturor saloanelor din zona ta într-un singur loc." },
                { icon: "🔔", t: "Notificări automate", d: "Primești reminder cu 24h și 1h înainte de programare." },
              ].map((b, i) => (
                <div key={i} style={{ background: "#FAFAFA", padding: "22px 20px", borderRadius: 16, border: "1.5px solid #EBEBEB" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{b.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1A", marginBottom: 6 }}>{b.t}</div>
                  <div style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.6 }}>{b.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "70px 20px", background: "linear-gradient(135deg, #FF6B00 0%, #E05A00 100%)", textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 900, color: "#fff", marginBottom: 14, lineHeight: 1.2 }}>Gata să programezi grooming {data.numeArticulat}?</h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.92)", marginBottom: 24, lineHeight: 1.6 }}>Creează cont gratuit și descoperă cele mai bune saloane din oraș.</p>
            <Link href="/register" style={{ display: "inline-block", padding: "16px 40px", borderRadius: 50, background: "#fff", color: "#FF6B00", fontWeight: 900, fontSize: 16, textDecoration: "none", boxShadow: "0 10px 28px rgba(0,0,0,.18)" }}>Creează cont gratuit →</Link>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </div>
  );
}
