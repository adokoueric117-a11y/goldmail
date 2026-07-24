"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Star, Pencil, X, StarOff } from "lucide-react";
import SignatureBuilder from "@/components/signatures/SignatureBuilder";
import SignaturePreview from "@/components/signatures/SignaturePreview";
import { deleteSignature, updateSignature } from "@/lib/db/signatures";
import type { Signature, Profile } from "@/types/database";

interface SignaturesClientProps {
  signatures: Signature[];
  profile: Profile | null;
  onRefresh?: () => void;
}

export default function SignaturesClient({
  signatures: initial,
  profile,
  onRefresh,
}: SignaturesClientProps) {
  const [signatures, setSignatures] = useState<Signature[]>(initial);
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const profileData = {
    full_name: profile?.full_name,
    job_title: profile?.job_title,
    company: profile?.company,
    phone: profile?.phone,
    logo_base64: profile?.logo_base64,
  };

  const handleDelete = (id: string) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
    startTransition(async () => {
      await deleteSignature(id);
      onRefresh?.();
    });
  };

  const handleSetDefault = (id: string) => {
    setSignatures((prev) =>
      prev.map((s) => ({ ...s, is_default: s.id === id }))
    );
    startTransition(async () => {
      await updateSignature(id, { is_default: true });
      onRefresh?.();
    });
  };

  return (
    <div className="space-y-6">
      {/* Bouton créer */}
      {!showNew && (
        <button
          id="btn-new-signature"
          onClick={() => setShowNew(true)}
          className="btn gap-2 font-semibold"
          style={{
            backgroundColor: "oklch(72% 0.15 85)",
            color: "oklch(12% 0.02 85)",
            border: "none",
          }}
        >
          <Plus size={16} />
          Nouvelle signature
        </button>
      )}

      {/* Formulaire de création */}
      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="card-gold rounded-2xl p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-base-content">Nouvelle signature</h3>
              <button onClick={() => setShowNew(false)} className="btn btn-ghost btn-sm btn-square">
                <X size={16} />
              </button>
            </div>
            <SignatureBuilder
              profileData={profileData}
              onSaved={() => {
                setShowNew(false);
                onRefresh?.();
              }}
              onCancel={() => setShowNew(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste signatures */}
      {signatures.length === 0 && !showNew ? (
        <div className="text-center py-20 text-base-content/40">
          <p className="text-base">Aucune signature créée.</p>
          <p className="text-sm mt-1">Cliquez sur &quot;Nouvelle signature&quot; pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {signatures.map((sig) => (
              <motion.div
                key={sig.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="card-gold rounded-2xl overflow-hidden"
              >
                <div className="p-5 border-b border-base-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-sm text-base-content">{sig.name}</h3>
                    {sig.is_default && (
                      <span
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "oklch(72% 0.15 85 / 0.15)",
                          color: "oklch(72% 0.15 85)",
                        }}
                      >
                        <Star size={10} />
                        Par défaut
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!sig.is_default && (
                      <button
                        id={`btn-default-${sig.id}`}
                        onClick={() => handleSetDefault(sig.id)}
                        className="btn btn-ghost btn-xs gap-1 text-base-content/40 hover:text-gold"
                        title="Définir par défaut"
                      >
                        <StarOff size={13} />
                      </button>
                    )}
                    <button
                      id={`btn-edit-${sig.id}`}
                      onClick={() => setEditingId(editingId === sig.id ? null : sig.id)}
                      className="btn btn-ghost btn-xs gap-1 text-base-content/40 hover:text-base-content"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      id={`btn-delete-sig-${sig.id}`}
                      onClick={() => handleDelete(sig.id)}
                      className="btn btn-ghost btn-xs gap-1 text-base-content/30 hover:text-error"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Aperçu ou éditeur */}
                <div className="p-5">
                  <AnimatePresence mode="wait">
                    {editingId === sig.id ? (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <SignatureBuilder
                          existing={sig}
                          profileData={profileData}
                          onSaved={() => { setEditingId(null); onRefresh?.(); }}
                          onCancel={() => setEditingId(null)}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <SignaturePreview
                          templateId={sig.template_id}
                          profile={profileData}
                          socials={(sig.socials as Record<string, string>) ?? {}}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
