"use client";

import { ChevronLeft } from "lucide-react";
import LogoUploader from "@/components/settings/LogoUploader";
import type { WizardState } from "@/types/database";

interface Step4LogoProps {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4Logo({
  state,
  onChange,
  onNext,
  onBack,
}: Step4LogoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-base-content mb-1">
          Logo &amp; Branding
        </h2>
        <p className="text-sm text-base-content/50">
          Uploadez ou confirmez le logo d&apos;entreprise qui accompagnera cet email.
        </p>
      </div>

      <div className="card-gold rounded-xl p-6">
        <LogoUploader
          currentLogoBase64={state.logoBase64}
          onUploaded={(base64) => onChange({ logoBase64: base64 })}
          wizardMode
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="btn btn-ghost gap-1 text-base-content/60"
        >
          <ChevronLeft size={16} />
          Retour
        </button>
        <button
          onClick={onNext}
          className="btn font-semibold"
          style={{
            backgroundColor: "oklch(72% 0.15 85)",
            color: "oklch(12% 0.02 85)",
            border: "none",
          }}
        >
          Aperçu final
        </button>
      </div>
    </div>
  );
}
