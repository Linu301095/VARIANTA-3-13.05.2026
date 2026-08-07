const ORANGE = "var(--pub-orange)";
const SOFT = "var(--pub-orange-soft)";
const BORDER = "var(--pub-orange-border)";

/**
 * CELE DOUĂ LUMI — foarfecă ↔ lăbuță, alternând.
 *
 * Stă în badge-ul din capul paginii principale, înaintea titlului. E primul
 * lucru pe care îl vede un vizitator, așa că spune mesajul care ne diferențiază
 * — „și pentru tine, și pentru animalul tău" — înainte să apuce să citească.
 *
 * Desenul e redus la minimum pentru că textul din badge are 11px: la mărimea
 * asta orice detaliu în plus devine o pată. O singură mișcare, lentă.
 *
 * Când sistemul cere reducerea mișcării, cele două se așază una lângă alta,
 * statice — mesajul rămâne întreg, doar animația dispare.
 */
export function IconDouaLumi({ size = 15 }: { size?: number }) {
  const comun = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: ORANGE, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  return (
    <span className="ch-lumi" aria-hidden="true">
      {/* Foarfecă — înfrumusețare */}
      <svg {...comun} className="ch-lumi-a">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M20 4 8.12 15.88M14.8 14.8 20 20M8.12 8.12 12 12" />
      </svg>
      {/* Lăbuță — grooming */}
      <svg {...comun} className="ch-lumi-b">
        <circle cx="5.5" cy="10" r="2.2" fill={ORANGE} stroke="none" />
        <circle cx="10" cy="5.5" r="2.2" fill={ORANGE} stroke="none" />
        <circle cx="15.5" cy="6.5" r="2.2" fill={ORANGE} stroke="none" />
        <circle cx="19" cy="11" r="2.2" fill={ORANGE} stroke="none" />
        <path d="M12.2 12.4c2.8 0 5.1 2 5.1 4.4s-2 3.4-3.6 3.4h-3c-1.6 0-3.6-1-3.6-3.4s2.3-4.4 5.1-4.4z" fill={ORANGE} stroke="none" />
      </svg>
      <style>{`
        /* Varianta sigură: amândouă vizibile, una lângă alta, fără mișcare. */
        .ch-lumi { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; }
        .ch-lumi-a, .ch-lumi-b { display: block; }

        @media (prefers-reduced-motion: no-preference) {
          /* Suprapuse în aceeași celulă, ca să se schimbe pe loc. */
          .ch-lumi { display: inline-grid; gap: 0; }
          .ch-lumi-a, .ch-lumi-b { grid-area: 1 / 1; }
          .ch-lumi-a { animation: chLumiA 6s ease-in-out infinite; }
          .ch-lumi-b { animation: chLumiB 6s ease-in-out infinite; }
        }
        /* Fiecare stă afișată ~2,4s, cu o trecere scurtă între ele. */
        @keyframes chLumiA {
          0%, 40% { opacity: 1; transform: scale(1); }
          48%, 92% { opacity: 0; transform: scale(.7); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes chLumiB {
          0%, 40% { opacity: 0; transform: scale(.7); }
          48%, 92% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(.7); }
        }
      `}</style>
    </span>
  );
}

/** HUB — noduri care converg spre centru („De ce CalyHub": totul într-un loc) */
export function IconHub({ size = 60 }: { size?: number }) {
  const nodes = [
    { x: 32, y: 13 }, { x: 51, y: 24 }, { x: 51, y: 44 },
    { x: 32, y: 55 }, { x: 13, y: 44 }, { x: 13, y: 24 },
  ];
  return (
    <span style={{ display: "inline-flex", flexShrink: 0 }} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect x="2" y="2" width="60" height="60" rx="17" fill={SOFT} stroke={BORDER} strokeWidth="1.5" />
        {/* raze */}
        {nodes.map((n, i) => (
          <line key={`l${i}`} className="ch-hub-ray" style={{ animationDelay: `${i * 0.16}s` }}
            x1="32" y1="34" x2={n.x} y2={n.y} stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" opacity=".35" />
        ))}
        {/* noduri */}
        {nodes.map((n, i) => (
          <circle key={`n${i}`} className="ch-hub-node" style={{ animationDelay: `${i * 0.16}s` }}
            cx={n.x} cy={n.y} r="3.6" fill={ORANGE} />
        ))}
        {/* centru */}
        <circle className="ch-hub-core" cx="32" cy="34" r="8" fill={ORANGE} />
        <circle className="ch-hub-halo" cx="32" cy="34" r="8" stroke={ORANGE} strokeWidth="1.6" opacity="0" />
      </svg>
      <style>{`
        @keyframes chHubNode { 0%,100%{opacity:.45;r:3.2} 50%{opacity:1;r:4.2} }
        @keyframes chHubRay { 0%,100%{opacity:.2} 50%{opacity:.6} }
        @keyframes chHubHalo { 0%{opacity:.55;transform:scale(1)} 100%{opacity:0;transform:scale(1.9)} }
        .ch-hub-halo{transform-origin:32px 34px}
        @media (prefers-reduced-motion: no-preference){
          .ch-hub-node{animation:chHubNode 2.6s ease-in-out 3}
          .ch-hub-ray{animation:chHubRay 2.6s ease-in-out 3}
          .ch-hub-halo{animation:chHubHalo 2.6s ease-out 3}
        }
      `}</style>
    </span>
  );
}

