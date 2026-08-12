"use client";

import { useEffect } from "react";
import EcranEroare from "../components/EcranEroare";

/**
 * Ultima plasă: se aprinde când crapă însuși scheletul aplicației, adică
 * `app/layout.tsx`. Fiind deasupra layout-ului, trebuie să-și scrie singură
 * `<html>` și `<body>` — de asta nu poate refolosi nici fonturile, nici temele.
 */
export default function EroareGlobala({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Eroare globală:", error); }, [error]);
  return (
    <html lang="ro">
      <body style={{ margin: 0 }}>
        <EcranEroare error={error} reset={reset} />
      </body>
    </html>
  );
}
