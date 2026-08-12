"use client";

/**
 * Ecranul care apare când ceva crapă, oriunde în aplicație.
 *
 * Fără el, Next arată pagina lui albă cu „This page couldn't load", care nu
 * spune nimic nici omului, nici nouă. Aici se vede mesajul tehnic, într-un
 * chenar din care poate fi copiat și trimis — exact așa am găsit eroarea #300
 * care făcea dashboardul să crape la deschiderea unui salon.
 *
 * Se folosește din trei locuri: `app/error.tsx` (paginile publice),
 * `app/dashboard/error.tsx` (conturile) și `app/global-error.tsx` (cazul în
 * care crapă însuși scheletul aplicației).
 */
export default function EcranEroare({
  error,
  reset,
  inapoiLa = "/",
  inapoiText = "Înapoi la pagina principală",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  inapoiLa?: string;
  inapoiText?: string;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--pub-bg, #FAFAFA)", fontFamily: "Nunito, system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 520, width: "100%", background: "var(--pub-surface, #fff)", border: "1.5px solid #FFD9BF", borderRadius: 20, padding: "28px 26px", boxShadow: "0 8px 32px rgba(0,0,0,.08)" }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(239,68,68,.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          </svg>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 900, color: "var(--pub-text, #1A1A1A)", margin: "0 0 8px" }}>
          Ceva n-a mers cum trebuie
        </h1>
        <p style={{ fontSize: 14, color: "var(--pub-muted, #6B7280)", lineHeight: 1.65, margin: "0 0 18px" }}>
          Încearcă din nou. Dacă se repetă, trimite-ne textul de mai jos la{" "}
          <a href="mailto:support@calyhub.ro?subject=Eroare%20in%20aplicatie" style={{ color: "#FF6B00", fontWeight: 800 }}>support@calyhub.ro</a>.
        </p>

        <pre style={{
          fontSize: 12, lineHeight: 1.6, color: "var(--pub-text2, #374151)",
          background: "var(--pub-surface2, #F7F4F0)", border: "1px solid #FFE9D8",
          borderRadius: 12, padding: "12px 14px", margin: "0 0 18px",
          whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "ui-monospace, Menlo, Consolas, monospace",
        }}>
          {error?.message || "Eroare necunoscută"}
          {error?.digest ? `\n\ncod: ${error.digest}` : ""}
        </pre>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={reset}
            style={{ padding: "12px 24px", borderRadius: 50, border: "none", background: "#FF6B00", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
            Încearcă din nou
          </button>
          <button onClick={() => { window.location.href = inapoiLa; }}
            style={{ padding: "12px 24px", borderRadius: 50, border: "1.5px solid #FFD9BF", background: "var(--pub-surface, #fff)", color: "var(--pub-text2, #374151)", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
            {inapoiText}
          </button>
        </div>
      </div>
    </div>
  );
}