/** PLANURI — pachet de carduri suprapuse; cel de sus se ridică și primește bifa */
export function IconPlanuri({ size = 60 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", flexShrink: 0 }} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect x="2" y="2" width="60" height="60" rx="17" fill={SOFT} stroke={BORDER} strokeWidth="1.5" />
        {/* cardul de jos */}
        <rect x="15" y="40" width="34" height="9" rx="4" fill={ORANGE} opacity=".28" />
        {/* cardul din mijloc */}
        <rect x="15" y="31" width="34" height="10" rx="4" fill={ORANGE} opacity=".5" />
        {/* cardul de sus — se ridica */}
        <g className="ch-plan-top">
          <rect x="15" y="20" width="34" height="12" rx="5" fill={ORANGE} />
          <path className="ch-plan-check" d="M25.5 26.2l3 3 6-6.4" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
      <style>{`
        @keyframes chPlanLift { 0%,100%{transform:translateY(0)} 45%{transform:translateY(-4px)} }
        @keyframes chPlanCheck { from{stroke-dashoffset:14} to{stroke-dashoffset:0} }
        .ch-plan-check{stroke-dasharray:14;stroke-dashoffset:0}
        @media (prefers-reduced-motion: no-preference){
          .ch-plan-top{animation:chPlanLift 3s ease-in-out 2}
          .ch-plan-check{animation:chPlanCheck .7s ease-in-out .35s both}
        }
      `}</style>
    </span>
  );
}

/** VENN — două cercuri cu intersecția care se aprinde („Deținem intersecția") */
export function IconIntersectie({ size = 60 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", flexShrink: 0 }} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <defs>
          <clipPath id="ch-clipL"><circle cx="26" cy="33" r="14" /></clipPath>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="17" fill={SOFT} stroke={BORDER} strokeWidth="1.5" />
        {/* cele doua cercuri */}
        <circle className="ch-venn-a" cx="26" cy="33" r="14" stroke={ORANGE} strokeWidth="2.6" />
        <circle className="ch-venn-b" cx="38" cy="33" r="14" stroke={ORANGE} strokeWidth="2.6" />
        {/* intersectia = cercul drept decupat de cel stang */}
        <g clipPath="url(#ch-clipL)">
          <circle className="ch-venn-fill" cx="38" cy="33" r="14" fill={ORANGE} />
        </g>
      </svg>
      <style>{`
        @keyframes chVennFill { from{opacity:0} to{opacity:1} }
        @keyframes chVennPulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        .ch-venn-fill{opacity:0}
        @media (prefers-reduced-motion: no-preference){
          .ch-venn-fill{animation:chVennFill 1s ease-in-out both}
          .ch-venn-a{animation:chVennPulse 3.4s ease-in-out 2}
          .ch-venn-b{animation:chVennPulse 3.4s ease-in-out .3s 2}
        }
        @media (prefers-reduced-motion: reduce){ .ch-venn-fill{opacity:1} }
      `}</style>
    </span>
  );
}

/** STELUȚĂ AI animată (twinkle) — folosită în Home (secțiunea AI) și pe pagina Instrumente AI */
export function SparkleAnim({ size = 38, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }} aria-hidden="true">
      {glow && <span style={{ position: "absolute", inset: -14, background: "radial-gradient(circle, rgba(255,107,0,.28), transparent 70%)", filter: "blur(8px)" }} />}
      <svg width={size} height={size} viewBox="0 0 24 24" fill={ORANGE} style={{ position: "relative" }}>
        <path className="ch-sp1" d="M12 1.6l1.75 6.9 6.9 1.75-6.9 1.75L12 18.9l-1.75-6.9L3.35 10.25l6.9-1.75z" style={{ transformOrigin: "12px 10.25px" }} />
        <path className="ch-sp2" d="M19 2.4l.7 2.55 2.55.7-2.55.7-.7 2.55-.7-2.55-2.55-.7 2.55-.7z" style={{ transformOrigin: "19px 5.65px" }} />
        <path className="ch-sp3" d="M5 15l.55 2 2 .55-2 .55L5 20.1l-.55-2-2-.55 2-.55z" style={{ transformOrigin: "5px 17.55px" }} />
      </svg>
      <style>{`
        @keyframes chSpMain { 0%,100%{transform:scale(1) rotate(0deg)} 50%{transform:scale(1.09) rotate(8deg)} }
        @keyframes chSpTwinkle { 0%,100%{opacity:.35;transform:scale(.75)} 50%{opacity:1;transform:scale(1.15)} }
        .ch-sp2{opacity:.75} .ch-sp3{opacity:.6}
        @media (prefers-reduced-motion: no-preference){
          .ch-sp1{animation:chSpMain 3s ease-in-out 3}
          .ch-sp2{animation:chSpTwinkle 2.2s ease-in-out 4}
          .ch-sp3{animation:chSpTwinkle 2.2s ease-in-out 1.1s 4}
        }
      `}</style>
    </span>
  );
}

