"use client";

import { useState } from "react";
import { Plus, X, Check, FileText } from "lucide-react";
import { createCustomTemplate } from "@/lib/db/custom_templates";
import type { HRTemplate } from "@/lib/templates";

interface AddTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTemplate: HRTemplate) => void;
}

const CATEGORIES = [
  "RH & Juridique",
  "Communication",
  "Management",
  "Partenariat & Institution",
  "Urgence & Crise",
] as const;

export default function AddTemplateModal({ isOpen, onClose, onSuccess }: AddTemplateModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<HRTemplate["category"]>("Management");
  const [badge, setBadge] = useState("Personnalisé");
  const [description, setDescription] = useState("");
  const [defaultSubject, setDefaultSubject] = useState("");
  const [defaultRecipient, setDefaultRecipient] = useState("");
  const [text, setText] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !defaultSubject.trim() || !text.trim()) {
      setError("Veuillez remplir au minimum le titre, l'objet et le texte du modèle.");
      return;
    }

    setSaving(true);
    setError(null);

    const res = await createCustomTemplate({
      title: title.trim(),
      category,
      badge: badge.trim() || "Personnalisé",
      description: description.trim() || "Modèle personnalisé de l'entreprise.",
      defaultSubject: defaultSubject.trim(),
      defaultRecipient: defaultRecipient.trim(),
      text: text.trim(),
    });

    setSaving(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    const createdTpl: HRTemplate = {
      id: res.id!,
      title: title.trim(),
      category,
      badge: badge.trim() || "Personnalisé",
      description: description.trim() || "Modèle personnalisé de l'entreprise.",
      defaultSubject: defaultSubject.trim(),
      defaultRecipient: defaultRecipient.trim(),
      text: text.trim(),
      isCustom: true,
    };

    onSuccess(createdTpl);
    onClose();

    // Reset
    setTitle("");
    setDefaultSubject("");
    setDefaultRecipient("");
    setText("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-base-100 border border-base-300 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-2 text-gold">
            <FileText size={18} />
            <h3 className="text-base font-bold text-base-content">
              Créer un nouveau modèle pré-rédigé
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle text-base-content/60"
          >
            <X size={16} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-xs text-error font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text text-xs font-semibold text-base-content/80 mb-1">
                Titre du modèle <span className="text-error">*</span>
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. Proposition d'accord commercial"
                className="input input-sm input-bordered bg-base-200 border-base-300 text-xs"
                required
              />
            </label>

            <label className="form-control">
              <span className="label-text text-xs font-semibold text-base-content/80 mb-1">
                Catégorie <span className="text-error">*</span>
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HRTemplate["category"])}
                className="select select-sm select-bordered bg-base-200 border-base-300 text-xs"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text text-xs font-medium text-base-content/70 mb-1">
                Objet / Sujet par défaut <span className="text-error">*</span>
              </span>
              <input
                type="text"
                value={defaultSubject}
                onChange={(e) => setDefaultSubject(e.target.value)}
                placeholder="Ex. Demande de rendez-vous institutionnel..."
                className="input input-sm input-bordered bg-base-200 border-base-300 text-xs"
                required
              />
            </label>

            <label className="form-control">
              <span className="label-text text-xs font-medium text-base-content/70 mb-1">
                Badge personnalisé <span className="text-base-content/40">(optionnel)</span>
              </span>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ex. Commercial / Spécial"
                className="input input-sm input-bordered bg-base-200 border-base-300 text-xs"
              />
            </label>
          </div>

          <label className="form-control">
            <span className="label-text text-xs font-medium text-base-content/70 mb-1">
              Destinataire type <span className="text-base-content/40">(optionnel)</span>
            </span>
            <input
              type="text"
              value={defaultRecipient}
              onChange={(e) => setDefaultRecipient(e.target.value)}
              placeholder="Ex. À l'attention de la Direction Générale"
              className="input input-sm input-bordered bg-base-200 border-base-300 text-xs"
            />
          </label>

          <label className="form-control">
            <span className="label-text text-xs font-medium text-base-content/70 mb-1">
              Description succincte
            </span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex. Modèle utilisé pour les sollicitations d'affaires..."
              className="input input-sm input-bordered bg-base-200 border-base-300 text-xs"
            />
          </label>

          <label className="form-control">
            <span className="label-text text-xs font-semibold text-base-content/80 mb-1">
              Texte pré-rédigé du modèle (utilisez les [crochets] pour les variables){" "}
              <span className="text-error">*</span>
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Madame, Monsieur,\n\nPar la présente, nous [Préciser l'action]...\n\nCordialement,"}
              className="textarea textarea-bordered bg-base-200 border-base-300 min-h-40 text-xs leading-relaxed font-mono"
              required
            />
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost text-base-content/70"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-sm font-semibold gap-1.5"
              style={{
                backgroundColor: "oklch(72% 0.15 85)",
                color: "oklch(12% 0.02 85)",
                border: "none",
              }}
            >
              {saving ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <>
                  <Check size={14} /> Enregistrer le modèle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
