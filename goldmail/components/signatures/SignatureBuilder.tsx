"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Save, Globe, Link as LinkIcon, Share2, AtSign, X, CheckCircle2
} from "lucide-react";
import { createSignature, updateSignature } from "@/lib/db/signatures";
import type { Signature } from "@/types/database";
import SignaturePreview from "./SignaturePreview";

// ─── Templates disponibles ───────────────────────────────────────────────────
const TEMPLATES = [
  { id: "classic", label: "Classique" },
  { id: "minimal", label: "Minimaliste" },
  { id: "bold", label: "Bold" },
] as const;

const SOCIAL_FIELDS = [
  { key: "linkedin", label: "LinkedIn", icon: LinkIcon, placeholder: "https://linkedin.com/in/..." },
  { key: "twitter", label: "X / Twitter", icon: Share2, placeholder: "https://x.com/..." },
  { key: "github", label: "GitHub", icon: AtSign, placeholder: "https://github.com/..." },
  { key: "website", label: "Site web", icon: Globe, placeholder: "https://votre-site.fr" },
] as const;

interface SignatureBuilderProps {
  /** Mode édition — fournir la signature existante */
  existing?: Signature;
  profileData?: {
    full_name?: string | null;
    job_title?: string | null;
    company?: string | null;
    phone?: string | null;
    logo_url?: string | null;
  };
  onSaved?: (id: string) => void;
  onCancel?: () => void;
}

export default function SignatureBuilder({
  existing,
  profileData,
  onSaved,
  onCancel,
}: SignatureBuilderProps) {
  const [name, setName] = useState(existing?.name ?? "Ma signature");
  const [templateId, setTemplateId] = useState(existing?.template_id ?? "classic");
  const [socials, setSocials] = useState<Record<string, string>>(
    (existing?.socials as Record<string, string>) ?? {}
  );
  const [handwrittenSignature, setHandwrittenSignature] = useState<string | null>((existing?.socials as Record<string, string>)?.handwritten_signature ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSocialChange = (key: string, value: string) => {
    setSocials((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError("Choisissez une image PNG, JPEG ou WebP de moins de 2 Mo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setHandwrittenSignature(reader.result as string); setError(null); };
    reader.readAsDataURL(file);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const filteredSocials = Object.fromEntries(Object.entries(socials).filter(([key, value]) => key !== "handwritten_signature" && value.trim() !== ""));
      if (handwrittenSignature) filteredSocials.handwritten_signature = handwrittenSignature;

      if (existing) {
        const { error: updateError } = await updateSignature(existing.id, {
          name,
          template_id: templateId,
          socials: filteredSocials,
        });
        if (updateError) { setError(updateError); return; }
        setSaved(true);
        onSaved?.(existing.id);
      } else {
        const { id, error: createError } = await createSignature({
          name,
          template_id: templateId,
          socials: filteredSocials,
        });
        if (createError || !id) { setError(createError ?? "Erreur inconnue"); return; }
        setSaved(true);
        onSaved?.(id);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="alert alert-error text-sm">{error}</div>}

      {/* Nom de la signature */}
      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text text-xs font-medium text-base-content/70">
            Nom de la signature
          </span>
        </label>
        <input
          id="sig-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex. Professionnel, Simple…"
          className="input input-bordered bg-base-200 border-base-300 focus:border-gold text-sm w-full"
          required
        />
      </div>

      {/* Sélecteur de template */}
      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text text-xs font-medium text-base-content/70">
            Style de signature
          </span>
        </label>
        <div className="flex gap-3 flex-wrap">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              id={`tpl-${tpl.id}`}
              onClick={() => setTemplateId(tpl.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
              style={
                templateId === tpl.id
                  ? {
                      borderColor: "oklch(72% 0.15 85)",
                      background: "oklch(72% 0.15 85 / 0.12)",
                      color: "oklch(72% 0.15 85)",
                    }
                  : {
                      borderColor: "oklch(30% 0.015 285)",
                      background: "transparent",
                      color: "oklch(55% 0.008 285)",
                    }
              }
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Réseaux sociaux */}
      <div className="form-control">
        <label className="label pb-2">
          <span className="label-text text-xs font-medium text-base-content/70">
            Réseaux sociaux (optionnel)
          </span>
        </label>
        <div className="space-y-3">
          {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
            <label
              key={key}
              className="input input-bordered flex items-center gap-2 bg-base-200 border-base-300 focus-within:border-gold"
            >
              <Icon size={14} className="text-base-content/40 shrink-0" />
              <input
                id={`social-${key}`}
                type="url"
                placeholder={placeholder}
                value={socials[key] ?? ""}
                onChange={(e) => handleSocialChange(key, e.target.value)}
                className="grow text-sm"
              />
            </label>
          ))}
        </div>
      </div>
      {/* Signature manuscrite */}
      <div className="form-control">
        <label className="label pb-1"><span className="label-text text-xs font-medium text-base-content/70">Signature manuscrite (optionnel)</span></label>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleSignatureUpload} className="file-input file-input-bordered file-input-sm bg-base-200 border-base-300 w-full" />
        <p className="text-xs text-base-content/45 mt-1">Photo ou scan de votre signature — PNG, JPEG ou WebP, 2 Mo maximum.</p>
        {handwrittenSignature && <div className="mt-3 flex items-center gap-3"><img src={handwrittenSignature} alt="Aperçu de la signature manuscrite" className="h-14 max-w-48 object-contain rounded bg-white px-2" /><button type="button" onClick={() => setHandwrittenSignature(null)} className="btn btn-ghost btn-xs text-error"><X size={13} /> Supprimer</button></div>}
      </div>
      {/* Aperçu */}
      {profileData && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-base-content/70">Aperçu</p>
          <SignaturePreview
            templateId={templateId}
            profile={profileData}
            socials={socials}
            handwrittenSignature={handwrittenSignature}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          id="btn-save-signature"
          type="submit"
          disabled={isPending}
          className="btn gap-2 font-semibold"
          style={{
            backgroundColor: "oklch(72% 0.15 85)",
            color: "oklch(12% 0.02 85)",
            border: "none",
          }}
        >
          {isPending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <Save size={15} />
          )}
          {existing ? "Mettre à jour" : "Créer la signature"}
        </button>

        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm gap-1">
            <X size={14} />
            Annuler
          </button>
        )}

        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "oklch(67% 0.17 145)" }}
          >
            <CheckCircle2 size={14} />
            Enregistré !
          </motion.span>
        )}
      </div>
    </form>
  );
}
