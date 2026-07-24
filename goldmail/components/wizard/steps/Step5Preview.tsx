"use client";

import { useEffect, useState, useTransition } from "react";
import {
  ChevronLeft, Check, Send, AlertCircle, Mail,
  CheckCircle2, Loader2, WifiOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSignatures } from "@/lib/db/signatures";
import { getProfile } from "@/lib/db/profile";
import { createEmail, updateEmail, finalizeEmail, markEmailSent } from "@/lib/db/emails";
import SignaturePreview, { generateSignatureHtml } from "@/components/signatures/SignaturePreview";
import ExportPanel from "@/components/wizard/ExportPanel";
import type { WizardState, Signature, Profile } from "@/types/database";
import { useRouter } from "next/navigation";

interface Step5PreviewProps {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  onBack: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Assemble le HTML complet de l'email (message + signature inline) */
function buildEmailHtml(
  subject: string,
  message: string,
  signature: Signature | null,
  profile: Profile | null
): string {
  const sigHtml =
    signature && profile
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

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Corps du message -->
          <tr>
            <td style="padding:0 0 24px 0;font-size:15px;line-height:1.75;color:#1a1a1a;white-space:pre-line;">
              ${message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}
            </td>
          </tr>
          ${sigHtml
            ? `<!-- Séparateur -->
          <tr>
            <td style="padding:16px 0;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#C9A227,transparent);"></div>
            </td>
          </tr>
          <!-- Signature -->
          <tr>
            <td style="padding:8px 0 0 0;">
              ${sigHtml}
            </td>
          </tr>`
            : ""}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default function Step5Preview({
  state,
  onChange,
  onBack,
}: Step5PreviewProps) {
  const [signature, setSignature] = useState<Signature | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Save state
  const [saved, setSaved] = useState(false);
  const [isSaving, startSaving] = useTransition();

  // Send state
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [isSending, startSending] = useTransition();

  const router = useRouter();
  const finalMessage = state.rawMessage;
  const recipientEmail = state.recipientEmail ?? "";
  const isEmailValid = EMAIL_REGEX.test(recipientEmail.trim());
  const canSend = isEmailValid && finalMessage.trim().length > 0 && !sendSuccess && isOnline;

  // Détection de connexion réseau
  useEffect(() => {
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

  useEffect(() => {
    async function loadData() {
      const [sigs, prof] = await Promise.all([getSignatures(), getProfile()]);
      setProfile(prof);
      if (state.signatureId) {
        const found = sigs.find((s) => s.id === state.signatureId);
        setSignature(found ?? null);
      }
      setLoading(false);
    }
    loadData();
  }, [state.signatureId]);

  const profileData = {
    full_name: profile?.full_name,
    job_title: profile?.job_title,
    company: profile?.company,
    phone: profile?.phone,
    logo_base64: profile?.logo_base64 || state.logoBase64,
  };

  // ─── Finaliser (enregistrer dans le dashboard) ────────────────────────────
  const handleFinalize = () => {
    startSaving(async () => {
      if (state.savedEmailId) {
        await updateEmail(state.savedEmailId, { ...state, savedEmailId: state.savedEmailId });
        await finalizeEmail(state.savedEmailId);
      } else {
        const { id } = await createEmail(state);
        if (id) {
          onChange({ savedEmailId: id });
          await finalizeEmail(id);
        }
      }
      setSaved(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    });
  };

  // ─── Envoi réel par email via SMTP ────────────────────────────────────────
  const handleSend = () => {
    if (!isOnline) {
      setSendError("Connexion requise pour envoyer. Vous êtes actuellement hors ligne.");
      return;
    }
    if (!canSend) return;
    setSendError(null);

    startSending(async () => {
      let emailId = state.savedEmailId;
      if (!emailId) {
        const { id } = await createEmail(state);
        if (id) {
          emailId = id;
          onChange({ savedEmailId: id });
        }
      } else {
        await updateEmail(emailId, state);
      }

      const htmlBody = buildEmailHtml(
        state.subject,
        finalMessage,
        signature,
        profile
      );

      try {
        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientEmail: recipientEmail.trim(),
            subject: state.subject || "(Sans objet)",
            htmlBody,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          const errMsg = data.error ?? "Erreur lors de l'envoi.";
          setSendError(errMsg);
          if (emailId) await markEmailSent(emailId, recipientEmail.trim(), "failed");
          return;
        }

        setSendSuccess(true);
        setSendError(null);
        if (emailId) await markEmailSent(emailId, recipientEmail.trim(), "sent");
        if (emailId) await finalizeEmail(emailId);
        setTimeout(() => router.push("/dashboard"), 2000);
      } catch {
        setSendError("Erreur réseau — vérifiez votre connexion Internet.");
        if (emailId) await markEmailSent(emailId, recipientEmail.trim(), "failed");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-base-content mb-1">
          Aperçu final &amp; Envoi
        </h2>
        <p className="text-sm text-base-content/50">
          Vérifiez votre email, copiez-le ou envoyez-le directement.
        </p>
      </div>

      {/* Bandeau hors ligne */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg text-sm font-medium"
            style={{
              background: "oklch(75% 0.16 70 / 0.1)",
              border: "1px solid oklch(75% 0.16 70 / 0.3)",
              color: "oklch(75% 0.16 70)",
            }}
          >
            <WifiOff size={15} />
            Vous êtes hors ligne. L&apos;envoi sera disponible dès votre reconnexion.
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-12">
          <span
            className="loading loading-spinner loading-md"
            style={{ color: "oklch(72% 0.15 85)" }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Email Preview */}
          <div className="card-gold rounded-xl overflow-hidden border border-base-300">
            {/* Header */}
            <div className="bg-base-300/40 p-4 border-b border-base-300 space-y-2">
              <div className="flex items-center gap-2 text-xs text-base-content/60">
                <span className="font-semibold text-base-content/80">Objet :</span>
                <span className="font-medium text-base-content">{state.subject}</span>
              </div>
              {state.recipientContext && (
                <div className="flex items-center gap-2 text-xs text-base-content/40">
                  <span className="font-medium">Contexte :</span>
                  <span>{state.recipientContext}</span>
                </div>
              )}
            </div>

            {/* Corps */}
            <div className="p-6 space-y-6 bg-base-200">
              <div className="text-sm leading-relaxed text-base-content/90 whitespace-pre-line">
                {finalMessage}
              </div>

              {signature && (
                <div className="pt-4 border-t border-base-300/50">
                  <SignaturePreview
                    templateId={signature.template_id}
                    profile={profileData}
                    socials={(signature.socials as Record<string, string>) ?? {}}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ─── Section Envoi par email ─────────────────────────────────── */}
          <div
            className="rounded-xl border p-5 space-y-4"
            style={{ borderColor: "oklch(72% 0.15 85 / 0.2)", background: "oklch(15% 0.012 85 / 0.5)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(72% 0.15 85 / 0.12)" }}
              >
                <Send size={13} style={{ color: "oklch(72% 0.15 85)" }} />
              </div>
              <p className="text-sm font-semibold text-gold">Envoyer par email</p>
            </div>

            {/* Champ email destinataire */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-medium text-base-content/70">
                  Email du destinataire
                </span>
              </label>
              <label
                className="input input-bordered flex items-center gap-3 bg-base-200 border-base-300 focus-within:border-gold h-11"
                style={
                  recipientEmail && !isEmailValid
                    ? { borderColor: "oklch(65% 0.25 25 / 0.6)" }
                    : {}
                }
              >
                <Mail size={15} className="text-base-content/40 shrink-0" />
                <input
                  id="recipient-email-input"
                  type="email"
                  placeholder="destinataire@exemple.com"
                  value={recipientEmail}
                  onChange={(e) => {
                    onChange({ recipientEmail: e.target.value });
                    setSendError(null);
                  }}
                  disabled={isSending || sendSuccess}
                  className="grow text-sm outline-none bg-transparent"
                />
              </label>
              {recipientEmail && !isEmailValid && (
                <p className="text-xs mt-1.5" style={{ color: "oklch(65% 0.25 25)" }}>
                  Format d&apos;email invalide
                </p>
              )}
            </div>

            {/* Erreur d'envoi */}
            <AnimatePresence>
              {sendError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 p-3 rounded-lg text-sm"
                  style={{
                    background: "oklch(65% 0.25 25 / 0.1)",
                    border: "1px solid oklch(65% 0.25 25 / 0.25)",
                    color: "oklch(65% 0.25 25)",
                  }}
                >
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{sendError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton Envoyer */}
            <button
              id="btn-send-email"
              type="button"
              onClick={handleSend}
              disabled={(!canSend && isOnline) || isSending || sendSuccess}
              className="btn gap-2 font-semibold w-full sm:w-auto"
              style={
                sendSuccess
                  ? {
                      backgroundColor: "oklch(67% 0.17 145 / 0.15)",
                      color: "oklch(67% 0.17 145)",
                      border: "1px solid oklch(67% 0.17 145 / 0.3)",
                    }
                  : !isOnline
                  ? {
                      backgroundColor: "oklch(75% 0.16 70 / 0.15)",
                      color: "oklch(75% 0.16 70)",
                      border: "1px solid oklch(75% 0.16 70 / 0.3)",
                    }
                  : canSend
                  ? {
                      backgroundColor: "oklch(72% 0.15 85)",
                      color: "oklch(12% 0.02 85)",
                      border: "none",
                    }
                  : {}
              }
            >
              <AnimatePresence mode="wait" initial={false}>
                {isSending ? (
                  <motion.span
                    key="sending"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 size={15} className="animate-spin" />
                    Envoi en cours…
                  </motion.span>
                ) : sendSuccess ? (
                  <motion.span
                    key="sent"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 size={15} />
                    Email envoyé !
                  </motion.span>
                ) : !isOnline ? (
                  <motion.span
                    key="offline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <WifiOff size={15} />
                    Connexion requise pour envoyer
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Send size={15} />
                    Envoyer l&apos;email
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {sendSuccess && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs"
                style={{ color: "oklch(67% 0.17 145)" }}
              >
                ✓ L&apos;email a été envoyé avec succès à {recipientEmail}. Redirection vers le dashboard…
              </motion.p>
            )}
          </div>

          {/* Export (copier) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-base-content">
              Copier le contenu
            </h3>
            <ExportPanel
              subject={state.subject}
              message={finalMessage}
              signature={signature}
              profile={profile}
            />
          </div>
        </div>
      )}

      {/* Navigation & Sauvegarde */}
      <div className="flex justify-between items-center pt-4 border-t border-base-300">
        <button
          onClick={onBack}
          disabled={isSaving || saved || isSending || sendSuccess}
          className="btn btn-ghost gap-1 text-base-content/60"
        >
          <ChevronLeft size={16} />
          Retour
        </button>

        <button
          id="btn-finalize-email"
          onClick={handleFinalize}
          disabled={isSaving || saved || sendSuccess}
          className="btn font-semibold gap-2"
          style={{
            backgroundColor: "oklch(72% 0.15 85 / 0.15)",
            color: "oklch(72% 0.15 85)",
            border: "1px solid oklch(72% 0.15 85 / 0.3)",
          }}
        >
          {isSaving ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Enregistrement…
            </>
          ) : saved ? (
            <>
              <Check size={16} />
              Enregistré !
            </>
          ) : (
            <>
              <Check size={16} />
              Enregistrer sans envoyer
            </>
          )}
        </button>
      </div>
    </div>
  );
}
