import Image from "next/image";
import Link from "next/link";

/**
 * Logo-ul CalyHub, adaptat automat la tema.
 * Randam ambele variante si comutam din CSS (`.logo-light` / `.logo-dark` in globals.css),
 * ca sa functioneze si in server components, fara flash la incarcare.
 */
export default function Logo({ h = 44, priority = false }: { h?: number; priority?: boolean }) {
  const style: React.CSSProperties = { height: h, width: "auto", objectFit: "contain" };
  // logo-ul e practic patrat (1136x1138) — pastram raportul ca sa nu-l deformam
  const w = h;
  return (
    <Link href="/" aria-label="CalyHub — pagina principală" style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
      <Image className="logo-light" src="/logo.png" alt="CalyHub" width={w} height={h} style={style} priority={priority} />
      <Image className="logo-dark" src="/logo-dark.png" alt="CalyHub" width={w} height={h} style={style} priority={priority} />
    </Link>
  );
}
