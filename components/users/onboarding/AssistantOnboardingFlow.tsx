"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { assistantSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";

import { AssistantNameStep } from "./steps/AssistantNameStep";
import { AssistantProfessionStep } from "./steps/AssistantProfessionStep";
import { AssistantPermissionsStep, type PermissionsState } from "./steps/AssistantPermissionsStep";
import { AssistantContactStep } from "./steps/AssistantContactStep";

type AssistantFormData = z.infer<typeof assistantSchema>;

// ── Step configuration ──────────────────────────────────────────────────────
const STEPS = [
  { id: "name",        cta: "Continuar →" },
  { id: "profession",  cta: "Continuar →" },
  { id: "permissions", cta: "Continuar →" },
  { id: "contact",     cta: "Adicionar assistente ✓" },
] as const;

const TOTAL_STEPS = STEPS.length;

// Default: read+write for clinical modules, billing locked
const DEFAULT_PERMISSIONS: PermissionsState = {
  clients: true,
  assessments: true,
  prescriptions: true,
  calendar: true,
  billing: false,
};

// ── Component ───────────────────────────────────────────────────────────────
export function AssistantOnboardingFlow() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local UI state — profession and permissions are passed via separate state
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<PermissionsState>(DEFAULT_PERMISSIONS);

  const methods = useForm<AssistantFormData>({
    resolver: zodResolver(assistantSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      status: "ACTIVE",
    },
    mode: "onChange",
  });

  const { trigger, getValues, watch } = methods;

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  // Step 0 CTA disabled until name has ≥ 2 chars
  const name = watch("name") ?? "";
  const isNextDisabled = currentStep === 0 && name.length < 2;

  // ── Permissions toggle ──────────────────────────────────────────────────
  const handlePermissionToggle = useCallback((key: keyof PermissionsState) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ── Submission ─────────────────────────────────────────────────────────
  const onSubmit = useCallback(
    async (data: AssistantFormData) => {
      setIsSubmitting(true);
      const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 1800));

      // Map boolean permissions state → { read, write } shape for API
      const permissionsPayload = Object.fromEntries(
        Object.entries(permissions).map(([key, isOn]) => [
          key,
          { read: isOn, write: isOn },
        ])
      );

      try {
        const [response] = await Promise.all([
          fetch("/api/assistants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...data,
              profession: selectedProfession ?? undefined,
              permissions: permissionsPayload,
            }),
          }),
          minDelay,
        ]);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.message || "Erro ao criar assistente");
        }

        const assistant = await response.json();
        router.push(`/app/usuarios/assistentes/${assistant.id}`);
      } catch (error: any) {
        setIsSubmitting(false);
        toast.error(error?.message || "Erro inesperado. Tente novamente.");
      }
    },
    [router, selectedProfession, permissions]
  );

  // ── Navigation ──────────────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    if (currentStep === 0) {
      const valid = await trigger("name");
      if (!valid) return;
    } else if (currentStep === TOTAL_STEPS - 1) {
      const valid = await trigger("email");
      if (!valid) return;
      onSubmit(getValues());
      return;
    }
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

  // ── Loading Screen ──────────────────────────────────────────────────────
  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background px-8 gap-8">
        <div className="relative size-20">
          <div className="absolute inset-0 rounded-full border-[3px] border-primary/15" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-2xl font-bold tracking-tight leading-tight">
            Adicionando ao<br />seu time...
          </p>
          <p className="text-base text-muted-foreground">
            Configurando permissões e acesso ✨
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

  // ── Step content map ────────────────────────────────────────────────────
  const stepContent: Record<number, React.ReactNode> = {
    0: <AssistantNameStep />,
    1: (
      <AssistantProfessionStep
        selectedProfession={selectedProfession}
        onSelect={setSelectedProfession}
      />
    ),
    2: (
      <AssistantPermissionsStep
        permissions={permissions}
        onToggle={handlePermissionToggle}
      />
    ),
    3: <AssistantContactStep />,
  };

  // ── Main layout — identical Molde ───────────────────────────────────────
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

        {/* ── Header ──────────────────────────────────────────────────────── */}
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

        {/* ── Step Content ────────────────────────────────────────────────── */}
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
