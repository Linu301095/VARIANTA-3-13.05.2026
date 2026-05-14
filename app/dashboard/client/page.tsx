"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SALOANE = [
  { id: 1, nume: "Paws & Style", oras: "București, Sector 2", rating: 4.9, recenzii: 127, servicii: ["Tuns", "Băiță", "Unghii"], pret: "de la 80 RON", distanta: "1.2 km", badge: "⭐ Top rated", culoare: "#FF6B00" },
  { id: 2, nume: "Fluffy Salon", oras: "București, Sector 1", rating: 4.8, recenzii: 89, servicii: ["Tuns", "Styling", "Spa"], pret: "de la 90 RON", distanta: "2.1 km", badge: "🆕 Nou", culoare: "#8B5CF6" },
  { id: 3, nume: "Happy Pets Grooming", oras: "București, Sector 3", rating: 4.7, recenzii: 214, servicii: ["Tuns", "Băiță", "Anti-purici"], pret: "de la 65 RON", distanta: "3.4 km", badge: "🔥 Popular", culoare: "#10B981" },
  { id: 4, nume: "Royal Dog Salon", oras: "București, Sector 4", rating: 4.9, recenzii: 56, servicii: ["Premium grooming", "Spa", "Masaj"], pret: "de la 120 RON", distanta: "4.0 km", badge: "👑 Premium", culoare: "#F59E0B" },
];

