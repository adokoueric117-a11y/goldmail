"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  PenLine,
  FileText,
  Settings,
  HardDrive,
} from "lucide-react";
import GoldLogo from "@/components/ui/GoldLogo";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/dashboard/new", icon: Plus, label: "Nouvel email", exact: false },
  { href: "/dashboard/documents", icon: FileText, label: "Documents", exact: false },
  { href: "/dashboard/signatures", icon: PenLine, label: "Signatures", exact: false },
  { href: "/dashboard/settings", icon: Settings, label: "Paramètres", exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-base-300 bg-base-200">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-base-300 flex items-center justify-between">
        <GoldLogo size={26} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group"
              style={{
                color: active ? "oklch(72% 0.15 85)" : "var(--color-base-content)",
                background: active ? "oklch(72% 0.15 85 / 0.1)" : "transparent",
              }}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: "oklch(72% 0.15 85 / 0.1)" }}
                  transition={{ type: "spring", duration: 0.35 }}
                />
              )}
              <Icon
                size={17}
                className="relative z-10 shrink-0"
                style={{ color: active ? "oklch(72% 0.15 85)" : "oklch(55% 0.008 285)" }}
              />
              <span className="relative z-10 font-medium">{item.label}</span>
              {item.href === "/dashboard/new" && (
                <span
                  className="relative z-10 ml-auto text-xs px-1.5 py-0.5 rounded font-bold"
                  style={{
                    background: "oklch(72% 0.15 85 / 0.15)",
                    color: "oklch(72% 0.15 85)",
                  }}
                >
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="px-4 py-4 border-t border-base-300 flex items-center gap-2 text-xs text-base-content/50">
        <HardDrive size={14} className="text-gold shrink-0" />
        <span>SQLite Local (Offline First)</span>
      </div>
    </aside>
  );
}
