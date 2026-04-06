"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { ProfNameStep } from "./steps/ProfNameStep";
import { ProfSpecialtyStep } from "./steps/ProfSpecialtyStep";
import { ProfLocationStep } from "./steps/ProfLocationStep";

// ── Schema ──────────────────────────────────────────────────────────────────
const profOnboardingSchema = z.object({
  name:      z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  cref:      z.string().optional(),
  specialty: z.string().optional(),
  city:      z.string().optional(),
  state:     z.string().optional(),
});

export type ProfOnboardingData = z.infer<typeof profOnboardingSchema>;

// ── Steps ───────────────────────────────────────────────────────────────────
const STEPS = [
  { id: "name",      cta: "Continuar →",    skippable: false },
  { id: "specialty", cta: "Continuar →",    skippable: true  },
  { id: "location",  cta: "Entrar no app ✓", skippable: true  },
] as const;

const TOTAL_STEPS = STEPS.length;

// ── Component ────────────────────────────────────────────────────────────────
export function ProfessionalOnboardingFlow({ initialName }: { initialName?: string }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ProfOnboardingData>({
    resolver: zodResolver(profOnboardingSchema),
    defaultValues: { name: initialName ?? "", cref: "", specialty: "", city: "", state: "" },
    mode: "onChange",
  });

  const { trigger, getValues, watch } = methods;
  const name = watch("name") ?? "";
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const isNextDisabled = currentStep === 0 && name.length < 2;

  // ── Submit ─────────────────────────────────────────────────────────────
  const onSubmit = useCallback(async (data: ProfOnboardingData) => {
    setIsSubmitting(true);
    const minDelay = new Promise<void>((r) => setTimeout(r, 1800));
    try {
      const [res] = await Promise.all([
        fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            cref: data.cref || null,
            specialty: data.specialty || null,
            city: data.city || null,
            state: data.state || null,
          }),
        }),
        minDelay,
      ]);
      if (!res.ok) throw new Error("Erro ao salvar perfil");
      router.push("/app");
      router.refresh();
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error(err?.message ?? "Erro inesperado. Tente novamente.");
    }
  }, [router]);

  // ── Navigation ─────────────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    if (currentStep === 0) {
      const valid = await trigger("name");
      if (!valid) return;
    }
    if (currentStep === TOTAL_STEPS - 1) {
      onSubmit(getValues());
      return;
    }
    setDirection("forward");
    setCurrentStep((s) => s + 1);
  }, [currentStep, trigger, getValues, onSubmit]);

  const handleSkip = useCallback(() => {
    if (currentStep === TOTAL_STEPS - 1) {
      onSubmit(getValues());
      return;
    }
    setDirection("forward");
    setCurrentStep((s) => s + 1);
  }, [currentStep, getValues, onSubmit]);

  const handleBack = useCallback(() => {
    if (currentStep === 0) { router.back(); return; }
    setDirection("back");
    setCurrentStep((s) => s - 1);
  }, [currentStep, router]);

  // ── Loading screen ──────────────────────────────────────────────────────
  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background px-8 gap-8">
        <div className="relative size-20">
          <div className="absolute inset-0 rounded-full border-[3px] border-primary/15" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-2xl font-bold tracking-tight leading-tight">
            Preparando<br />seu espaço...
          </p>
          <p className="text-base text-muted-foreground">
            Configurando tudo para você ✨
          </p>
        </div>
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="size-2 rounded-full bg-primary/40 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const stepContent: Record<number, React.ReactNode> = {
    0: <ProfNameStep />,
    1: <ProfSpecialtyStep />,
    2: <ProfLocationStep />,
  };

  const currentStepConfig = STEPS[currentStep];

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">

        {/* Progress bar */}
        <div className="relative h-1 bg-muted w-full shrink-0">
          <div
            className="absolute inset-y-0 left-0 bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Voltar"
            className="size-10 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors -ml-1 active:scale-90"
          >
            <ArrowLeft className="size-5 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            {currentStepConfig.skippable && (
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                Pular →
              </button>
            )}
            <span className="text-sm font-medium text-muted-foreground tabular-nums">
              {currentStep + 1} / {TOTAL_STEPS}
            </span>
          </div>
        </div>

        {/* Step content */}
        <div
          key={currentStep}
          className={cn(
            "flex-1 overflow-y-auto px-6 pt-8 pb-32",
            "animate-in fade-in duration-300",
            direction === "forward" ? "slide-in-from-right-4" : "slide-in-from-left-4"
          )}
        >
          {stepContent[currentStep]}
        </div>

        {/* Sticky CTA */}
        <div
          className="fixed bottom-0 left-0 right-0 px-6 pt-4 bg-background border-t border-transparent z-50"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={handleNext}
            disabled={isNextDisabled}
            className={cn(
              "w-full h-14 rounded-full font-bold text-lg",
              "transition-all duration-300",
              isNextDisabled
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.97] shadow-lg shadow-primary/25"
            )}
          >
            {currentStepConfig.cta}
          </button>
        </div>

      </div>
    </FormProvider>
  );
}
