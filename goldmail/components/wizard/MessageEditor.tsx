"use client";

interface MessageEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxChars?: number;
  disabled?: boolean;
}

export default function MessageEditor({
  id = "message-editor",
  value,
  onChange,
  placeholder = "Rédigez votre message ici…",
  minRows = 8,
  maxChars = 5000,
  disabled = false,
}: MessageEditorProps) {
  const charCount = value.length;
  const isNearLimit = charCount > maxChars * 0.85;
  const isOverLimit = charCount > maxChars;

  return (
    <div className="relative">
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={minRows}
        disabled={disabled}
        maxLength={maxChars}
        className="textarea textarea-bordered w-full bg-base-200 border-base-300 focus:border-gold text-sm resize-none leading-relaxed transition-colors"
        style={{
          borderColor: isOverLimit ? "oklch(65% 0.25 25)" : undefined,
          minHeight: `${minRows * 1.75}rem`,
        }}
      />

      {/* Compteur de caractères */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <span
          className="text-xs tabular-nums"
          style={{
            color: isOverLimit
              ? "oklch(65% 0.25 25)"
              : isNearLimit
              ? "oklch(75% 0.16 70)"
              : "oklch(45% 0.008 285)",
          }}
        >
          {charCount}/{maxChars}
        </span>
      </div>
    </div>
  );
}
