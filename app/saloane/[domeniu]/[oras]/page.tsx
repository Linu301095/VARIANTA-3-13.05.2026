import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../../../components/Footer";
import ResetTheme from "../../../../components/ResetTheme";
import ScrollReveal from "../../../../components/ScrollReveal";
import { IconClienti, IconFoarfeca } from "../../../../components/SectionIcons";
import { MapPin, Calendar, Star, Tag, Bell, Check, Sparkles } from "lucide-react";

const C = {
  bg: "#FAFAFA", surface: "#fff", surface2: "#F7F4F0", line: "#EBEBEB",
  text: "#1A1A1A", muted: "#6B7280", dim: "#9CA3AF",
  orange: "#FF6B00", orangeText: "#E05A00", orangeSoft: "#FFF3EA",
};

const eyebrow: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7,
  fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: C.orangeText,
  background: C.orangeSoft, border: "1px solid #FFDCC6", borderRadius: 50, padding: "7px 15px",
};
const btnPrimary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "14px 26px", borderRadius: 50, background: C.orange, color: "#fff",
  fontSize: 15, fontWeight: 800, textDecoration: "none", boxShadow: "0 8px 22px rgba(255,107,0,.32)",
};
const btnSecondary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "14px 26px", borderRadius: 50, background: "#fff", color: C.text,
  fontSize: 15, fontWeight: 800, textDecoration: "none", border: `1.5px solid ${C.line}`,
};
const tile: React.CSSProperties = {
  background: C.surface, border: `1px solid ${C.line}`, borderRadius: 22, padding: 22,
  boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 10px 34px rgba(120,90,60,.06)",
};

/* ─────────── Domenii ─────────── */
type DomeniuKey = "infrumusetare" | "grooming";

type Domeniu = {
  slug: DomeniuKey;
  eticheta: string;          // „Înfrumusețare"
  hTitlu: string;            // pentru H1: „Saloane de înfrumusețare"
  subiect: string;           // „pentru tine" / „pentru animalul tău"
  servicii: string[];
  keywords: (oras: string) => string[];
  intro: (oras: string, numeArticulat: string) => string;
  beneficii: { Icon: typeof Tag; t: string; d: string }[];
};

const DOMENII: Record<DomeniuKey, Domeniu> = {
  infrumusetare: {
    slug: "infrumusetare",
    eticheta: "Înfrumusețare",
    hTitlu: "Saloane de înfrumusețare",
    subiect: "pentru tine",
    servicii: ["Frizerie", "Coafor", "Manichiură", "Pedichiură", "Cosmetică", "Barbă & styling"],
    keywords: (oras) => [
      `frizerie ${oras}`, `coafor ${oras}`, `salon infrumusetare ${oras}`,
      `tuns barbati ${oras}`, `manichiura ${oras}`, `cosmetica ${oras}`,
      `programare online salon ${oras}`,
    ],
    intro: (oras, art) =>
      `Frizerii, saloane de coafură, manichiură și cosmetică ${art}. Vezi prețurile înainte să rezervi, alege specialistul preferat și programează-te online, în câteva minute.`,
    beneficii: [
      { Icon: Tag, t: "Prețuri afișate", d: "Vezi cât plătești pentru fiecare serviciu, înainte de rezervare." },
      { Icon: Calendar, t: "Rezervi 24/7", d: "Alegi ora și specialistul, fără telefoane și fără așteptare." },
      { Icon: Star, t: "Recenzii reale", d: "Alegi salonul pe baza experienței altor clienți din oraș." },
      { Icon: Bell, t: "Confirmare în aplicație", d: "Primești confirmarea și reamintirile direct în cont." },
    ],
  },
  grooming: {
    slug: "grooming",
    eticheta: "Grooming",
    hTitlu: "Saloane de grooming",
    subiect: "pentru animalul tău",
    servicii: ["Tuns", "Îmbăiere", "Deghajare", "Unghii", "Îngrijire urechi", "Styling rasă"],
    keywords: (oras) => [
      `grooming ${oras}`, `salon grooming ${oras}`, `tuns caine ${oras}`,
      `tuns pisica ${oras}`, `frizerie animale ${oras}`, `programare grooming ${oras}`,
    ],
    intro: (oras, art) =>
      `Saloane de grooming pentru câini și pisici ${art}. Preț exact pe talia animalului, profil salvat cu rasă și alergii, plus recomandări de îngrijire după fiecare vizită.`,
    beneficii: [
      { Icon: Tag, t: "Preț pe talie", d: "Vezi tariful potrivit taliei animalului tău, fără estimări." },
      { Icon: Calendar, t: "Rezervi 24/7", d: "Alegi ora și specialistul, fără telefoane și fără așteptare." },
      { Icon: Star, t: "Recenzii reale", d: "Alegi salonul pe baza experienței altor stăpâni din oraș." },
      { Icon: Sparkles, t: "Sfaturi după vizită", d: "Salonul îți trimite recomandări de îngrijire între tunsori." },
    ],
  },
};

