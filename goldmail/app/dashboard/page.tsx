"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Mail, Inbox, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getEmails, deleteEmail } from "@/lib/db/emails";
import type { Email } from "@/types/database";

export default function DashboardPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getEmails()
      .then(setEmails)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await deleteEmail(id);
    setEmails((prev) => prev.filter((e) => e.id !== id));
    setDeleting(null);
  };

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const total = emails.length;
  const completed = emails.filter((e) => e.status === "completed").length;
  const drafts = emails.filter((e) => e.status === "draft").length;
  const sent = emails.filter((e) => e.send_status === "sent").length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Mes emails</h1>
          <p className="text-sm text-base-content/50 mt-1">
            {loading
              ? "Chargement…"
              : emails.length > 0
              ? `${emails.length} email${emails.length > 1 ? "s" : ""} créé${emails.length > 1 ? "s" : ""}`
              : "Aucun email pour le moment"}
          </p>
        </div>

        <Link
          href="/dashboard/new"
          id="btn-new-email"
          className="btn gap-2 font-semibold shrink-0 sm:w-auto w-full"
          style={{
            backgroundColor: "oklch(72% 0.15 85)",
            color: "oklch(12% 0.02 85)",
            border: "none",
          }}
        >
          <Plus size={16} />
          Nouvel email
        </Link>
      </div>

      {/* Ligne dorée */}
      <div className="divider-gold" />

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg" style={{ color: "oklch(72% 0.15 85)" }} />
        </div>
      ) : emails.length === 0 ? (
        /* État vide */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: "oklch(72% 0.15 85 / 0.08)" }}
          >
            <Inbox size={36} style={{ color: "oklch(72% 0.15 85 / 0.5)" }} />
          </div>
          <h2 className="text-xl font-semibold text-base-content mb-2">
            Aucun email créé
          </h2>
          <p className="text-sm text-base-content/50 mb-8 max-w-sm">
            Commencez par créer votre premier email professionnel avec le wizard GoldMail.
          </p>
          <Link
            href="/dashboard/new"
            className="btn gap-2 font-semibold"
            style={{
              backgroundColor: "oklch(72% 0.15 85)",
              color: "oklch(12% 0.02 85)",
              border: "none",
            }}
          >
            <Plus size={16} />
            Créer mon premier email
          </Link>
        </div>
      ) : (
        <>
          {/* Stats rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total", value: total, icon: Mail },
              { label: "Finalisés", value: completed, icon: Mail },
              { label: "Brouillons", value: drafts, icon: Mail },
              { label: "Envoyés", value: sent, icon: Mail },
            ].map((stat) => (
              <div key={stat.label} className="card-gold rounded-xl p-4">
                <p className="text-2xl font-bold text-base-content">{stat.value}</p>
                <p className="text-xs text-base-content/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Liste emails */}
          <AnimatePresence initial={false}>
            <div className="space-y-3">
              {emails.map((email) => (
                <motion.div
                  key={email.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, height: 0 }}
                  className="card-gold rounded-xl p-4 flex items-start gap-4"
                >
                  {/* Icône statut */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background:
                        email.send_status === "sent"
                          ? "oklch(67% 0.17 145 / 0.12)"
                          : email.status === "completed"
                          ? "oklch(72% 0.15 85 / 0.1)"
                          : "oklch(25% 0.015 285)",
                    }}
                  >
                    <Mail
                      size={16}
                      style={{
                        color:
                          email.send_status === "sent"
                            ? "oklch(67% 0.17 145)"
                            : email.status === "completed"
                            ? "oklch(72% 0.15 85)"
                            : "oklch(55% 0.008 285)",
                      }}
                    />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-base-content truncate">
                      {email.subject || "(Sans objet)"}
                    </p>
                    <p className="text-xs text-base-content/50 mt-0.5 truncate">
                      {email.message?.slice(0, 80) || "—"}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-base-content/40">
                        {formatDate(email.created_at)}
                      </span>
                      {email.send_status === "sent" && email.recipient_email && (
                        <span className="text-xs text-success">
                          → {email.recipient_email}
                        </span>
                      )}
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-medium"
                        style={{
                          background:
                            email.send_status === "sent"
                              ? "oklch(67% 0.17 145 / 0.12)"
                              : email.status === "draft"
                              ? "oklch(25% 0.015 285)"
                              : "oklch(72% 0.15 85 / 0.1)",
                          color:
                            email.send_status === "sent"
                              ? "oklch(67% 0.17 145)"
                              : email.status === "draft"
                              ? "oklch(55% 0.008 285)"
                              : "oklch(72% 0.15 85)",
                        }}
                      >
                        {email.send_status === "sent"
                          ? "Envoyé"
                          : email.status === "draft"
                          ? "Brouillon"
                          : "Finalisé"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/dashboard/new?edit=${email.id}`}
                      className="btn btn-ghost btn-xs"
                      title="Modifier"
                    >
                      Éditer
                    </Link>
                    <button
                      onClick={() => handleDelete(email.id)}
                      disabled={deleting === email.id}
                      className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                      title="Supprimer"
                    >
                      {deleting === email.id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
