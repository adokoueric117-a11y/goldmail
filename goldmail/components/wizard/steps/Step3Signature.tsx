"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Plus, Check, Star } from "lucide-react";
import { getSignatures } from "@/lib/db/signatures";
import { getProfile } from "@/lib/db/profile";
import SignatureBuilder from "@/components/signatures/SignatureBuilder";
import SignaturePreview from "@/components/signatures/SignaturePreview";
import type { WizardState, Signature, Profile } from "@/types/database";

interface Step3SignatureProps {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Signature({
  state,
  onChange,
  onNext,
  onBack,
}: Step3SignatureProps) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [sigs, prof] = await Promise.all([getSignatures(), getProfile()]);
      setSignatures(sigs);
      setProfile(prof);

      // Si aucune signature sélectionnée et qu'il y en a une par défaut, la sélectionner
      if (!state.signatureId && sigs.length > 0) {
        const defaultSig = sigs.find((s) => s.is_default) || sigs[0];
        onChange({ signatureId: defaultSig.id });
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleCreated = async (newId: string) => {
    const updatedSigs = await getSignatures();
    setSignatures(updatedSigs);
    onChange({ signatureId: newId });
    setShowCreate(false);
  };

  const selectedSig = signatures.find((s) => s.id === state.signatureId);

  const profileData = {
    full_name: profile?.full_name,
    job_title: profile?.job_title,
    company: profile?.company,
    phone: profile?.phone,
    logo_base64: profile?.logo_base64 || state.logoBase64,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-base-content mb-1">
          Choix de la signature
        </h2>
        <p className="text-sm text-base-content/50">
          Sélectionnez une signature existante ou créez-en une nouvelle pour cet email.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-md" style={{ color: "oklch(72% 0.15 85)" }} />
        </div>
      ) : showCreate ? (
        <div className="card-gold rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-sm text-base-content">
            Créer une nouvelle signature
          </h3>
          <SignatureBuilder
            profileData={profileData}
            onSaved={handleCreated}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Option sans signature */}
          <div
            onClick={() => onChange({ signatureId: null })}
            className="p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between"
            style={
              state.signatureId === null
                ? {
                    borderColor: "oklch(72% 0.15 85)",
                    background: "oklch(72% 0.15 85 / 0.08)",
                  }
                : {
                    borderColor: "oklch(25% 0.015 285)",
                    background: "oklch(17% 0.012 285)",
                  }
            }
          >
            <span className="text-sm font-medium text-base-content">
              Sans signature
            </span>
            {state.signatureId === null && (
              <Check size={16} style={{ color: "oklch(72% 0.15 85)" }} />
            )}
          </div>

          {/* Liste des signatures */}
          {signatures.map((sig) => {
            const isSelected = state.signatureId === sig.id;
            return (
              <div
                key={sig.id}
                onClick={() => onChange({ signatureId: sig.id })}
                className="p-4 rounded-xl border cursor-pointer transition-all space-y-3"
                style={
                  isSelected
                    ? {
                        borderColor: "oklch(72% 0.15 85)",
                        background: "oklch(72% 0.15 85 / 0.08)",
                      }
                    : {
                        borderColor: "oklch(25% 0.015 285)",
                        background: "oklch(17% 0.012 285)",
                      }
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-base-content">
                      {sig.name}
                    </span>
                    {sig.is_default && (
                      <span
                        className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          background: "oklch(72% 0.15 85 / 0.15)",
                          color: "oklch(72% 0.15 85)",
                        }}
                      >
                        <Star size={9} /> Défaut
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <Check size={16} style={{ color: "oklch(72% 0.15 85)" }} />
                  )}
                </div>

                <SignaturePreview
                  templateId={sig.template_id}
                  profile={profileData}
                  socials={(sig.socials as Record<string, string>) ?? {}}
                />
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="btn btn-outline btn-block gap-2 border-dashed border-base-300 hover:border-gold hover:text-gold"
          >
            <Plus size={16} />
            Créer une nouvelle signature
          </button>
        </div>
      )}

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
          Continuer
        </button>
      </div>
    </div>
  );
}
