"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSetting, setSetting } from "@/lib/db/settings";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"gold-dark" | "gold-light">("gold-dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lire le thème sauvegardé
    getSetting("theme").then((savedTheme) => {
      if (savedTheme === "gold-light" || savedTheme === "gold-dark") {
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
      } else {
        // Défaut gold-dark
        document.documentElement.setAttribute("data-theme", "gold-dark");
      }
    });
  }, []);

  const toggleTheme = async () => {
    const nextTheme = theme === "gold-dark" ? "gold-light" : "gold-dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    await setSetting("theme", nextTheme);
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-base-300/40 animate-pulse" />
    );
  }

  return (
    <button
      id="btn-theme-toggle"
      type="button"
      onClick={toggleTheme}
      className="btn btn-ghost btn-sm btn-square relative overflow-hidden"
      title={`Passer en mode ${theme === "gold-dark" ? "clair" : "sombre"}`}
      aria-label="Basculer le thème"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "gold-dark" ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <Sun size={18} style={{ color: "oklch(72% 0.15 85)" }} />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <Moon size={18} className="text-base-content" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
