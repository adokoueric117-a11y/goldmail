"use client";

import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("[SW] Service Worker enregistré avec succès, scope:", reg.scope))
        .catch((err) => console.error("[SW] Échec enregistrement Service Worker:", err));
    }
  }, []);

  return null;
}