/* ─────────── Orașe ─────────── */
type OrasData = {
  slug: string; nume: string; numeArticulat: string; judet: string;
  populatie: string; cartiere: string[];
};

const ORASE: Record<string, OrasData> = {
  bucuresti: {
    slug: "bucuresti", nume: "București", numeArticulat: "în București", judet: "Ilfov", populatie: "1.9M locuitori",
    cartiere: ["Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5", "Sector 6", "Pipera", "Băneasa", "Herăstrău", "Floreasca"],
  },
  cluj: {
    slug: "cluj", nume: "Cluj-Napoca", numeArticulat: "în Cluj-Napoca", judet: "Cluj", populatie: "320.000 locuitori",
    cartiere: ["Centru", "Mănăștur", "Mărăști", "Gheorgheni", "Zorilor", "Grigorescu", "Bună Ziua", "Andrei Mureșanu"],
  },
  timisoara: {
    slug: "timisoara", nume: "Timișoara", numeArticulat: "în Timișoara", judet: "Timiș", populatie: "250.000 locuitori",
    cartiere: ["Cetate", "Iosefin", "Fabric", "Elisabetin", "Complex Studențesc", "Dâmbovița", "Lipovei"],
  },
  iasi: {
    slug: "iasi", nume: "Iași", numeArticulat: "în Iași", judet: "Iași", populatie: "290.000 locuitori",
    cartiere: ["Centru", "Copou", "Tătărași", "Păcurari", "Alexandru cel Bun", "Galata", "Nicolina"],
  },
  brasov: {
    slug: "brasov", nume: "Brașov", numeArticulat: "în Brașov", judet: "Brașov", populatie: "240.000 locuitori",
    cartiere: ["Centrul Vechi", "Astra", "Răcădău", "Tractorul", "Noua", "Bartolomeu", "Stupini"],
  },
};

export function generateStaticParams() {
  const out: { domeniu: string; oras: string }[] = [];
  for (const d of Object.keys(DOMENII)) for (const o of Object.keys(ORASE)) out.push({ domeniu: d, oras: o });
  return out;
}

function urlFor(domeniu: DomeniuKey, oras: string) {
  return `/saloane-${domeniu}-${oras}`;
}

