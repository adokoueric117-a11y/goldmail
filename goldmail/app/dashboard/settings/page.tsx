"use client";

import type { Metadata } from "next";
import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Mail, Lock, CheckCircle2, AlertCircle, Info, Eye, EyeOff } from "lucide-react";
import { getProfile } from "@/lib/db/profile";
import ProfileForm from "@/components/settings/ProfileForm";
import LogoUploader from "@/components/settings/LogoUploader";
import type { Profile } from "@/types/database";

// Note : metadata ne fonctionne pas dans les client components — titre défini via layout
export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // SMTP state
  const [smtp, setSmtp] = useState({
    host: "",
    port: "587",
    user: "",
    pass: "",
    from: "",
    secure: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [smtpSaved, setSmtpSaved] = useState(false);
  const [smtpError, setSmtpError] = useState<string | null>(null);
  const [isSavingSmtp, startSavingSmtp] = useTransition();
  const [isTestingSmtp, startTestingSmtp] = useTransition();
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .finally(() => setLoadingProfile(false));

    // Charger la config SMTP actuelle depuis le serveur (si déjà définie)
    fetch("/api/smtp-config")
      .then((r) => r.json())
      .then((data) => {
        if (data) setSmtp((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, []);

  const handleSmtpSave = () => {
    setSmtpError(null);
    setSmtpSaved(false);
    startSavingSmtp(async () => {
      try {
        const res = await fetch("/api/smtp-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(smtp),
        });
        const data = await res.json();
        if (!res.ok) {
          setSmtpError(data.error ?? "Erreur lors de l'enregistrement");
          return;
        }
        setSmtpSaved(true);
        setTimeout(() => setSmtpSaved(false), 3000);
      } catch {
        setSmtpError("Erreur réseau — vérifiez votre connexion");
      }
    });
  };

  const handleSmtpTest = () => {
    setTestResult(null);
    startTestingSmtp(async () => {
      try {
        const res = await fetch("/api/smtp-config/test", { method: "POST" });
        const data = await res.json();
        setTestResult({ ok: res.ok, msg: data.message ?? data.error ?? "Terminé" });
      } catch {
        setTestResult({ ok: false, msg: "Erreur réseau lors du test SMTP" });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-base-content">Paramètres</h1>
        <p className="text-sm text-base-content/50 mt-1">
          Gérez votre profil professionnel, votre logo et la configuration email.
        </p>
      </div>

      <div className="divider-gold" />

      {/* Section profil */}
      <section className="card-gold rounded-2xl p-6">
        <h2 className="text-base font-semibold text-base-content mb-5">
          Informations du profil
        </h2>
        {loadingProfile ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md" style={{ color: "oklch(72% 0.15 85)" }} />
          </div>
        ) : (
          <ProfileForm profile={profile} />
        )}
      </section>

      {/* Section logo */}
      <section className="card-gold rounded-2xl p-6">
        <h2 className="text-base font-semibold text-base-content mb-2">
          Logo de l&apos;entreprise
        </h2>
        <p className="text-sm text-base-content/50 mb-5">
          Votre logo apparaîtra dans vos emails et signatures. Stocké localement dans votre navigateur.
        </p>
        <LogoUploader currentLogoBase64={profile?.logo_base64} />
      </section>

      {/* Section SMTP */}
      <section className="card-gold rounded-2xl p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "oklch(72% 0.15 85 / 0.1)" }}
          >
            <Server size={18} style={{ color: "oklch(72% 0.15 85)" }} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-base-content">
              Configuration SMTP
            </h2>
            <p className="text-sm text-base-content/50 mt-0.5">
              Serveur utilisé pour envoyer vos emails. Stocké côté serveur uniquement.
            </p>
          </div>
        </div>

        <div
          className="flex items-start gap-2 p-3 rounded-lg text-xs"
          style={{ background: "oklch(70% 0.14 240 / 0.08)", color: "oklch(70% 0.14 240)" }}
        >
          <Info size={13} className="shrink-0 mt-0.5" />
          <span>
            Les identifiants SMTP sont stockés dans le fichier <code className="font-mono">.env.local</code> côté serveur — jamais dans le navigateur.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Hôte SMTP */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-medium text-base-content/70">Hôte SMTP</span>
            </label>
            <label className="input input-bordered flex items-center gap-2 bg-base-200 border-base-300 focus-within:border-gold">
              <Server size={13} className="text-base-content/40" />
              <input
                id="smtp-host"
                type="text"
                placeholder="smtp.gmail.com"
                value={smtp.host}
                onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                className="grow text-sm"
              />
            </label>
          </div>

          {/* Port */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-medium text-base-content/70">Port</span>
            </label>
            <div className="flex gap-2">
              <label className="input input-bordered flex items-center gap-2 bg-base-200 border-base-300 focus-within:border-gold flex-1">
                <input
                  id="smtp-port"
                  type="number"
                  placeholder="587"
                  value={smtp.port}
                  onChange={(e) => setSmtp({ ...smtp, port: e.target.value })}
                  className="grow text-sm"
                  min={1}
                  max={65535}
                />
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-3 rounded-lg border border-base-300 bg-base-200 text-xs text-base-content/60 select-none">
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs"
                  checked={smtp.secure}
                  onChange={(e) => setSmtp({ ...smtp, secure: e.target.checked, port: e.target.checked ? "465" : "587" })}
                />
                SSL
              </label>
            </div>
          </div>

          {/* Email expéditeur */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-medium text-base-content/70">Email SMTP (login)</span>
            </label>
            <label className="input input-bordered flex items-center gap-2 bg-base-200 border-base-300 focus-within:border-gold">
              <Mail size={13} className="text-base-content/40" />
              <input
                id="smtp-user"
                type="email"
                placeholder="vous@gmail.com"
                value={smtp.user}
                onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                className="grow text-sm"
              />
            </label>
          </div>

          {/* Adresse From */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-medium text-base-content/70">Nom affiché (From)</span>
            </label>
            <label className="input input-bordered flex items-center gap-2 bg-base-200 border-base-300 focus-within:border-gold">
              <Mail size={13} className="text-base-content/40" />
              <input
                id="smtp-from"
                type="text"
                placeholder="Jean Dupont <vous@gmail.com>"
                value={smtp.from}
                onChange={(e) => setSmtp({ ...smtp, from: e.target.value })}
                className="grow text-sm"
              />
            </label>
          </div>

          {/* Mot de passe d'application */}
          <div className="form-control sm:col-span-2">
            <label className="label pb-1">
              <span className="label-text text-xs font-medium text-base-content/70">Mot de passe d&apos;application</span>
            </label>
            <label className="input input-bordered flex items-center gap-2 bg-base-200 border-base-300 focus-within:border-gold">
              <Lock size={13} className="text-base-content/40" />
              <input
                id="smtp-pass"
                type={showPass ? "text" : "password"}
                placeholder="••••••••••••••••"
                value={smtp.pass}
                onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })}
                className="grow text-sm font-mono"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="btn btn-ghost btn-xs"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </label>
            <label className="label pt-1">
              <span className="label-text-alt text-xs text-base-content/30">
                Pour Gmail : utilisez un Mot de passe d&apos;application (pas votre mot de passe Google)
              </span>
            </label>
          </div>
        </div>

        {/* Erreur / Succès SMTP save */}
        <AnimatePresence>
          {smtpError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 p-3 rounded-lg text-sm"
              style={{ background: "oklch(65% 0.25 25 / 0.1)", color: "oklch(65% 0.25 25)" }}
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {smtpError}
            </motion.div>
          )}
          {testResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 p-3 rounded-lg text-sm"
              style={{
                background: testResult.ok ? "oklch(67% 0.17 145 / 0.1)" : "oklch(65% 0.25 25 / 0.1)",
                color: testResult.ok ? "oklch(67% 0.17 145)" : "oklch(65% 0.25 25)",
              }}
            >
              {testResult.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {testResult.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boutons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            id="btn-save-smtp"
            type="button"
            onClick={handleSmtpSave}
            disabled={isSavingSmtp || !smtp.host}
            className="btn gap-2 font-semibold"
            style={{
              backgroundColor: "oklch(72% 0.15 85)",
              color: "oklch(12% 0.02 85)",
              border: "none",
            }}
          >
            {isSavingSmtp ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Server size={14} />
            )}
            Enregistrer SMTP
          </button>

          <button
            id="btn-test-smtp"
            type="button"
            onClick={handleSmtpTest}
            disabled={isTestingSmtp || !smtp.host}
            className="btn btn-outline gap-2 font-semibold"
            style={{ borderColor: "oklch(72% 0.15 85 / 0.4)", color: "oklch(72% 0.15 85)" }}
          >
            {isTestingSmtp ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Mail size={14} />
            )}
            Tester la connexion
          </button>

          {smtpSaved && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 text-sm"
              style={{ color: "oklch(67% 0.17 145)" }}
            >
              <CheckCircle2 size={14} />
              Configuration sauvegardée
            </motion.span>
          )}
        </div>
      </section>
    </div>
  );
}
