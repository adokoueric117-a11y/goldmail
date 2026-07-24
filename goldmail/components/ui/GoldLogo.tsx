/**
 * GoldLogo — Logotype SVG de GoldMail.
 * Icône d'enveloppe stylisée avec accent doré.
 */
interface GoldLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function GoldLogo({
  size = 32,
  showText = true,
  className = "",
}: GoldLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icône SVG — enveloppe avec diagonale or */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Corps de l'enveloppe */}
        <rect
          x="2"
          y="6"
          width="28"
          height="20"
          rx="3"
          fill="oklch(17% 0.012 285)"
          stroke="oklch(72% 0.15 85)"
          strokeWidth="1.5"
        />
        {/* Rabat — chevron doré */}
        <path
          d="M2 9l14 10L30 9"
          stroke="oklch(72% 0.15 85)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Sparkle — accroche premium */}
        <circle cx="26" cy="8" r="4" fill="oklch(72% 0.15 85)" />
        <path
          d="M26 6v4M24 8h4"
          stroke="oklch(14% 0.012 285)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <span
          className="font-bold tracking-tight text-base-content"
          style={{ fontSize: size * 0.6 }}
        >
          Gold
          <span style={{ color: "oklch(72% 0.15 85)" }}>Mail</span>
        </span>
      )}
    </div>
  );
}
