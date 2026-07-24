"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock, CheckCircle2, FileText, ChevronRight, Trash2,
  Send, XCircle,
} from "lucide-react";
import type { Email } from "@/types/database";

interface EmailCardProps {
  email: Email;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  draft: {
    label: "Brouillon",
    icon: Clock,
    color: "oklch(75% 0.16 70)",
    bg: "oklch(75% 0.16 70 / 0.1)",
    border: "oklch(75% 0.16 70 / 0.3)",
  },
  completed: {
    label: "Finalisé",
    icon: CheckCircle2,
    color: "oklch(67% 0.17 145)",
    bg: "oklch(67% 0.17 145 / 0.1)",
    border: "oklch(67% 0.17 145 / 0.3)",
  },
};

/** Badge secondaire pour le statut d'envoi SMTP */
const sendStatusConfig = {
  sent: {
    label: "Envoyé",
    icon: Send,
    color: "oklch(67% 0.17 145)",
    bg: "oklch(67% 0.17 145 / 0.08)",
    border: "oklch(67% 0.17 145 / 0.25)",
  },
  failed: {
    label: "Échec envoi",
    icon: XCircle,
    color: "oklch(65% 0.25 25)",
    bg: "oklch(65% 0.25 25 / 0.08)",
    border: "oklch(65% 0.25 25 / 0.25)",
  },
  draft: null,
};

export default function EmailCard({ email, onDelete }: EmailCardProps) {
  const status = statusConfig[email.status];
  const StatusIcon = status.icon;

  const sendBadge =
    email.send_status && email.send_status !== "draft"
      ? sendStatusConfig[email.send_status]
      : null;

  const displayMessage = email.message ?? "";
  const preview = displayMessage.slice(0, 120).trim();

  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(email.created_at));

  const formattedSentAt =
    email.sent_at
      ? new Intl.DateTimeFormat("fr-FR", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(email.sent_at))
      : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="card-gold rounded-xl p-5 group relative flex flex-col gap-3"
    >
      {/* En-tête */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "oklch(72% 0.15 85 / 0.1)" }}
          >
            <FileText size={15} style={{ color: "oklch(72% 0.15 85)" }} />
          </div>
          <h3 className="font-semibold text-base-content text-sm truncate">
            {email.subject || "Sans objet"}
          </h3>
        </div>

        {/* Badge statut principal */}
        <span
          className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full shrink-0"
          style={{
            color: status.color,
            background: status.bg,
            border: `1px solid ${status.border}`,
          }}
        >
          <StatusIcon size={11} />
          {status.label}
        </span>
      </div>

      {/* Badge statut envoi (si applicable) */}
      {sendBadge && (
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              color: sendBadge.color,
              background: sendBadge.bg,
              border: `1px solid ${sendBadge.border}`,
            }}
          >
            <sendBadge.icon size={10} />
            {sendBadge.label}
          </span>
          {email.recipient_email && (
            <span className="text-xs text-base-content/35 truncate max-w-[140px]">
              → {email.recipient_email}
            </span>
          )}
        </div>
      )}

      {/* Aperçu message */}
      <div className="space-y-1">
        <p className="text-sm text-base-content/50 leading-relaxed line-clamp-2">
          {preview || "Aucun contenu"}
          {displayMessage.length > 120 && "…"}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <div className="space-y-0.5">
          <span className="text-xs text-base-content/35 block">{formattedDate}</span>
          {formattedSentAt && (
            <span className="text-xs block" style={{ color: "oklch(67% 0.17 145 / 0.6)" }}>
              Envoyé le {formattedSentAt}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDelete && (
            <button
              id={`btn-delete-${email.id}`}
              onClick={(e) => {
                e.preventDefault();
                onDelete(email.id);
              }}
              className="btn btn-ghost btn-xs btn-square text-base-content/30 hover:text-error"
              title="Supprimer"
            >
              <Trash2 size={13} />
            </button>
          )}

          <Link
            href={`/dashboard/new?edit=${email.id}`}
            id={`btn-open-${email.id}`}
            className="btn btn-ghost btn-xs gap-1 font-medium"
            style={{ color: "oklch(72% 0.15 85)" }}
          >
            Ouvrir
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
