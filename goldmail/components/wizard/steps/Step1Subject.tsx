"use client";

import { Mail, User } from "lucide-react";
import type { WizardState } from "@/types/database";

interface Step1SubjectProps {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  onNext: () => void;
}

export default function Step1Subject({ state, onChange, onNext }: Step1SubjectProps) {
  const isValid = state.subject.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-base-content mb-1">
          Objet &amp; contexte
        </h2>
        <p className="text-sm text-base-content/50">
          Définissez l&apos;objet de votre email et le contexte du destinataire.
        </p>
      </div>

      {/* Objet */}
      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text text-xs font-medium text-base-content/70">
            Objet de l&apos;email <span style={{ color: "oklch(65% 0.25 25)" }}>*</span>
          </span>
        </label>
        <label className="input input-bordered flex items-center gap-2 bg-base-200 border-base-300 focus-within:border-gold">
          <Mail size={15} className="text-base-content/40" />
          <input
            id="step1-subject"
            type="text"
            placeholder="Ex. Proposition de collaboration — Agence XYZ"
            value={state.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            className="grow text-sm"
            autoFocus
            maxLength={150}
          />
          <span className="text-xs text-base-content/30 tabular-nums shrink-0">
            {state.subject.length}/150
          </span>
        </label>
      </div>

      {/* Contexte destinataire */}
      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text text-xs font-medium text-base-content/70">
            Contexte du destinataire{" "}
            <span className="text-base-content/30">(optionnel)</span>
          </span>
        </label>
        <label className="input input-bordered flex items-center gap-2 bg-base-200 border-base-300 focus-within:border-gold h-auto py-2">
          <User size={15} className="text-base-content/40 self-start mt-0.5" />
          <textarea
            id="step1-context"
            placeholder="Ex. Directeur marketing d'une startup tech, intéressé par nos services de design"
            value={state.recipientContext}
            onChange={(e) => onChange({ recipientContext: e.target.value })}
            rows={3}
            className="grow text-sm bg-transparent resize-none outline-none border-none"
            maxLength={300}
          />
        </label>
        <label className="label pt-1">
          <span className="label-text-alt text-xs text-base-content/30">
            Aide l&apos;IA à mieux adapter le ton et le contenu
          </span>
          <span className="label-text-alt text-xs text-base-content/30">
            {state.recipientContext.length}/300
          </span>
        </label>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <button
          id="step1-next"
          onClick={onNext}
          disabled={!isValid}
          className="btn font-semibold gap-2"
          style={
            isValid
              ? {
                  backgroundColor: "oklch(72% 0.15 85)",
                  color: "oklch(12% 0.02 85)",
                  border: "none",
                }
              : {}
          }
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
