"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
  shortLabel: string;
}

interface WizardStepperProps {
  steps: Step[];
  currentStep: number;
  /** Étapes déjà complétées (permettent de cliquer dessus) */
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}

export default function WizardStepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: WizardStepperProps) {
  return (
    <div className="relative">
      {/* Ligne de connexion */}
      <div
        className="absolute top-4 left-4 right-4 h-px hidden sm:block"
        style={{ background: "oklch(25% 0.015 285)" }}
      />
      {/* Ligne de progression */}
      <motion.div
        className="absolute top-4 left-4 h-px hidden sm:block origin-left"
        style={{ background: "oklch(72% 0.15 85)" }}
        initial={{ scaleX: 0 }}
        animate={{
          scaleX: (currentStep - 1) / (steps.length - 1),
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        // Width est right-4 à left-4
        // eslint-disable-next-line react/prop-types
      />
      {/* Calcul de la largeur réelle via right offset = full - 8px */}
      <style>{`.wizard-progress-line { right: 1rem; }`}</style>

      <ol className="relative flex items-start sm:items-center justify-between gap-2 sm:gap-0">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isClickable = (isCompleted || step.id < currentStep) && !!onStepClick;

          return (
            <li
              key={step.id}
              className="flex flex-col items-center gap-2 relative z-10"
            >
              <button
                type="button"
                id={`wizard-step-${step.id}`}
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(step.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0"
                style={
                  isCompleted
                    ? {
                        background: "oklch(72% 0.15 85)",
                        color: "oklch(12% 0.02 85)",
                        cursor: isClickable ? "pointer" : "default",
                      }
                    : isCurrent
                    ? {
                        background: "oklch(14% 0.012 285)",
                        color: "oklch(72% 0.15 85)",
                        border: "2px solid oklch(72% 0.15 85)",
                        boxShadow: "0 0 12px oklch(72% 0.15 85 / 0.3)",
                      }
                    : {
                        background: "oklch(21% 0.012 285)",
                        color: "oklch(45% 0.008 285)",
                        border: "2px solid oklch(25% 0.015 285)",
                        cursor: "default",
                      }
                }
              >
                {isCompleted ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Check size={14} />
                  </motion.span>
                ) : (
                  step.id
                )}
              </button>

              {/* Label */}
              <span
                className="text-xs font-medium hidden sm:block text-center leading-tight"
                style={{
                  color: isCurrent
                    ? "oklch(72% 0.15 85)"
                    : isCompleted
                    ? "oklch(80% 0.008 285)"
                    : "oklch(45% 0.008 285)",
                  maxWidth: "80px",
                }}
              >
                {step.label}
              </span>

              {/* Label mobile */}
              {isCurrent && (
                <span
                  className="text-xs font-medium sm:hidden text-center leading-tight"
                  style={{ color: "oklch(72% 0.15 85)", maxWidth: "60px" }}
                >
                  {step.shortLabel}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