/* ─────────── Forme reutilizabile ─────────── */
/** Persoană (cap + umeri) — pentru „pentru tine" */
const PERSON = (
  <g fill={ORANGE}>
    <circle cx="12" cy="8" r="6.4" />
    <path d="M-1 30c0-7.2 5.8-13 13-13s13 5.8 13 13z" />
  </g>
);
/** Labă de animal (4 degete + pernuță) — pentru „pentru animalul tău" */
const PAW = (
  <g fill={ORANGE}>
    <circle cx="4" cy="4" r="2.1" />
    <circle cx="11" cy="1.6" r="2.1" />
    <circle cx="17.5" cy="4.4" r="2.1" />
    <path d="M6 10a5.2 5.2 0 0 1 5.2 0c2.6 1.4 4 2.7 4 5.3a3.4 3.4 0 0 1-3.4 3.4H5.4A3.4 3.4 0 0 1 2 15.3c0-2.6 1.4-3.9 4-5.3z" />
  </g>
);

/** Ambii clienți — persoană + labă, cu accent alternativ (secțiunea Clienți) */
export function IconClienti({ size = 60 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", flexShrink: 0 }} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect x="2" y="2" width="60" height="60" rx="17" fill={SOFT} stroke={BORDER} strokeWidth="1.5" />
        {/* pozitionare fixa (fara animatie pe transform, ca sa nu "sara" glifele) */}
        <g transform="translate(7,18) scale(1.05)">
          <g className="ch-duo-a">{PERSON}</g>
        </g>
        <g transform="translate(33,16) scale(1.35)">
          <g className="ch-duo-b">{PAW}</g>
        </g>
      </svg>
      <style>{`
        @keyframes chDuoFade { 0%,100%{opacity:.4} 50%{opacity:1} }
        .ch-duo-a, .ch-duo-b { opacity: 1; }
        @media (prefers-reduced-motion: no-preference){
          .ch-duo-a{animation:chDuoFade 3.2s ease-in-out 3}
          .ch-duo-b{animation:chDuoFade 3.2s ease-in-out 3 reverse}
        }
      `}</style>
    </span>
  );
}

/** Foarfecă animată (lamele taie) — secțiunea Parteneri / saloane */
export function IconFoarfeca({ size = 60 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", flexShrink: 0 }} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect x="2" y="2" width="60" height="60" rx="17" fill={SOFT} stroke={BORDER} strokeWidth="1.5" />
        {/* lama sus-stanga -> jos-dreapta */}
        <g className="ch-blade-1" style={{ transformOrigin: "32px 34px" }}>
          <line x1="19" y1="15" x2="42" y2="38" stroke={ORANGE} strokeWidth="3" strokeLinecap="round" />
          <circle cx="45" cy="43" r="5.5" stroke={ORANGE} strokeWidth="3" />
        </g>
        {/* lama sus-dreapta -> jos-stanga */}
        <g className="ch-blade-2" style={{ transformOrigin: "32px 34px" }}>
          <line x1="45" y1="15" x2="22" y2="38" stroke={ORANGE} strokeWidth="3" strokeLinecap="round" />
          <circle cx="19" cy="43" r="5.5" stroke={ORANGE} strokeWidth="3" />
        </g>
        {/* nit central */}
        <circle cx="32" cy="30" r="2.4" fill={ORANGE} />
        {/* scantei la taiere */}
        <g className="ch-snip">
          <path d="M32 16.5v-4M25.5 18l-2.5-3M38.5 18l2.5-3" stroke={ORANGE} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      </svg>
      <style>{`
        @keyframes chBlade1 { 0%,100%{transform:rotate(0deg)} 45%{transform:rotate(-13deg)} 70%{transform:rotate(2deg)} }
        @keyframes chBlade2 { 0%,100%{transform:rotate(0deg)} 45%{transform:rotate(13deg)} 70%{transform:rotate(-2deg)} }
        @keyframes chSnip { 0%,60%{opacity:0;transform:scale(.6)} 72%{opacity:.9;transform:scale(1)} 100%{opacity:0;transform:scale(1.15)} }
        .ch-snip{transform-origin:32px 16px}
        @media (prefers-reduced-motion: no-preference){
          .ch-blade-1{animation:chBlade1 3.4s ease-in-out 2}
          .ch-blade-2{animation:chBlade2 3.4s ease-in-out 2}
          .ch-snip{animation:chSnip 3.4s ease-out 2}
        }
        @media (prefers-reduced-motion: reduce){ .ch-snip{opacity:0} }
      `}</style>
    </span>
  );
}

