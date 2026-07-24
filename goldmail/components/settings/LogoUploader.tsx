"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, X, CheckCircle2, AlertCircle } from "lucide-react";
import { saveLogo } from "@/lib/db/profile";
import Image from "next/image";

interface LogoUploaderProps {
  currentLogoBase64?: string | null;
  /** @deprecated use currentLogoBase64 */
  currentLogoUrl?: string | null;
  onUploaded?: (base64: string) => void;
  /** En mode wizard, on ne persiste pas en DB (juste retour via onUploaded) */
  wizardMode?: boolean;
}

const MAX_SIZE_MB = 2;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LogoUploader({
  currentLogoBase64,
  currentLogoUrl,
  onUploaded,
  wizardMode = false,
}: LogoUploaderProps) {
  const initial = currentLogoBase64 ?? currentLogoUrl ?? null;
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setSuccess(false);

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Format non supporté (PNG, JPEG, WebP, SVG)");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Fichier trop volumineux (max ${MAX_SIZE_MB} Mo)`);
        return;
      }

      setLoading(true);
      try {
        const base64 = await fileToBase64(file);
        setPreview(base64);

        if (!wizardMode) {
          // Persister en DB locale
          const { error: saveErr } = await saveLogo(base64);
          if (saveErr) {
            setError(saveErr);
            setLoading(false);
            return;
          }
        }

        onUploaded?.(base64);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (e) {
        setError("Erreur lors de la lecture du fichier");
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [wizardMode, onUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const clearLogo = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        id="logo-drop-zone"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="relative rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-8 cursor-pointer"
        style={{
          borderColor: isDragging
            ? "oklch(72% 0.15 85)"
            : "oklch(30% 0.015 285)",
          background: isDragging
            ? "oklch(72% 0.15 85 / 0.06)"
            : "var(--color-base-200, oklch(17% 0.012 285))",
        }}
        onClick={() => document.getElementById("logo-file-input")?.click()}
      >
        <input
          id="logo-file-input"
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileInput}
          className="hidden"
        />

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <span className="loading loading-spinner loading-md" style={{ color: "oklch(72% 0.15 85)" }} />
            <p className="text-sm text-base-content/50">Traitement en cours…</p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-base-300">
              <Image
                src={preview}
                alt="Aperçu logo"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="text-xs text-base-content/50">
              Cliquez ou déposez pour remplacer
            </p>
            <button
              type="button"
              id="btn-clear-logo"
              onClick={(e) => { e.stopPropagation(); clearLogo(); }}
              className="btn btn-ghost btn-xs gap-1 text-base-content/40 hover:text-error"
            >
              <X size={12} />
              Supprimer
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center pointer-events-none">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(72% 0.15 85 / 0.1)" }}
            >
              {isDragging ? (
                <Upload size={22} style={{ color: "oklch(72% 0.15 85)" }} />
              ) : (
                <ImageIcon size={22} style={{ color: "oklch(72% 0.15 85 / 0.6)" }} />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-base-content/70">
                {isDragging ? "Déposez le fichier" : "Glissez votre logo ici"}
              </p>
              <p className="text-xs text-base-content/40 mt-1">
                PNG, JPEG, WebP, SVG — max {MAX_SIZE_MB} Mo
              </p>
              <p className="text-xs text-base-content/30 mt-0.5">
                Stocké localement (offline)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Messages d'état */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
            style={{
              background: "oklch(65% 0.25 25 / 0.1)",
              color: "oklch(65% 0.25 25)",
            }}
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
            style={{
              background: "oklch(67% 0.17 145 / 0.1)",
              color: "oklch(67% 0.17 145)",
            }}
          >
            <CheckCircle2 size={14} />
            Logo enregistré localement !
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
