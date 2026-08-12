"use client";

import { useEffect } from "react";
import EcranEroare from "../../components/EcranEroare";

/** Erorile din conturi: client, salon, admin. */
export default function EroareDashboard({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Eroare în dashboard:", error); }, [error]);
  return <EcranEroare error={error} reset={reset} inapoiLa="/dashboard/client" inapoiText="Înapoi la saloane" />;
}
