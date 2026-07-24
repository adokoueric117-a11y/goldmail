"use client";

import { ChevronLeft } from "lucide-react";
import MessageEditor from "@/components/wizard/MessageEditor";
import type { WizardState } from "@/types/database";

interface Step2MessageProps {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Message({
  state,
  onChange,
  onNext,
  onBack,
}: Step2MessageProps) {
  const isValid = state.rawMessage.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-base-content mb-1">
          Rédaction du message
        </h2>
        <p className="text-sm text-base-content/50">
          Rédigez le contenu principal de votre email professionnel.
        </p>
      </div>

      {/* Message */}
      <div className="form-control">
        <label className="label pb-1">
          <span className="label-text text-xs font-medium text-base-content/70">
            Votre message <span style={{ color: "oklch(65% 0.25 25)" }}>*</span>
          </span>
        </label>
        <MessageEditor
          id="step2-raw-message"
          value={state.rawMessage}
          onChange={(v) => onChange({ rawMessage: v })}
          placeholder="Rédigez votre message ici…"
          minRows={9}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          id="step2-back"
          onClick={onBack}
          className="btn btn-ghost gap-1 text-base-content/60"
        >
          <ChevronLeft size={16} />
          Retour
        </button>
        <button
          id="step2-next"
          onClick={onNext}
          disabled={!isValid}
          className="btn font-semibold"
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