export default function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [animal, setAnimal] = useState<any>(null);
  const [salonSelectat, setSalonSelectat] = useState<number | null>(null);
  const [rezervare, setRezervare] = useState<{ salonId: number; serviciu: string; ora: string } | null>(null);
  const [confirmat, setConfirmat] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("calyhub_user");
    const a = localStorage.getItem("calyhub_animal");
    if (u) setUser(JSON.parse(u));
    if (a) setAnimal(JSON.parse(a));
  }, []);

  const prenume = user?.numeComplet?.split(" ")[0] || "Utilizator";
  const salon = SALOANE.find(s => s.id === salonSelectat);

  if (confirmat && rezervare && salon) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
        <Header prenume={prenume} onLogout={() => router.push("/login")} />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div style={{ textAlign: "center", maxWidth: 440 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#FFF3EA", border: "3px solid #FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>✅</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1A1A1A", marginBottom: 12 }}>Programare confirmată!</h1>
            <div style={{ background: "#fff", border: "2px solid #FF6B00", borderRadius: 20, padding: "20px 24px", margin: "20px 0", textAlign: "left" }}>
              {[["🏪 Salon", salon.nume], ["✂️ Serviciu", rezervare.serviciu], ["🕐 Ora", rezervare.ora], ["🐾 Animal", animal?.numeAnimal || "Animăluțul tău"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "7px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <span style={{ color: "#6B7280" }}>{k}</span>
                  <span style={{ fontWeight: 700, color: "#1A1A1A" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#FFF3EA", border: "1px solid #FFDCC6", borderRadius: 12, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#FF6B00", fontWeight: 700 }}>
              📱 Vei primi un SMS de confirmare în curând
            </div>
            <button onClick={() => { setConfirmat(false); setSalonSelectat(null); setRezervare(null); }}
              style={{ padding: "13px 28px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
              ← Înapoi la saloane
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (salonSelectat && salon) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
        <Header prenume={prenume} onLogout={() => router.push("/login")} />
        <main style={{ flex: 1, padding: "32px 20px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <button onClick={() => setSalonSelectat(null)}
              style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, background: "none", border: "none", fontSize: 14, fontWeight: 700, color: "#6B7280", cursor: "pointer", fontFamily: "Nunito, sans-serif", padding: 0 }}>
              ← Înapoi
            </button>
            <div style={{ background: "#fff", borderRadius: 24, padding: "28px 28px", border: "2px solid #FF6B00", boxShadow: "0 4px 20px rgba(255,107,0,.1)", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: salon.culoare, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>{salon.badge}</div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1A1A1A", margin: 0 }}>{salon.nume}</h2>
                  <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>📍 {salon.oras} · {salon.distanta}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#1A1A1A" }}>⭐ {salon.rating}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{salon.recenzii} recenzii</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {salon.servicii.map(s => (
                  <span key={s} style={{ fontSize: 12, fontWeight: 700, background: "#FFF3EA", color: "#FF6B00", padding: "4px 12px", borderRadius: 50, border: "1px solid #FFDCC6" }}>{s}</span>
                ))}
              </div>
            </div>

            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1A1A1A", marginBottom: 14 }}>Alege serviciul</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {[
                { nume: "Tuns complet", pret: "80 RON", durata: "60 min" },
                { nume: "Băiță + uscare", pret: "50 RON", durata: "40 min" },
                { nume: "Tuns + Băiță + Unghii", pret: "120 RON", durata: "90 min" },
                { nume: "Styling complet", pret: "150 RON", durata: "120 min" },
              ].map(s => (
                <button key={s.nume} onClick={() => setRezervare(r => r?.serviciu === s.nume ? r : { ...r!, salonId: salon.id, serviciu: s.nume, ora: "" })}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderRadius: 14, border: rezervare?.serviciu === s.nume ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", background: rezervare?.serviciu === s.nume ? "#FFF3EA" : "#fff", cursor: "pointer", fontFamily: "Nunito, sans-serif", textAlign: "left" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>{s.nume}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{s.durata}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#FF6B00" }}>{s.pret}</div>
                </button>
              ))}
            </div>

            {rezervare?.serviciu && (
              <>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1A1A1A", marginBottom: 14 }}>Alege ora</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 }}>
                  {["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(ora => (
                    <button key={ora} onClick={() => setRezervare(r => ({ ...r!, ora }))}
                      style={{ padding: "10px 6px", borderRadius: 10, border: rezervare?.ora === ora ? "2px solid #FF6B00" : "1.5px solid #EBEBEB", background: rezervare?.ora === ora ? "#FFF3EA" : "#fff", fontSize: 13, fontWeight: 700, color: rezervare?.ora === ora ? "#FF6B00" : "#374151", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                      {ora}
                    </button>
                  ))}
                </div>
              </>
            )}

            {rezervare?.serviciu && rezervare?.ora && (
              <button onClick={() => setConfirmat(true)}
                style={{ width: "100%", padding: "14px 24px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(255,107,0,.35)", fontFamily: "Nunito, sans-serif" }}>
                Confirmă programarea →
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Nunito', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <Header prenume={prenume} onLogout={() => router.push("/login")} />
      <main style={{ flex: 1, padding: "32px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Bun venit */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 900, color: "#1A1A1A", marginBottom: 6 }}>
              Bună, {prenume}! 🐾
            </h1>
            {animal && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", border: "2px solid #FF6B00", borderRadius: 50, padding: "8px 18px", fontSize: 13 }}>
                <span style={{ fontSize: 18 }}>🐕</span>
                <span style={{ fontWeight: 700, color: "#1A1A1A" }}>{animal.numeAnimal}</span>
                <span style={{ color: "#9CA3AF" }}>·</span>
                <span style={{ color: "#6B7280" }}>{animal.rasa}, {animal.greutate} kg</span>
              </div>
            )}
          </div>

          {/* Recomandate */}
          <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1A1A1A" }}>📍 Recomandate în zona ta</h2>
            <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>București</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginBottom: 40 }}>
            {SALOANE.slice(0, 2).map(s => <CardSalon key={s.id} salon={s} onSelect={() => setSalonSelectat(s.id)} />)}
          </div>

          {/* Toți partenerii */}
          <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1A1A1A", marginBottom: 16 }}>✂️ Toți partenerii CalyHub</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {SALOANE.map(s => <CardSalon key={s.id} salon={s} onSelect={() => setSalonSelectat(s.id)} />)}
          </div>
        </div>
      </main>
    </div>
  );
}

function Header({ prenume, onLogout }: { prenume: string; onLogout: () => void }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #EBEBEB", height: 66 }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/"><Image src="/logo.png" alt="CalyHub" width={120} height={40} style={{ height: 40, width: "auto", objectFit: "contain" }} priority /></Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>👤 {prenume}</div>
          <button onClick={onLogout} style={{ padding: "8px 16px", borderRadius: 50, border: "1.5px solid #EBEBEB", background: "#fff", fontSize: 13, fontWeight: 700, color: "#6B7280", cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Ieșire</button>
        </div>
      </div>
    </header>
  );
}

function CardSalon({ salon, onSelect }: { salon: typeof SALOANE[0]; onSelect: () => void }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: 22, border: "2px solid #FF6B00", boxShadow: "0 2px 12px rgba(255,107,0,.08)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: salon.culoare, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>{salon.badge}</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#1A1A1A" }}>{salon.nume}</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>📍 {salon.distanta}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#1A1A1A" }}>⭐ {salon.rating}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{salon.recenzii} rec.</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {salon.servicii.map(s => (
          <span key={s} style={{ fontSize: 11, fontWeight: 700, background: "#FFF3EA", color: "#FF6B00", padding: "3px 10px", borderRadius: 50 }}>{s}</span>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{salon.pret}</span>
        <button onClick={onSelect}
          style={{ padding: "9px 18px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif", boxShadow: "0 4px 12px rgba(255,107,0,.3)" }}>
          Programează →
        </button>
      </div>
    </div>
  );
}
