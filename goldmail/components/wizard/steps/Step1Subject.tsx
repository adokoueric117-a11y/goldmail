"use client";

import { useState, useEffect, useMemo } from "react";
import { Mail, User, FileText, ChevronDown, Plus, Trash2 } from "lucide-react";
import type { WizardState } from "@/types/database";
import { HR_TEMPLATES, type HRTemplate } from "@/lib/templates";
import { getCustomTemplates, deleteCustomTemplate } from "@/lib/db/custom_templates";
import AddTemplateModal from "@/components/templates/AddTemplateModal";

interface Step1SubjectProps {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  onNext: () => void;
}

export default function Step1Subject({ state, onChange, onNext }: Step1SubjectProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<HRTemplate[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isValid = state.subject.trim().length > 0;

  useEffect(() => {
    getCustomTemplates().then(setCustomTemplates);
  }, []);

  const allTemplates = useMemo(
    () => [...HR_TEMPLATES, ...customTemplates],
    [customTemplates]
  );

  const handleSelectTemplate = (tpl: HRTemplate) => {
    onChange({
      subject: tpl.defaultSubject,
      recipientContext: tpl.description,
      rawMessage: tpl.text,
    });
    setShowTemplates(false);
  };

  const handleDeleteCustom = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteCustomTemplate(id);
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCustomCreated = (newTpl: HRTemplate) => {
    setCustomTemplates((prev) => [newTpl, ...prev]);
    handleSelectTemplate(newTpl);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-base-content mb-1">
            Objet &amp; Contexte
          </h2>
          <p className="text-sm text-base-content/50">
            Définissez l&apos;objet de votre email ou choisissez un modèle pré-rédigé.
          </p>
        </div>

        {/* Bouton sélecteur de modèles */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="btn btn-sm btn-outline border-gold/40 text-gold hover:bg-gold/10 gap-2 font-medium"
          >
            <FileText size={14} />
            Modèles pré-rédigés
            <ChevronDown size={14} />
          </button>

          {showTemplates && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-80 overflow-y-auto bg-base-100 border border-base-300 rounded-xl shadow-2xl p-2 z-50 space-y-1">
              <div className="flex items-center justify-between px-2 py-1 border-b border-base-300/50">
                <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
                  Modèles d&apos;emails &amp; documents ({allTemplates.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowTemplates(false);
                    setIsAddModalOpen(true);
                  }}
                  className="text-xs text-gold font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus size={13} /> Nouveau
                </button>
              </div>

              {allTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className="w-full text-left p-2 rounded-lg hover:bg-base-200 transition-colors text-xs space-y-0.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-base-content">{tpl.title}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-gold/10 text-gold font-medium">
                        {tpl.badge}
                      </span>
                      {tpl.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustom(e, tpl.id)}
                          title="Supprimer ce modèle"
                          className="opacity-0 group-hover:opacity-100 text-error hover:bg-error/10 p-0.5 rounded transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-base-content/50 line-clamp-1">
                    {tpl.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
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
            placeholder="Ex. Proposition de partenariat institutionnel..."
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
            Contexte ou notes du destinataire{" "}
            <span className="text-base-content/30">(optionnel)</span>
          </span>
        </label>
        <label className="input input-bordered flex items-center gap-2 bg-base-200 border-base-300 focus-within:border-gold h-auto py-2">
          <User size={15} className="text-base-content/40 self-start mt-0.5" />
          <textarea
            id="step1-context"
            placeholder="Ex. À l'attention de la Direction Générale..."
            value={state.recipientContext}
            onChange={(e) => onChange({ recipientContext: e.target.value })}
            rows={3}
            className="grow text-sm bg-transparent resize-none outline-none border-none"
            maxLength={300}
          />
        </label>
        <label className="label pt-1">
          <span className="label-text-alt text-xs text-base-content/30">
            Donne du contexte supplémentaire à l&apos;email
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

      <AddTemplateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleCustomCreated}
      />
    </div>
  );
}
