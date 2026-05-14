"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../components/Footer";

type Plan = {
  id: "starter" | "pro" | "business";
  nume: string;
  pret: number;
  pretLabel: string;
  badge?: string;
  descriere: string;
  features: { text: string; included: boolean }[];
  recomandat?: boolean;
};

const PLANURI: Plan[] = [
  {
    id: "starter",
    nume: "Starter",
    pret: 0,
    pretLabel: "Gratuit",
    badge: "14 zile trial",
    descriere: "Perfect pentru saloane noi care vor sa testeze platforma",
    features: [
      { text: "1 angajat (groomer)", included: true },
      { text: "Pana la 20 programari/luna", included: true },
      { text: "Calendar online", included: true },
      { text: "Notificari email", included: true },
      { text: "Notificari SMS", included: false },
      { text: "Statistici detaliate", included: false },
      { text: "Integrare Google Calendar", included: false },
      { text: "Suport prioritar", included: false },
    ],
  },
  {
    id: "pro",
    nume: "Pro",
    pret: 99,
    pretLabel: "99 RON",
    badge: "Cel mai popular",
    descriere: "Pentru saloane in crestere, cu echipa mica",
    recomandat: true,
    features: [
      { text: "Pana la 5 angajati", included: true },
      { text: "Programari nelimitate", included: true },
      { text: "Calendar online", included: true },
      { text: "Notificari email + SMS", included: true },
      { text: "Statistici detaliate", included: true },
      { text: "Integrare Google Calendar", included: true },
      { text: "Raport lunar PDF", included: true },
      { text: "Suport prioritar", included: false },
    ],
  },
  {
    id: "business",
    nume: "Business",
    pret: 199,
    pretLabel: "199 RON",
    descriere: "Pentru saloane mari sau cu mai multe locatii",
    features: [
      { text: "Echipa nelimitata", included: true },
      { text: "Programari nelimitate", included: true },
      { text: "Multi-locatie", included: true },
      { text: "Notificari email + SMS", included: true },
      { text: "Statistici avansate + export", included: true },
      { text: "Integrare Google Calendar", included: true },
      { text: "Raport lunar + analiza echipa", included: true },
      { text: "Suport prioritar 24/7", included: true },
    ],
  },
];

export default function AbonamentSalon() {
  const router = useRouter();
  const [ales, setAles] = useState<Plan["id"]>("pro");
  const [loading, setLoading] = useState(false);

  function alegePlan() {
    setLoading(true);
    const plan = PLANURI.find(p => p.id === ales)!;
    const dataExpirare = new Date();
    if (plan.id === "starter") dataExpirare.setDate(dataExpirare.getDate() + 14);
    else dataExpirare.setMonth(dataExpirare.getMonth() + 1);
    localStorage.setItem("calyhub_abonament", JSON.stringify({
      planId: plan.id,
      planNume: plan.nume,
      pret: plan.pret,
      dataStart: new Date().toISOString(),
      dataExpirare: dataExpirare.toISOString(),
      autoRenew: true,
    }));
    setTimeout(() => router.push("/dashboard/salon"), 700);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/"><Image src="/logo.png" alt="CalyHub" width={130} height={44} style={{ height: 44, width: "auto", objectFit: "contain" }} priority /></Link>
          <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>Ultimul pas — Alege planul</div>
        </div>
      </header>

      <main style={{ flex: 1, padding: "40px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ display: "inline-block", background: "#FFF3EA", color: "#FF6B00", padding: "6px 14px", borderRadius: 50, fontSize: 12, fontWeight: 800, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>🎉 Salonul tau e aproape gata!</div>
            <h1 style={{ fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 900, color: "#1A1A1A", marginBottom: 10, lineHeight: 1.2 }}>Alege planul potrivit pentru salon</h1>
            <p style={{ fontSize: 15, color: "#6B7280", maxWidth: 540, margin: "0 auto", lineHeight: 1.6 }}>
              Poti schimba planul oricand din panoul de control. Fara contracte. Fara surprize.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
            {PLANURI.map(p => {
              const activ = ales === p.id;
              return (
                <div key={p.id} onClick={() => setAles(p.id)}
                  style={{
                    position: "relative",
                    background: "#fff",
                    borderRadius: 24,
                    padding: "28px 26px",
                    border: activ ? "3px solid #FF6B00" : "2px solid #EBEBEB",
                    cursor: "pointer",
                    boxShadow: activ ? "0 8px 32px rgba(255,107,0,.2)" : "0 2px 12px rgba(0,0,0,.04)",
                    transition: "all .2s",
                    transform: p.recomandat && !activ ? "translateY(-4px)" : "none",
                  }}>
                  {p.badge && (
                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: p.recomandat ? "#FF6B00" : "#1A1A1A", color: "#fff", padding: "4px 14px", borderRadius: 50, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, whiteSpace: "nowrap" }}>
                      {p.badge}
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{p.nume}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 36, fontWeight: 900, color: "#1A1A1A", lineHeight: 1 }}>{p.pretLabel}</span>
                    {p.pret > 0 && <span style={{ fontSize: 14, color: "#9CA3AF", fontWeight: 600 }}>/luna</span>}
                  </div>
                  <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 18, lineHeight: 1.5, minHeight: 36 }}>{p.descriere}</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 9, borderTop: "1px solid #F3F4F6", paddingTop: 16, marginBottom: 18 }}>
                    {p.features.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: f.included ? "#374151" : "#D1D5DB", fontWeight: f.included ? 600 : 500, textDecoration: f.included ? "none" : "line-through" }}>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", background: f.included ? "#ECFDF5" : "#F9FAFB", color: f.included ? "#10B981" : "#D1D5DB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>{f.included ? "✓" : "✕"}</span>
                        {f.text}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", borderRadius: 12, background: activ ? "#FF6B00" : "#FAFAFA", color: activ ? "#fff" : "#6B7280", fontSize: 13, fontWeight: 800, transition: "all .2s" }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", border: activ ? "2px solid #fff" : "2px solid #D1D5DB", background: activ ? "#fff" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {activ && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF6B00" }} />}
                    </span>
                    {activ ? "Plan selectat" : "Selecteaza"}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: "#fff", borderRadius: 20, padding: "22px 28px", border: "1.5px solid #EBEBEB", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ fontSize: 24 }}>🛡️</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1A1A1A", marginBottom: 2 }}>Garantie 30 zile</div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>Daca nu esti multumit, iti returnam banii integral in primele 30 de zile.</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <button onClick={alegePlan} disabled={loading}
              style={{ padding: "16px 48px", borderRadius: 50, border: "none", background: loading ? "#FFB07A" : "#FF6B00", color: "#fff", fontSize: 16, fontWeight: 900, cursor: loading ? "default" : "pointer", boxShadow: "0 8px 28px rgba(255,107,0,.4)", fontFamily: "Nunito, sans-serif" }}>
              {loading ? "Se activeaza..." : `Activeaza planul ${PLANURI.find(p => p.id === ales)?.nume} →`}
            </button>
            <div style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", maxWidth: 480, lineHeight: 1.6 }}>
              {ales === "starter"
                ? "Trial gratuit 14 zile. Fara card de credit necesar. Anuleaza oricand."
                : `Vei fi taxat ${PLANURI.find(p => p.id === ales)?.pretLabel}/luna. Anuleaza oricand din setari.`}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
