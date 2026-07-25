"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  Plus,
  PenLine,
  FileText,
  Settings,
} from "lucide-react";
import GoldLogo from "@/components/ui/GoldLogo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import OnlineBadge from "@/components/ui/OnlineBadge";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/dashboard/new", icon: Plus, label: "Nouvel email", exact: false },
  { href: "/dashboard/documents", icon: FileText, label: "Documents", exact: false },
  { href: "/dashboard/signatures", icon: PenLine, label: "Signatures", exact: false },
  { href: "/dashboard/settings", icon: Settings, label: "Paramètres", exact: false },
];

interface TopbarProps {
  title?: string;
}

export default function Topbar({ title }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 h-14 border-b border-base-300 bg-base-200/90 backdrop-blur-sm">
        {/* Logo mobile */}
        <div className="lg:hidden">
          <GoldLogo size={22} />
        </div>

        {/* Titre (desktop) */}
        {title && (
          <h1 className="hidden lg:block text-sm font-semibold text-base-content/70">
            {title}
          </h1>
        )}

        <div className="flex items-center gap-3 ml-auto">
          {/* Badge réseau */}
          <OnlineBadge />

          {/* Toggle Thème */}
          <ThemeToggle />

          <span className="hidden sm:block text-xs font-semibold text-gold px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20">
            GoldMail
          </span>

          {/* Bouton menu mobile */}
          <button
            id="btn-mobile-menu"
            className="lg:hidden btn btn-ghost btn-sm btn-square"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* CTA Nouvel email (desktop) */}
          <Link
            href="/dashboard/new"
            id="btn-new-email-topbar"
            className="hidden lg:flex btn btn-sm gap-1.5 font-semibold"
            style={{
              backgroundColor: "oklch(72% 0.15 85)",
              color: "oklch(12% 0.02 85)",
              border: "none",
            }}
          >
            <Plus size={14} />
            Nouvel email
          </Link>
        </div>
      </header>

      {/* Menu mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-base-100/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-72 bg-base-200 border-l border-base-300 flex flex-col lg:hidden"
            >
              <div className="px-5 py-5 border-b border-base-300 flex items-center justify-between">
                <GoldLogo size={24} />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-ghost btn-sm btn-square"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors"
                      style={{
                        color: active ? "oklch(72% 0.15 85)" : "var(--color-base-content)",
                        background: active ? "oklch(72% 0.15 85 / 0.1)" : "transparent",
                      }}
                    >
                      <Icon
                        size={17}
                        style={{ color: active ? "oklch(72% 0.15 85)" : "oklch(55% 0.008 285)" }}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
