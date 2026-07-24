"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, FileCode, FileText, AlignLeft } from "lucide-react";
import { generateSignatureHtml } from "@/components/signatures/SignaturePreview";
import type { Signature, Profile } from "@/types/database";

interface ExportPanelProps {
  subject: string;
  message: string;  // message amélioré si dispo, sinon brut
  signature?: Signature | null;
  profile?: Profile | null;
}

type CopyState = Record<string, boolean>;

export default function ExportPanel({
  subject,
  message,
  signature,
  profile,
}: ExportPanelProps) {
  const [copied, setCopied] = useState<CopyState>({});

  const sigHtml = signature && profile
    ? generateSignatureHtml(
        signature.template_id,
        {
          full_name: profile.full_name,
          job_title: profile.job_title,
          company: profile.company,
          phone: profile.phone,
          logo_base64: profile.logo_base64,
        },
        (signature.socials as Record<string, string>) ?? {}
      )
    : "";

  // ─── Exports ─────────────────────────────────────────────────────────────
  const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#333;max-width:640px;margin:0 auto;">
<h2 style="font-size:16px;color:#111;">${subject}</h2>
<div style="white-space:pre-line;line-height:1.7;">${message}</div>
${sigHtml ? `<br/><hr style="border:none;border-top:1px solid #eee;margin:16px 0;"/>${sigHtml}` : ""}
</body>
</html>`;

  const plainText = `Objet : ${subject}\n\n${message}`;

  const bodyOnly = message;

  const doCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 2000);
    } catch {
      console.error("Clipboard copy failed");
    }
  };

  const exports = [
    {
      key: "html",
      label: "Copier HTML complet",
      desc: "Prêt à coller dans un client email HTML",
      icon: FileCode,
      content: fullHtml,
    },
    {
      key: "plain",
      label: "Copier texte brut",
      desc: "Objet + corps sans formatage",
      icon: AlignLeft,
      content: plainText,
    },
    {
      key: "body",
      label: "Copier le message seul",
      desc: "Corps de l'email uniquement",
      icon: FileText,
      content: bodyOnly,
    },
  ];

  return (
    <div className="space-y-3">
      {exports.map(({ key, label, desc, icon: Icon, content }) => (
        <div
          key={key}
          className="flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors"
          style={{ borderColor: "oklch(25% 0.015 285)", background: "oklch(17% 0.012 285)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "oklch(72% 0.15 85 / 0.1)" }}
            >
              <Icon size={15} style={{ color: "oklch(72% 0.15 85)" }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-base-content">{label}</p>
              <p className="text-xs text-base-content/40 truncate">{desc}</p>
            </div>
          </div>

          <button
            id={`btn-copy-${key}`}
            onClick={() => doCopy(key, content)}
            className="btn btn-sm gap-1.5 shrink-0 font-medium transition-all"
            style={
              copied[key]
                ? {
                    backgroundColor: "oklch(67% 0.17 145 / 0.15)",
                    color: "oklch(67% 0.17 145)",
                    border: "1px solid oklch(67% 0.17 145 / 0.3)",
                  }
                : {
                    backgroundColor: "oklch(72% 0.15 85 / 0.12)",
                    color: "oklch(72% 0.15 85)",
                    border: "1px solid oklch(72% 0.15 85 / 0.25)",
                  }
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied[key] ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1"
                >
                  <Check size={13} />
                  Copié !
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1"
                >
                  <Copy size={13} />
                  Copier
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      ))}
    </div>
  );
}
