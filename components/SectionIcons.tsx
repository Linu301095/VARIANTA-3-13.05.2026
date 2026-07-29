const ORANGE = "#FF6B00";
const SOFT = "#FFF3EA";
const BORDER = "#FFDCC6";

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
