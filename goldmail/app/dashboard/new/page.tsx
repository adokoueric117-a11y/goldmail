"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import WizardStepper from "@/components/wizard/WizardStepper";
import Step1Subject from "@/components/wizard/steps/Step1Subject";
import Step2Message from "@/components/wizard/steps/Step2Message";
import Step3Signature from "@/components/wizard/steps/Step3Signature";
import Step4Logo from "@/components/wizard/steps/Step4Logo";
import Step5Preview from "@/components/wizard/steps/Step5Preview";
import type { WizardState } from "@/types/database";
import { createEmail, updateEmail } from "@/lib/db/emails";

const STEPS = [
  { id: 1, label: "Objet & Contexte", shortLabel: "Objet" },
  { id: 2, label: "Rédaction du message", shortLabel: "Message" },
  { id: 3, label: "Signature", shortLabel: "Signature" },
  { id: 4, label: "Logo", shortLabel: "Logo" },
  { id: 5, label: "Aperçu & Export", shortLabel: "Aperçu" },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
  }),
};

function NewEmailWizard() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const [wizardState, setWizardState] = useState<WizardState>({
    subject: "",
    recipientContext: "",
    rawMessage: "",
    signatureId: null,
    logoBase64: null,
    recipientEmail: "",
    savedEmailId: editId ?? null,
  });

  // Mise à jour pure de l'état local
  const updateState = useCallback((updates: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Auto-save avec debounce 1000ms (vers DB locale)
  const wizardRef = useRef(wizardState);
  wizardRef.current = wizardState;

  useEffect(() => {
    if (!wizardState.subject.trim()) return;

    const timer = setTimeout(async () => {
      const currentState = wizardRef.current;
      if (currentState.savedEmailId) {
        await updateEmail(currentState.savedEmailId, currentState);
      } else {
        const { id } = await createEmail(currentState);
        if (id) {
          setWizardState((prev) => ({ ...prev, savedEmailId: id }));
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    wizardState.subject,
    wizardState.recipientContext,
    wizardState.rawMessage,
    wizardState.signatureId,
    wizardState.logoBase64,
  ]);

  const goToStep = useCallback((targetStep: number) => {
    setCurrentStep((prevStep) => {
      if (targetStep > prevStep) {
        setDirection(1);
        setCompletedSteps((prev) =>
          prev.includes(prevStep) ? prev : [...prev, prevStep]
        );
      } else {
        setDirection(-1);
      }
      return targetStep;
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => {
      setDirection(1);
      setCompletedSteps((c) => (c.includes(prev) ? c : [...c, prev]));
      return prev + 1;
    });
  }, []);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => {
      setDirection(-1);
      return prev - 1;
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-base-content">
          Assistant de création d&apos;email
        </h1>
        <p className="text-sm text-base-content/50 mt-1">
          Créez un email professionnel d&apos;exception en 5 étapes.
        </p>
      </div>

      {/* Stepper */}
      <div className="card-gold rounded-2xl p-6">
        <WizardStepper
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />
      </div>

      {/* Étape courante avec animation Framer Motion */}
      <div className="card-gold rounded-2xl p-6 sm:p-8 min-h-[420px] relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {currentStep === 1 && (
              <Step1Subject
                state={wizardState}
                onChange={updateState}
                onNext={handleNext}
              />
            )}
            {currentStep === 2 && (
              <Step2Message
                state={wizardState}
                onChange={updateState}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <Step3Signature
                state={wizardState}
                onChange={updateState}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 4 && (
              <Step4Logo
                state={wizardState}
                onChange={updateState}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 5 && (
              <Step5Preview
                state={wizardState}
                onChange={updateState}
                onBack={handleBack}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function NewEmailWizardPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto py-12 text-center text-base-content/50">Chargement du brouillon...</div>}>
      <NewEmailWizard />
    </Suspense>
  );
}