export async function generateMetadata({ params }: { params: Promise<{ domeniu: string; oras: string }> }): Promise<Metadata> {
  const { domeniu, oras } = await params;
  const dom = DOMENII[domeniu as DomeniuKey];
  const data = ORASE[oras];
  if (!dom || !data) return {};

  const title = `${dom.hTitlu} ${data.nume} — Programări online | CalyHub`;
  const description = `${dom.intro(data.nume, data.numeArticulat)} Rezervare gratuită pentru clienți, direct pe CalyHub.`;
  const url = urlFor(dom.slug, data.slug);

  return {
    title,
    description,
    keywords: dom.keywords(data.nume),
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

export default async function SaloaneOrasPage({ params }: { params: Promise<{ domeniu: string; oras: string }> }) {
  const { domeniu, oras } = await params;
  const dom = DOMENII[domeniu as DomeniuKey];
  const data = ORASE[oras];
  if (!dom || !data) notFound();

  const url = `https://calyhub.ro${urlFor(dom.slug, data.slug)}`;
  const celalalt = dom.slug === "grooming" ? DOMENII.infrumusetare : DOMENII.grooming;

  const localBusinessJsonLd = {
    "@context": "https://schema.org", "@type": "LocalBusiness", "@id": url,
    name: `CalyHub — ${dom.hTitlu} ${data.nume}`,
    description: `Platformă de programări online la ${dom.hTitlu.toLowerCase()} ${data.numeArticulat}.`,
    url, image: "https://calyhub.ro/logo.png",
    address: { "@type": "PostalAddress", addressLocality: data.nume, addressCountry: "RO" },
    areaServed: { "@type": "City", name: data.nume },
    priceRange: "$$",
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: "https://calyhub.ro/" },
      { "@type": "ListItem", position: 2, name: `${dom.hTitlu} ${data.nume}`, item: url },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <ResetTheme />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,250,.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`, height: 70 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={54} style={{ height: 54, width: "auto", objectFit: "contain" }} priority /></Link>
          <nav className="hdr-nav" style={{ display: "flex", gap: 22, alignItems: "center" }}>
            <Link href="/login" className="hdr-btn" style={{ padding: "10px 20px", borderRadius: 50, background: "#fff", border: "1.5px solid #DDD6CE", fontSize: 14, fontWeight: 800, color: C.text, textDecoration: "none", boxShadow: "0 2px 8px rgba(120,90,60,.08)" }}>Conectare</Link>
            <Link href="/register" className="hdr-btn" style={{ padding: "10px 20px", borderRadius: 50, background: C.orange, fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", boxShadow: "0 6px 18px rgba(255,107,0,.32)" }}>Înregistrare gratuită</Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* HERO */}
        <section style={{ position: "relative", overflow: "hidden", padding: "50px 20px 56px" }}>
          <div className="ch-orb" style={{ width: 340, height: 340, background: "rgba(255,107,0,.18)", top: -140, left: "12%" }} />
          <div className="ch-orb b" style={{ width: 280, height: 280, background: "rgba(255,140,66,.14)", top: 0, right: "8%" }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 1080, margin: "0 auto" }}>
            <nav style={{ fontSize: 13, color: C.muted, marginBottom: 20, fontWeight: 600 }}>
              <Link href="/" style={{ color: C.muted, textDecoration: "none" }}>Acasă</Link>
              <span style={{ margin: "0 8px" }}>›</span>
              <span style={{ color: C.text, fontWeight: 700 }}>{dom.hTitlu} {data.nume}</span>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
              {dom.slug === "grooming" ? <IconClienti size={58} /> : <IconFoarfeca size={58} />}
              <div style={{ ...eyebrow }}><MapPin size={13} strokeWidth={2.4} /> {data.nume}, jud. {data.judet}</div>
            </div>

            <h1 style={{ fontSize: "clamp(30px,4.6vw,46px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: -1.4, color: C.text, maxWidth: "20ch" }}>
              {dom.hTitlu} <span style={{ color: C.orange }}>{data.numeArticulat}</span>
            </h1>
            <p style={{ fontSize: 17.5, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 16, maxWidth: "62ch" }}>
              {dom.intro(data.nume, data.numeArticulat)}
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}>
              <Link href="/register" style={btnPrimary}>Caută un salon {data.numeArticulat} →</Link>
              <Link href="/cum-functioneaza#clienti" style={btnSecondary}>Cum funcționează</Link>
            </div>

            {/* comutare domeniu */}
            <div style={{ marginTop: 22, fontSize: 14, color: C.muted, fontWeight: 600 }}>
              Cauți {celalalt.subiect}?{" "}
              <Link href={urlFor(celalalt.slug, data.slug)} style={{ color: C.orangeText, fontWeight: 800, textDecoration: "none" }}>
                Vezi {celalalt.hTitlu.toLowerCase()} {data.numeArticulat} →
              </Link>
            </div>
          </div>
        </section>

        {/* SERVICII */}
        <section style={{ background: C.surface2, padding: "56px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div data-reveal style={eyebrow}>Servicii disponibile</div>
            <h2 data-reveal style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, letterSpacing: -0.6, color: C.text, marginTop: 12, marginBottom: 20 }}>
              Ce poți rezerva {data.numeArticulat}
            </h2>
            <div className="ch-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {dom.servicii.map((s) => (
                <div key={s} data-reveal className="ch-tile" style={{ ...tile, padding: "16px 20px", display: "flex", alignItems: "center", gap: 11 }}>
                  <Check size={17} color={C.orange} strokeWidth={2.8} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14.5, fontWeight: 800, color: C.text }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ZONE */}
        <section style={{ padding: "56px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div data-reveal style={eyebrow}>Acoperire</div>
            <h2 data-reveal style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, letterSpacing: -0.6, color: C.text, marginTop: 12, marginBottom: 20 }}>
              Zone deservite {data.numeArticulat}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {data.cartiere.map((c) => (
                <span key={c} data-reveal style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 50, padding: "10px 18px", fontSize: 14, fontWeight: 800, color: C.text }}>
                  <MapPin size={14} color={C.orange} strokeWidth={2.4} /> {c}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 13.5, color: C.dim, fontWeight: 600, marginTop: 16 }}>{data.populatie} · programări online 24/7</div>
          </div>
        </section>

        {/* DE CE */}
        <section style={{ background: C.surface2, padding: "56px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 32px" }}>
              <div data-reveal style={eyebrow}>De ce CalyHub</div>
              <h2 data-reveal style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, letterSpacing: -0.6, color: C.text, marginTop: 12 }}>
                De ce să rezervi prin CalyHub {data.numeArticulat}
              </h2>
            </div>
            <div className="ch-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              {dom.beneficii.map(({ Icon, t, d }) => (
                <div key={t} data-reveal className="ch-tile" style={tile}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <Icon size={20} color={C.orange} strokeWidth={2} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{t}</div>
                  <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, marginTop: 5, lineHeight: 1.5 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ALTE ORASE */}
        <section style={{ padding: "56px 20px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div data-reveal style={eyebrow}>Alte orașe</div>
            <h2 data-reveal style={{ fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 900, letterSpacing: -0.5, color: C.text, marginTop: 12, marginBottom: 18 }}>
              {dom.hTitlu} și în alte orașe
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {Object.values(ORASE).filter((o) => o.slug !== data.slug).map((o) => (
                <Link key={o.slug} href={urlFor(dom.slug, o.slug)} data-reveal
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 50, padding: "10px 18px", fontSize: 14, fontWeight: 800, color: C.text, textDecoration: "none" }}>
                  <MapPin size={14} color={C.orange} strokeWidth={2.4} /> {o.nume}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "0 20px 76px" }}>
          <div data-reveal style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ background: "linear-gradient(135deg, #FFF3EA 0%, #FFFBF7 100%)", border: "1px solid #FFDCC6", borderRadius: 28, padding: "clamp(32px,5vw,52px)", textAlign: "center" }}>
              <h2 style={{ fontSize: "clamp(24px,3.2vw,34px)", fontWeight: 900, letterSpacing: -0.6, color: C.text }}>
                Programează-te {data.numeArticulat}
              </h2>
              <p style={{ fontSize: 16, color: C.muted, fontWeight: 500, lineHeight: 1.7, marginTop: 12, maxWidth: "52ch", marginLeft: "auto", marginRight: "auto" }}>
                Contul e gratuit pentru clienți. Cauți, compari prețuri și rezervi în câteva minute.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
                <Link href="/register" style={btnPrimary}>Creează cont gratuit →</Link>
                <Link href={urlFor(celalalt.slug, data.slug)} style={btnSecondary}>{celalalt.eticheta} {data.numeArticulat}</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
      <ScrollReveal />
    </div>
  );
}
