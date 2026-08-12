"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { putereParola, sfaturiParola, PUTERE_DASH, PAROLA_MIN } from "../lib/parola";

/**
 * Formularul de schimbare a parolei, folosit de amândouă dashboardurile.
 *
 * În ambele, cele trei câmpuri erau necontrolate — fără `value`, fără
 * `onChange` — iar butonul afișa „Parolă schimbată cu succes!" fără să apeleze
 * nimic. Omul credea că și-a schimbat parola.
 *
 * Ținut într-un singur loc ca să nu ajungem din nou cu două forme care se
 * abat una de alta. Culorile vin de la dashboard, fiindcă fiecare își ține
 * paleta în starea lui.
 */
export default function SchimbaParola({
  c,
  inp,
  btnPrimary,
  theme,
  onGata,
}: {
  c: any;
  inp: React.CSSProperties;
  btnPrimary: React.CSSProperties;
  theme: "light" | "dark";
  onGata: (mesaj: string) => void;
}) {
  const [parole, setParole] = useState({ veche: "", noua: "", confirm: "" });
  const [vizibila, setVizibila] = useState({ veche: false, noua: false, confirm: false });
  const [eroare, setEroare] = useState("");
  const [loading, setLoading] = useState(false);

  const putere = Math.max(0, putereParola(parole.noua));
  const sfaturi = sfaturiParola(parole.noua);

  /**
   * Cerem și parola curentă, deși Supabase n-o cere: `updateUser` merge cu
   * sesiunea, deci fără ea oricine prinde un telefon descuiat poate schimba
   * parola și prelua contul. O verificăm reautentificând cu ea.
   */
  async function schimba() {
    setEroare("");
    if (!parole.veche) { setEroare("Scrie parola curentă."); return; }
    if (parole.noua.length < PAROLA_MIN) { setEroare(`Parola nouă trebuie să aibă cel puțin ${PAROLA_MIN} caractere.`); return; }
    if (parole.noua !== parole.confirm) { setEroare("Parolele noi nu se potrivesc."); return; }
    if (parole.noua === parole.veche) { setEroare("Parola nouă e aceeași cu cea curentă."); return; }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email;
    if (!email) { setEroare("Nu am putut citi contul. Reintră în cont și încearcă din nou."); setLoading(false); return; }

    const { error: eLogin } = await supabase.auth.signInWithPassword({ email, password: parole.veche });
    if (eLogin) { setEroare("Parola curentă nu e corectă."); setLoading(false); return; }

    const { error } = await supabase.auth.updateUser({ password: parole.noua });
    setLoading(false);
    if (error) { setEroare(error.message || "Nu am putut schimba parola. Încearcă din nou."); return; }

    setParole({ veche: "", noua: "", confirm: "" });
    setVizibila({ veche: false, noua: false, confirm: false });
    onGata("Parola a fost schimbată.");
  }

  const campuri = [
    { key: "veche" as const, label: "Parola curentă", ph: "Parola cu care intri acum" },
    { key: "noua" as const, label: "Parola nouă", ph: `Minim ${PAROLA_MIN} caractere` },
    { key: "confirm" as const, label: "Confirmă parola nouă", ph: "Scrie-o încă o dată" },
  ];

  return (
    <div style={{ background: c.surface, borderRadius: 20, padding: "28px", border: `1.5px solid ${c.border}` }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: c.text, marginBottom: 4 }}>Schimbă parola</div>
      <div style={{ fontSize: 12.5, color: c.muted, marginBottom: 18 }}>
        Îți cerem parola curentă ca nimeni să nu poată schimba parola de pe un dispozitiv lăsat deschis.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {campuri.map(f => (
          <div key={f.key}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: c.text2, marginBottom: 6 }}>{f.label}</label>
            <div style={{ position: "relative" }}>
              <input
                type={vizibila[f.key] ? "text" : "password"}
                value={parole[f.key]}
                onChange={e => { setParole(p => ({ ...p, [f.key]: e.target.value })); setEroare(""); }}
                placeholder={f.ph}
                autoComplete={f.key === "veche" ? "current-password" : "new-password"}
                style={{ ...inp, paddingRight: 44 }}
              />
              {/* Același ochi ca la conectare și înregistrare. */}
              <button type="button" onClick={() => setVizibila(v => ({ ...v, [f.key]: !v[f.key] }))}
                aria-label={vizibila[f.key] ? "Ascunde parola" : "Arată parola"}
                style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: c.xmuted, cursor: "pointer", padding: "8px 10px", display: "flex", alignItems: "center" }}>
                {vizibila[f.key] ? (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            {f.key === "noua" && parole.noua.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                  {[0, 1, 2, 3].map(i => (
                    <span key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= putere ? PUTERE_DASH[putere].c : (c.toggleOff || c.border), transition: "background .2s" }} />
                  ))}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: PUTERE_DASH[putere].c }}>
                  Parolă {PUTERE_DASH[putere].t.toLowerCase()}
                </div>
                {sfaturi.length > 0 && (
                  <div style={{ fontSize: 11.5, color: c.muted, marginTop: 3, lineHeight: 1.5 }}>
                    Ca s-o întărești: {sfaturi.join(", ")}.
                  </div>
                )}
              </div>
            )}

            {f.key === "confirm" && parole.confirm.length > 0 && parole.confirm === parole.noua && (
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#10B981", marginTop: 6 }}>Parolele se potrivesc</div>
            )}
          </div>
        ))}

        {eroare && (
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#EF4444", background: theme === "dark" ? "rgba(239,68,68,.12)" : "#FEF2F2", border: "1.5px solid rgba(239,68,68,.35)", borderRadius: 12, padding: "10px 14px" }}>
            {eroare}
          </div>
        )}

        <button onClick={schimba} disabled={loading}
          style={{ ...btnPrimary, marginTop: 4, opacity: loading ? .6 : 1, cursor: loading ? "wait" : "pointer" }}>
          {loading ? "Se schimbă..." : "Schimbă parola"}
        </button>
      </div>
    </div>
  );
}
