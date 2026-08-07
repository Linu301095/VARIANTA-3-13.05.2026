import Image from "next/image";
import Link from "next/link";

/**
 * Semnul CalyHub din antetul paginilor publice.
 *
 * În loc de badge-ul întreg — în care numele iese pe la 14px și sloganul pe la
 * 4px, adică ilizibil — punem alături cele trei bucăți ale logo-ului.
 *
 * **Sunt trei elemente separate, nu unul singur.** Doar chenarul cu siluetele e
 * link către pagina principală; numele și sloganul stau lângă el, ca text.
 * Când toate trei erau într-un singur `<a>`, regulile generale de link din
 * `globals.css` (`a:hover` ridică și adaugă umbră) desenau un dreptunghi gri
 * peste tot ansamblul.
 *
 * Numele și sloganul sunt **decupate din `logo.png`**, nu rescrise cu alt font,
 * ca literele să fie exact cele din logo. Singurul lucru redesenat e chenarul:
 * în logo el înconjoară tot pătratul, inclusiv zona de text, deci nu se putea
 * tăia doar partea de sus. E acum vector, cu aceeași formă și aceleași culori.
 *
 * `logo.png` rămâne neatins — se folosește mai departe pentru OpenGraph,
 * favicon, dashboarduri și panoul de admin.
 *
 * Animația de intrare rulează o singură dată pe sesiune (`components/MarcaAnim.tsx`).
 */
export default function Logo({ h = 54, priority = false }: { h?: number; priority?: boolean }) {
  const semn = Math.round(h * 0.98);       // pătratul cu chenar
  const desen = Math.round(semn * 0.74);   // siluetele din interiorul chenarului
  const nume = Math.round(h * 0.42);       // înălțimea cuvântului „CalyHub"
  const slogan = Math.round(h * 0.165);    // sloganul, mai mare decât în logo — ca să se citească

  return (
    <span className="ch-marca" style={{ display: "inline-flex", alignItems: "center", gap: Math.round(h * 0.2), flexShrink: 0 }}>
      {/* 1 · Logo-ul — singura bucată care e link */}
      <Link href="/" aria-label="CalyHub — pagina principală" className="ch-marca-link ch-marca-semn"
        style={{ position: "relative", width: semn, height: semn, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 100 100" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path d="M50 3 H26 A23 23 0 0 0 3 26 V74 A23 23 0 0 0 26 97 H50" fill="none" stroke="var(--marca-contur)" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 3 H74 A23 23 0 0 1 97 26 V74 A23 23 0 0 1 74 97 H50" fill="none" stroke="var(--pub-orange)" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <Image className="logo-light" src="/logo-semn.png" alt="" width={Math.round(desen * 149 / 160)} height={desen} style={{ height: desen, width: "auto" }} priority={priority} />
        <Image className="logo-dark" src="/logo-semn-dark.png" alt="" width={Math.round(desen * 149 / 160)} height={desen} style={{ height: desen, width: "auto" }} priority={priority} />
      </Link>

      <span style={{ display: "flex", flexDirection: "column", gap: Math.round(h * 0.055), minWidth: 0 }}>
        {/* 2 · Numele */}
        <span className="ch-marca-nume" style={{ display: "inline-flex", height: nume }}>
          <Image className="logo-light" src="/logo-nume.png" alt="CalyHub" width={Math.round(nume * 463 / 120)} height={nume} style={{ height: nume, width: "auto" }} priority={priority} />
          <Image className="logo-dark" src="/logo-nume-dark.png" alt="CalyHub" width={Math.round(nume * 463 / 120)} height={nume} style={{ height: nume, width: "auto" }} priority={priority} />
        </span>
        {/* 3 · Sloganul */}
        <span className="ch-marca-slogan" style={{ display: "inline-flex", height: slogan }}>
          <Image className="logo-light" src="/logo-slogan.png" alt="Beauty · Îngrijire · Încredere" width={Math.round(slogan * 834 / 40)} height={slogan} style={{ height: slogan, width: "auto" }} />
          <Image className="logo-dark" src="/logo-slogan-dark.png" alt="Beauty · Îngrijire · Încredere" width={Math.round(slogan * 834 / 40)} height={slogan} style={{ height: slogan, width: "auto" }} />
        </span>
      </span>
    </span>
  );
}
