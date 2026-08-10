/**
 * Silueta de bărbat sau de damă, decupată chiar din logo.
 *
 * Sunt exact formele din `logo-semn.png` — nu desene noi — ca salutul din
 * dashboard să vorbească aceeași limbă vizuală cu marca. Fișierele păstrează
 * doar transparența, iar culoarea vine din CSS (`mask-image`), deci silueta se
 * poate colora după temă fără să avem două poze pentru fiecare.
 */

const FORME = {
  masculin: { src: "/silueta-barbat.png", w: 63, h: 83 },
  feminin: { src: "/silueta-dama.png", w: 61, h: 87 },
} as const;

export default function SiluetaGen({
  gen,
  size = 26,
  culoare = "#FF6B00",
  style,
}: {
  gen: "masculin" | "feminin";
  /** Înălțimea siluetei în px; lățimea se calculează din proporție. */
  size?: number;
  culoare?: string;
  style?: React.CSSProperties;
}) {
  const f = FORME[gen];
  const lat = Math.round((size * f.w) / f.h);
  const masca = `url(${f.src}) no-repeat center / contain`;

  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block", width: lat, height: size, flexShrink: 0,
        background: culoare,
        WebkitMask: masca, mask: masca,
        ...style,
      }}
    />
  );
}
