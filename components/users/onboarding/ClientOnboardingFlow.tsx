"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { clientFormSchema, type ClientFormData } from "@/lib/validations/client";
import { cn } from "@/lib/utils";

import { NameStep } from "./steps/NameStep";
import { GenderStep } from "./steps/GenderStep";
import { ObjectiveStep } from "./steps/ObjectiveStep";
import { ContactStep } from "./steps/ContactStep";

// ── Step configuration ──────────────────────────────────────────────────────
const STEPS = [
  { id: "name",      label: "Nome",       cta: "Continuar →" },
  { id: "gender",    label: "Género",     cta: "Continuar →" },
  { id: "objective", label: "Objetivo",   cta: "Continuar →" },
  { id: "contact",   label: "Contacto",   cta: "Criar conta ✓" },
] as const;

const TOTAL_STEPS = STEPS.length;

// ── Component ───────────────────────────────────────────────────────────────
export function ClientOnboardingFlow() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Objective is local UI state — not persisted to client model (set later via assessment)
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);

  const methods = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      phoneDdi: "+55",
      cpf: "",
      birthDate: "",
      gender: "",
      maritalStatus: "",
      ethnicity: "",
      healthInsurance: "",
      emergencyPhone: "",
      profession: "",
      status: "ACTIVE",
    },
    mode: "onChange",
  });

  const { trigger, getValues, watch } = methods;

  // Progress fills proportionally as steps advance
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  // Step 0 CTA is disabled until name has ≥ 2 chars
  const name = watch("name") ?? "";
  const isNextDisabled = currentStep === 0 && name.length < 2;

  // ── Submission ─────────────────────────────────────────────────────────────
  const onSubmit = useCallback(
    async (data: ClientFormData) => {
      setIsSubmitting(true);

      // Promise that resolves after minimum "ilusão de trabalho" time
      const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 1800));

      try {
        const [response] = await Promise.all([
          fetch("/api/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }),
          minDelay,
        ]);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.message || "Erro ao criar cliente");
        }

        const client = await response.json();
        router.push(`/app/usuarios/clientes/${client.id}`);
      } catch (error: any) {
        setIsSubmitting(false);
        toast.error(error?.message || "Erro inesperado. Tente novamente.");
      }
    },
    [router]
  );

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    // Validate fields relevant to the current step
    if (currentStep === 0) {
      const valid = await trigger("name");
      if (!valid) return;
    } else if (currentStep === TOTAL_STEPS - 1) {
      // Last step: validate contact fields then submit
      const valid = await trigger(["email", "phone"] as any);
      if (!valid) return;
      onSubmit(getValues());
      return;
    }
    // Steps 1 & 2 (gender/objective) are optional — always allow advancing
    setDirection("forward");
    setCurrentStep((s) => s + 1);
  }, [currentStep, trigger, getValues, onSubmit]);

  const handleBack = useCallback(() => {
    if (currentStep === 0) {
      router.back();
      return;
    }
    setDirection("back");
    setCurrentStep((s) => s - 1);
  }, [currentStep, router]);

  // ── Loading Screen (Efeito de Ilusão de Trabalho) ──────────────────────────
  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background px-8 gap-8">
        {/* Spinner */}
        <div className="relative size-20">
          <div className="absolute inset-0 rounded-full border-[3px] border-primary/15" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
        </div>

        {/* Copy */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-2xl font-bold tracking-tight leading-tight">
            Ajustando o<br />seu plano...
          </p>
          <p className="text-base text-muted-foreground">
            Estamos preparando tudo para você ✨
          </p>
        </div>

        {/* Animated dots */}
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

  // ── Step content map ────────────────────────────────────────────────────────
  const stepContent: Record<number, React.ReactNode> = {
    0: <NameStep />,
    1: <GenderStep />,
    2: (
      <ObjectiveStep
        selectedObjective={selectedObjective}
        onSelect={setSelectedObjective}
      />
    ),
    3: <ContactStep />,
  };

  // ── Main layout ─────────────────────────────────────────────────────────────
  return (
    <FormProvider {...methods}>
      <div className="flex flex-col h-[100dvh] bg-background overflow-hidden">

        {/* ── Linear Progress Bar ─────────────────────────────────────────── */}
        <div className="relative h-1 bg-muted w-full shrink-0">
          <div
            className="absolute inset-y-0 left-0 bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ── Header (Back + Step Counter) ────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Voltar"
            className="size-10 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors -ml-1 active:scale-90"
          >
            <ArrowLeft className="size-5 text-foreground" />
          </button>

          <span className="text-sm font-medium text-muted-foreground tabular-nums">
            {currentStep + 1} / {TOTAL_STEPS}
          </span>
        </div>

        {/* ── Step Content (scrollable, with bottom padding for CTA) ──────── */}
        <div
          key={currentStep}
          className={cn(
            "flex-1 overflow-y-auto px-6 pt-8 pb-32",
            "animate-in fade-in duration-300",
            direction === "forward"
              ? "slide-in-from-right-4"
              : "slide-in-from-left-4"
          )}
        >
          {stepContent[currentStep]}
        </div>

        {/* ── Sticky CTA ───────────────────────────────────────────────────── */}
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
                : [
                    "bg-primary text-primary-foreground",
                    "hover:opacity-90 active:scale-[0.97]",
                    "shadow-lg shadow-primary/25",
                  ]
            )}
          >
            {STEPS[currentStep].cta}
          </button>
        </div>

      </div>
    </FormProvider>
  );
}
