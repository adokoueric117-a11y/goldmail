"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Save, User, Briefcase, Building2, Phone, Globe, CheckCircle2 } from "lucide-react";
import { upsertProfile } from "@/lib/db/profile";
import type { Profile } from "@/types/database";

interface ProfileFormProps {
  profile: Profile | null;
}

const fieldConfig = [
  { key: "full_name", label: "Nom complet", icon: User, placeholder: "Jean Dupont", type: "text" },
  { key: "job_title", label: "Titre de poste", icon: Briefcase, placeholder: "Directeur Marketing", type: "text" },
  { key: "company", label: "Entreprise", icon: Building2, placeholder: "Acme Corp", type: "text" },
  { key: "phone", label: "Téléphone", icon: Phone, placeholder: "+33 6 12 34 56 78", type: "tel" },
  { key: "website", label: "Site web", icon: Globe, placeholder: "https://votre-site.fr", type: "url" },
] as const;

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [fields, setFields] = useState({
    full_name: profile?.full_name ?? "",
    job_title: profile?.job_title ?? "",
    company: profile?.company ?? "",
    phone: profile?.phone ?? "",
    website: profile?.website ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const { error: saveError } = await upsertProfile(fields);
      if (saveError) {
        setError(saveError);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="alert alert-error text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {fieldConfig.map(({ key, label, icon: Icon, placeholder, type }) => (
          <div key={key} className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-medium text-base-content/70">
                {label}
              </span>
            </label>
            <label className="input input-bordered flex items-center gap-2 bg-base-200 border-base-300 focus-within:border-gold">
              <Icon size={14} className="text-base-content/40" />
              <input
                id={`profile-${key}`}
                type={type}
                placeholder={placeholder}
                value={fields[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="grow text-sm"
              />
            </label>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          id="btn-save-profile"
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
          Enregistrer
        </button>

        {saved && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "oklch(67% 0.17 145)" }}
          >
            <CheckCircle2 size={15} />
            Profil enregistré
          </motion.div>
        )}
      </div>
    </form>
  );
}
