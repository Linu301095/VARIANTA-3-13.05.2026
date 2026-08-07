import Image from "next/image";
import Link from "next/link";

/**
 * Semnul CalyHub din antetul paginilor publice.
 *
 * În loc de badge-ul întreg — în care numele iese pe la 14px și sloganul pe la
 * 4px, adică ilizibil — punem alături cele trei bucăți ale logo-ului:
 * chenarul cu siluetele, cuvântul „CalyHub" și sloganul.
 *
 * Toate trei sunt **decupate din `logo.png`**, nu rescrise cu alt font, ca
 * literele să fie exact cele din logo. Singurul lucru redesenat e chenarul:
 * în logo el înconjoară tot pătratul, inclusiv zona de text, deci nu se putea
 * tăia doar partea de sus. E acum vector, cu aceeași formă și aceleași două
 * culori, și se adaptează la temă.
 *
 * `logo.png` rămâne neatins și se folosește mai departe pentru OpenGraph,
 * favicon și dashboarduri.
 *
 * Animația de intrare rulează **o singură dată pe sesiune** — antetul e pe
 * fiecare pagină, iar o mișcare la fiecare navigare ar deveni obositoare.
 * Vezi `.ch-marca*` în `globals.css`.
 */
export default function Logo({ h = 54, priority = false }: { h?: number; priority?: boolean }) {
  const semn = Math.round(h * 0.98);          // pătratul cu chenar
  const nume = Math.round(h * 0.42);          // înălțimea cuvântului „CalyHub"
  const slogan = Math.round(h * 0.165);       // sloganul, mai mare decât în logo — ca să se citească

  return (
    <Link
      href="/"
      aria-label="CalyHub — pagina principală"
      className="ch-marca"
      style={{ display: "inline-flex", alignItems: "center", gap: Math.round(h * 0.2), flexShrink: 0, textDecoration: "none" }}
    >
      <span className="ch-marca-semn" style={{ position: "relative", width: semn, height: semn, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        {/* chenarul: jumătate întunecată, jumătate portocalie, ca în logo */}
        <svg viewBox="0 0 100 100" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path d="M50 3 H26 A23 23 0 0 0 3 26 V74 A23 23 0 0 0 26 97 H50" fill="none" stroke="var(--marca-contur)" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 3 H74 A23 23 0 0 1 97 26 V74 A23 23 0 0 1 74 97 H50" fill="none" stroke="var(--pub-orange)" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <Image className="logo-light" src="/logo-semn.png" alt="" width={Math.round(semn * 0.74 * 149 / 160)} height={Math.round(semn * 0.74)} style={{ height: Math.round(semn * 0.74), width: "auto" }} priority={priority} />
        <Image className="logo-dark" src="/logo-semn-dark.png" alt="" width={Math.round(semn * 0.74 * 149 / 160)} height={Math.round(semn * 0.74)} style={{ height: Math.round(semn * 0.74), width: "auto" }} priority={priority} />
      </span>

      <span style={{ display: "flex", flexDirection: "column", gap: Math.round(h * 0.055), minWidth: 0 }}>
        <span className="ch-marca-nume" style={{ display: "inline-flex", height: nume }}>
          <Image className="logo-light" src="/logo-nume.png" alt="CalyHub" width={Math.round(nume * 463 / 120)} height={nume} style={{ height: nume, width: "auto" }} priority={priority} />
          <Image className="logo-dark" src="/logo-nume-dark.png" alt="CalyHub" width={Math.round(nume * 463 / 120)} height={nume} style={{ height: nume, width: "auto" }} priority={priority} />
        </span>
        <span className="ch-marca-slogan" style={{ display: "inline-flex", height: slogan }}>
          <Image className="logo-light" src="/logo-slogan.png" alt="" width={Math.round(slogan * 834 / 40)} height={slogan} style={{ height: slogan, width: "auto" }} />
          <Image className="logo-dark" src="/logo-slogan-dark.png" alt="" width={Math.round(slogan * 834 / 40)} height={slogan} style={{ height: slogan, width: "auto" }} />
        </span>
      </span>
    </Link>
  );
}
