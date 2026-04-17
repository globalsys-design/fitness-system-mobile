"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { assistantSchema, type AssistantFormData } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { unMaskPhone } from "@/components/ui/phone-input";
import { unMaskCpf } from "@/components/ui/cpf-input";

import { AssistantNameStep } from "./steps/AssistantNameStep";
import { AssistantContactStep } from "./steps/AssistantContactStep";
import { AssistantAddressStep } from "./steps/AssistantAddressStep";
import { AssistantProfessionStep } from "./steps/AssistantProfessionStep";
import {
  AssistantPermissionsStep,
  EMPTY_CRUD,
  FULL_CRUD,
  type PermissionsState,
  type ModuleKey,
  type CrudAction,
} from "./steps/AssistantPermissionsStep";
import { AssistantAccessStep } from "./steps/AssistantAccessStep";

// ── Step configuration ──────────────────────────────────────────────────────
const STEPS = [
  { id: "name",        label: "Nome",             cta: "Continuar →" },
  { id: "personal",    label: "Dados Pessoais",   cta: "Continuar →" },
  { id: "address",     label: "Endereço",         cta: "Continuar →" },
  { id: "profession",  label: "Dados Profissionais", cta: "Continuar →" },
  { id: "permissions", label: "Permissões",       cta: "Continuar →" },
  { id: "access",      label: "Acesso",           cta: "Adicionar assistente ✓" },
] as const;

const TOTAL_STEPS = STEPS.length;

// Defaults CRUD: leitura habilitada nos módulos clínicos, billing bloqueado.
// O profissional decide explicitamente sobre criar/editar/excluir.
const DEFAULT_PERMISSIONS: PermissionsState = {
  isAdmin: false,
  clients:       { ...EMPTY_CRUD, view: true },
  assessments:   { ...EMPTY_CRUD, view: true },
  prescriptions: { ...EMPTY_CRUD, view: true },
  calendar:      { ...EMPTY_CRUD, view: true },
  billing:       { ...EMPTY_CRUD },
};

// ── Component ───────────────────────────────────────────────────────────────
export function AssistantOnboardingFlow() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] = useState<PermissionsState>(DEFAULT_PERMISSIONS);

  const methods = useForm<AssistantFormData>({
    resolver: zodResolver(assistantSchema) as Resolver<AssistantFormData>,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      emergencyPhone: "",
      cpf: "",
      birthDate: "",
      birthCity: "",
      maritalStatus: "",
      profession: "",
      role: "",
      status: "ACTIVE",
    },
    mode: "onChange",
  });

  const { trigger, getValues, watch } = methods;

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  // Step 0 CTA disabled until name has ≥ 2 chars
  const name = watch("name") ?? "";
  const isNextDisabled = currentStep === 0 && name.length < 2;

  // ── Permissions: master toggle (Administrador) ──────────────────────────
  const handleToggleAdmin = useCallback((isAdmin: boolean) => {
    setPermissions((prev) => ({ ...prev, isAdmin }));
  }, []);

  // ── Permissions: toggle de uma ação CRUD em um módulo específico ────────
  const handleToggleAction = useCallback(
    (module: ModuleKey, action: CrudAction) => {
      setPermissions((prev) => ({
        ...prev,
        [module]: {
          ...prev[module],
          [action]: !prev[module][action],
        },
      }));
    },
    []
  );

  // ── Submission ─────────────────────────────────────────────────────────
  const onSubmit = useCallback(
    async (data: AssistantFormData) => {
      setIsSubmitting(true);
      const minDelay = new Promise<void>((resolve) => setTimeout(resolve, 1800));

      // Administrador → todos os módulos com CRUD total. Caso contrário,
      // enviamos os toggles explícitos marcados pelo profissional.
      const permissionsPayload = permissions.isAdmin
        ? {
            isAdmin: true,
            clients:       FULL_CRUD,
            assessments:   FULL_CRUD,
            prescriptions: FULL_CRUD,
            calendar:      FULL_CRUD,
            billing:       FULL_CRUD,
          }
        : {
            isAdmin: false,
            clients:       permissions.clients,
            assessments:   permissions.assessments,
            prescriptions: permissions.prescriptions,
            calendar:      permissions.calendar,
            billing:       permissions.billing,
          };

      // ── Sanitize payload ─────────────────────────────────────────────────
      // Strip masks and convert empty strings to undefined so Prisma 6
      // doesn't receive explicit `undefined` for optional fields.
      const clean = (v: string | undefined) =>
        v && v.trim() !== "" ? v.trim() : undefined;

      const payload = {
        name: data.name.trim(),
        email: data.email.trim(),
        // Strip phone masks — raw digits only
        phone:          unMaskPhone(data.phone)          || undefined,
        emergencyPhone: unMaskPhone(data.emergencyPhone) || undefined,
        // Strip CPF mask — raw digits only
        cpf:          unMaskCpf(data.cpf)   || undefined,
        birthDate:    clean(data.birthDate),
        birthCity:    clean(data.birthCity),
        maritalStatus: clean(data.maritalStatus),
        profession:   clean(data.profession),
        role:         clean(data.role),
        status:       data.status,
        // Only send password when toggle was ON and length ≥ 8
        password: data.password && data.password.length >= 8 ? data.password : undefined,
        // Address: only if user filled at least one field
        address: data.address,
        permissions: permissionsPayload,
      };

      console.debug("[AssistantOnboardingFlow] payload:", payload);

      try {
        const [response] = await Promise.all([
          fetch("/api/assistants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
          minDelay,
        ]);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.error("[AssistantOnboardingFlow] API error:", errData);

          let errorMessage = "Erro ao criar assistente";
          if (typeof errData?.message === "string") {
            errorMessage = errData.message;
          } else if (typeof errData?.error === "string") {
            errorMessage = errData.error;
          } else if (errData?.error?.fieldErrors) {
            const firstErrors = Object.values(
              errData.error.fieldErrors as Record<string, string[]>
            ).flat();
            if (firstErrors.length > 0) errorMessage = firstErrors[0];
          } else if (typeof errData?.debug === "string") {
            // Dev-mode detail surfaced by the API
            errorMessage = errData.debug;
          }
          throw new Error(errorMessage);
        }

        const assistant = await response.json();
        router.push(`/app/usuarios/assistentes/${assistant.id}`);
      } catch (error: unknown) {
        setIsSubmitting(false);
        console.error("[AssistantOnboardingFlow] catch:", error);
        toast.error(error instanceof Error ? error.message : "Erro inesperado. Tente novamente.");
      }
    },
    [router, permissions]
  );

  // ── Navigation ──────────────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    const stepId = STEPS[currentStep]?.id;

    if (stepId === "name") {
      const valid = await trigger("name");
      if (!valid) return;
    } else if (stepId === "personal") {
      const valid = await trigger("email");
      if (!valid) return;
    } else if (stepId === "access") {
      // Last step: submit
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
    1: <AssistantContactStep />,
    2: <AssistantAddressStep />,
    3: <AssistantProfessionStep />,
    4: (
      <AssistantPermissionsStep
        permissions={permissions}
        onToggleAdmin={handleToggleAdmin}
        onToggleAction={handleToggleAction}
      />
    ),
    5: <AssistantAccessStep />,
  };

  // ── Main layout ─────────────────────────────────────────────────────────
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
