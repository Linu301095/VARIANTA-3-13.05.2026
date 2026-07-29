const ORANGE = "#FF6B00";
const SOFT = "#FFF3EA";
const BORDER = "#FFDCC6";

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
          .ch-duo-a{animation:chDuoFade 3.2s ease-in-out infinite}
          .ch-duo-b{animation:chDuoFade 3.2s ease-in-out infinite reverse}
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
          .ch-blade-1{animation:chBlade1 3.4s ease-in-out infinite}
          .ch-blade-2{animation:chBlade2 3.4s ease-in-out infinite}
          .ch-snip{animation:chSnip 3.4s ease-out infinite}
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
        @keyframes chCalDraw { 0%{stroke-dashoffset:26} 55%{stroke-dashoffset:0} 92%{stroke-dashoffset:0} 100%{stroke-dashoffset:26} }
        @keyframes chCalPulse { 0%,55%{opacity:0;transform:scale(.72)} 70%{opacity:.5;transform:scale(1)} 100%{opacity:0;transform:scale(1.25)} }
        .ch-cal-check{stroke-dasharray:26;stroke-dashoffset:26}
        .ch-cal-pulse{transform-origin:32px 33px}
        @media (prefers-reduced-motion: no-preference){
          .ch-cal-check{animation:chCalDraw 3.6s ease-in-out infinite}
          .ch-cal-pulse{animation:chCalPulse 3.6s ease-out infinite}
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
        @keyframes chBarGrow { 0%{transform:scaleY(0)} 45%{transform:scaleY(1)} 88%{transform:scaleY(1)} 100%{transform:scaleY(0)} }
        @keyframes chTrendDraw { 0%{stroke-dashoffset:40} 50%{stroke-dashoffset:0} 90%{stroke-dashoffset:0} 100%{stroke-dashoffset:40} }
        @keyframes chTipIn { 0%,42%{opacity:0} 58%{opacity:1} 92%{opacity:1} 100%{opacity:0} }
        .ch-bar{transform-origin:50% 50px}
        .ch-trend{stroke-dasharray:40;stroke-dashoffset:0}
        @media (prefers-reduced-motion: no-preference){
          .ch-bar{animation:chBarGrow 3.8s ease-in-out infinite}
          .ch-bar.b2{animation-delay:.12s}
          .ch-bar.b3{animation-delay:.24s}
          .ch-trend{animation:chTrendDraw 3.8s ease-in-out infinite}
          .ch-trend-tip{animation:chTipIn 3.8s ease-in-out infinite}
        }
      `}</style>
    </span>
  );
}