/** Calendar cu bifă care se desenează — „rezervare confirmată" (secțiunea Clienți) */
export function IconRezervare({ size = 56 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", flexShrink: 0 }} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect x="2" y="2" width="60" height="60" rx="17" fill={SOFT} stroke={BORDER} strokeWidth="1.5" />
        {/* corp calendar */}
        <rect className="ch-cal-body" x="16" y="18" width="32" height="30" rx="6" stroke={ORANGE} strokeWidth="2.6" />
        <path d="M16 27h32" stroke={ORANGE} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M24 14v7M40 14v7" stroke={ORANGE} strokeWidth="2.6" strokeLinecap="round" />
        {/* bifa care se deseneaza */}
        <path className="ch-cal-check" d="M24 38.5l5.5 5.5L41 32.5" stroke={ORANGE} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        {/* puls */}
        <circle className="ch-cal-pulse" cx="32" cy="33" r="15" stroke={ORANGE} strokeWidth="1.6" opacity="0" />
      </svg>
      <style>{`
        @keyframes chCalDraw { from{stroke-dashoffset:26} to{stroke-dashoffset:0} }
        @keyframes chCalPulse { 0%{opacity:0;transform:scale(.72)} 45%{opacity:.5;transform:scale(1)} 100%{opacity:0;transform:scale(1.25)} }
        .ch-cal-check{stroke-dasharray:26;stroke-dashoffset:26}
        .ch-cal-pulse{transform-origin:32px 33px}
        @media (prefers-reduced-motion: no-preference){
          .ch-cal-check{animation:chCalDraw .85s ease-in-out both}
          .ch-cal-pulse{animation:chCalPulse 1.1s ease-out .5s both}
        }
        @media (prefers-reduced-motion: reduce){ .ch-cal-check{stroke-dashoffset:0} }
      `}</style>
    </span>
  );
}

/** Bare care cresc + linie ascendentă — „agendă plină, business în creștere" (secțiunea Parteneri) */
export function IconCrestere({ size = 56 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", flexShrink: 0 }} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect x="2" y="2" width="60" height="60" rx="17" fill={SOFT} stroke={BORDER} strokeWidth="1.5" />
        {/* baza */}
        <path d="M16 50h32" stroke={ORANGE} strokeWidth="2.4" strokeLinecap="round" opacity=".4" />
        {/* bare care cresc (in sus, de la linia de baza y=50) */}
        <rect className="ch-bar b1" x="18" y="41" width="7" height="9" rx="2.5" fill={ORANGE} opacity=".5" />
        <rect className="ch-bar b2" x="28.5" y="36" width="7" height="14" rx="2.5" fill={ORANGE} opacity=".72" />
        <rect className="ch-bar b3" x="39" y="31" width="7" height="19" rx="2.5" fill={ORANGE} />
        {/* trend ascendent deasupra barelor + varf sageata */}
        <path className="ch-trend" d="M18 28l9-6 6 4 11-9" stroke={ORANGE} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path className="ch-trend-tip" d="M38.5 17H45v6.5" stroke={ORANGE} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <style>{`
        @keyframes chBarGrow { from{transform:scaleY(0)} to{transform:scaleY(1)} }
        @keyframes chTrendDraw { from{stroke-dashoffset:40} to{stroke-dashoffset:0} }
        @keyframes chTipIn { from{opacity:0} to{opacity:1} }
        .ch-bar{transform-origin:50% 50px}
        .ch-trend{stroke-dasharray:40;stroke-dashoffset:0}
        @media (prefers-reduced-motion: no-preference){
          .ch-bar{animation:chBarGrow .8s cubic-bezier(.2,.8,.3,1) both}
          .ch-bar.b2{animation-delay:.12s}
          .ch-bar.b3{animation-delay:.24s}
          .ch-trend{animation:chTrendDraw 1s ease-in-out .3s both}
          .ch-trend-tip{animation:chTipIn .4s ease-out 1.2s both}
        }
      `}</style>
    </span>
  );
}
