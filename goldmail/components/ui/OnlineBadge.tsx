"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OnlineBadge() {
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      {isOnline ? (
        <motion.div
          key="online"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: "oklch(67% 0.17 145 / 0.12)",
            color: "oklch(67% 0.17 145)",
            border: "1px solid oklch(67% 0.17 145 / 0.25)",
          }}
          title="Toutes les fonctions locales marchent hors ligne (sauf l'envoi SMTP)"
        >
          <Wifi size={12} />
          <span>En ligne</span>
        </motion.div>
      ) : (
        <motion.div
          key="offline"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: "oklch(75% 0.16 70 / 0.15)",
            color: "oklch(75% 0.16 70)",
            border: "1px solid oklch(75% 0.16 70 / 0.3)",
          }}
          title="Mode 100% hors ligne — écriture/lecture SQLite locale active"
        >
          <WifiOff size={12} />
          <span>Hors ligne</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
