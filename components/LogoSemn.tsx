import Image from "next/image";

/**
 * Logo-ul CalyHub, singur: chenarul cu siluetele, fără nume și fără slogan.
 *
 * Se folosește acolo unde nu e loc de marca întreagă și nici rost de ea —
 * dashboarduri și panoul de admin. Badge-ul complet, la 38px, ar avea numele
 * de ~10px și sloganul de ~4px, adică o mâzgăleală în colț.
 *
 * Marca întreagă (logo + nume + slogan) e în `components/Logo.tsx` și stă pe
 * paginile publice, unde contează recunoașterea.
 *
 * Chenarul e desenat ca vector, deci se colorează după temă. Dashboardurile își
 * țin tema în stare proprie, așa că pot trimite `tema` explicit; paginile care
 * folosesc `data-theme` pe `<html>` o lasă nesetată și comută din CSS.
 */
export default function LogoSemn({
  size = 38,
  tema,
  priority = false,
}: {
  size?: number;
  tema?: "light" | "dark";
  priority?: boolean;
}) {
  const desen = Math.round(size * 0.74);
  const latDesen = Math.round(desen * 149 / 160);

  return (
    <span style={{ position: "relative", width: size, height: size, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 100 100" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path d="M50 3 H26 A23 23 0 0 0 3 26 V74 A23 23 0 0 0 26 97 H50" fill="none"
          stroke={tema === "dark" ? "#F0EBE7" : tema === "light" ? "#1A1A1A" : "var(--marca-contur)"} strokeWidth="4" strokeLinecap="round" />
        <path d="M50 3 H74 A23 23 0 0 1 97 26 V74 A23 23 0 0 1 74 97 H50" fill="none"
          stroke="#FF6B00" strokeWidth="4" strokeLinecap="round" />
      </svg>

      {tema ? (
        <Image src={tema === "dark" ? "/logo-semn-dark.png" : "/logo-semn.png"} alt="CalyHub"
          width={latDesen} height={desen} style={{ height: desen, width: "auto" }} priority={priority} />
      ) : (
        <>
          <Image className="logo-light" src="/logo-semn.png" alt="CalyHub" width={latDesen} height={desen} style={{ height: desen, width: "auto" }} priority={priority} />
          <Image className="logo-dark" src="/logo-semn-dark.png" alt="CalyHub" width={latDesen} height={desen} style={{ height: desen, width: "auto" }} priority={priority} />
        </>
      )}
    </span>
  );
}
