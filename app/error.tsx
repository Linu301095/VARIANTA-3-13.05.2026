"use client";

import { useEffect } from "react";
import EcranEroare from "../components/EcranEroare";

/** Erorile din paginile publice: Home, conectare, înregistrare, wizardul salonului. */
export default function EroarePublica({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Eroare în pagină:", error); }, [error]);
  return <EcranEroare error={error} reset={reset} />;
}
