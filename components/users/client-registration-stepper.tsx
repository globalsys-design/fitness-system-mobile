"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  MapPin,
  Shield,
  Lock,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { cn } from "@/lib/utils";
import {
  clientFormSchema,
  STEP_FIELDS,
  isMinor,
  type ClientFormData,
} from "@/lib/validations/client";

import { StepPersonal } from "./steps/step-personal";
import { StepAddress } from "./steps/step-address";
import { StepResponsible } from "./steps/step-responsible";
import { StepAccess } from "./steps/step-access";
import { StepAvailability } from "./steps/step-availability";

const STEPS = [
  { label: "Dados Pessoais", icon: User },
  { label: "Endereço", icon: MapPin },
  { label: "Responsável", icon: Shield },
  { label: "Acesso", icon: Lock },
  { label: "Disponibilidade", icon: CalendarClock },
];

/**
 * Recursively extract all error messages from react-hook-form errors object.
 */
function extractErrorMessages(errors: Record<string, any>): string[] {
  const messages: string[] = [];
  for (const key of Object.keys(errors)) {
    const err = errors[key];
    if (!err) continue;
    if (typeof err.message === "string" && err.message) {
      messages.push(err.message);
    } else if (typeof err === "object") {
      messages.push(...extractErrorMessages(err));
    }
  }
  return messages;
}

export function ClientRegistrationStepper() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
      photo: "",
      password: "",
      status: "ACTIVE",
      address: {
        cep: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
      responsible: {
        name: "",
        email: "",
        cpf: "",
        phone: "",
        profession: "",
      },
      emergency: {
        name: "",
        phone: "",
        landline: "",
        notes: "",
      },
      availability: {
        monday: { active: false },
        tuesday: { active: false },
        wednesday: { active: false },
        thursday: { active: false },
        friday: { active: false },
        saturday: { active: false },
        sunday: { active: false },
      },
    },
  });

  // ── Derived: is client a minor? ──
  const birthDate = useWatch({ control: methods.control, name: "birthDate" });
  const clientIsMinor = isMinor(birthDate);

  // Track previous minor state to clean responsible data on transition
  const prevMinorRef = useRef(clientIsMinor);
  useEffect(() => {
    if (prevMinorRef.current && !clientIsMinor) {
      // Was minor, now adult → clear responsible fields
      methods.setValue("responsible", undefined);
    }
    prevMinorRef.current = clientIsMinor;
  }, [clientIsMinor, methods]);

  const handleNext = useCallback(async () => {
    const fields = STEP_FIELDS[step];
    if (fields && fields.length > 0) {
      const isValid = await methods.trigger(fields as any);
      if (!isValid) {
        const stepErrors = fields
          .map((f) => (methods.formState.errors as any)[f]?.message)
          .filter(Boolean);
        if (stepErrors.length > 0) {
          toast.error(stepErrors[0]);
        } else {
          toast.error("Corrija os campos destacados antes de continuar.");
        }
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }, [step, methods]);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  async function onSubmit(data: ClientFormData) {
    setIsLoading(true);
    try {
      // Clean empty strings to undefined before sending
      const cleanValue = (v: string | undefined) =>
        v && v.trim() !== "" ? v.trim() : undefined;

      const payload = {
        name: data.name.trim(),
        email: cleanValue(data.email),
        phone: cleanValue(data.phone),
        phoneDdi: data.phoneDdi || "+55",
        cpf: cleanValue(data.cpf),
        birthDate: cleanValue(data.birthDate),
        gender: cleanValue(data.gender),
        ethnicity: cleanValue(data.ethnicity),
        maritalStatus: cleanValue(data.maritalStatus),
        healthInsurance: cleanValue(data.healthInsurance),
        profession: cleanValue(data.profession),
        photo: cleanValue(data.photo),
        address: data.address &&
          Object.values(data.address).some((v) => v && v.trim() !== "")
          ? data.address
          : undefined,
        responsibleContact: data.responsible &&
          Object.values(data.responsible).some((v) => v && v.trim() !== "")
          ? data.responsible
          : undefined,
        emergencyContact:
          (data.emergency &&
            Object.values(data.emergency).some((v) => v && v.trim() !== "")) ||
          data.emergencyPhone
            ? {
                ...(data.emergency || {}),
                phone: data.emergency?.phone || data.emergencyPhone || undefined,
              }
            : undefined,
        availability: data.availability || undefined,
        password: cleanValue(data.password),
        status: data.status,
      };

      console.log("[ClientRegistration] Submitting payload:", payload);

      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[ClientRegistration] Server error:", errorData);

        // Extract meaningful error from the response
        const fieldErrors = errorData.error?.fieldErrors;
        if (fieldErrors) {
          const firstFieldError = Object.entries(fieldErrors).find(
            ([, msgs]) => Array.isArray(msgs) && msgs.length > 0
          );
          if (firstFieldError) {
            toast.error(`${firstFieldError[0]}: ${(firstFieldError[1] as string[])[0]}`);
            return;
          }
        }

        toast.error(
          errorData.message || "Erro ao cadastrar cliente. Tente novamente."
        );
        return;
      }

      toast.success("Cliente cadastrado com sucesso!");
      router.push("/app/usuarios?tab=clientes");
    } catch (err) {
      console.error("[ClientRegistration] Network error:", err);
      toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleValidationError(errors: Record<string, any>) {
    console.error("[ClientRegistration] Validation errors:", errors);

    const messages = extractErrorMessages(errors);
    if (messages.length > 0) {
      // Show up to 3 errors
      const display = messages.slice(0, 3).join(" | ");
      toast.error(display);
    } else {
      toast.error("Corrija os campos obrigatórios antes de salvar.");
    }
  }

  return (
    <FormProvider {...methods}>
      <div
        className="flex flex-col bg-background"
        style={{ height: "100dvh" }}
      >
        <MobileHeader title="Novo Cliente" showBack />

        {/* ── Stepper Visual ── */}
        <div className="flex items-center px-4 py-3 gap-2 border-b border-border bg-card">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex items-center gap-2 flex-1 min-w-0"
              >
                <div
                  className={cn(
                    "flex items-center justify-center size-8 rounded-full text-xs font-semibold transition-all shrink-0",
                    i < step
                      ? "bg-primary text-primary-foreground"
                      : i === step
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {i < step ? (
                    <Check className="size-4" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 rounded-full min-w-4",
                      i < step ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step label ── */}
        <div className="px-4 pt-3">
          <p className="text-xs text-muted-foreground">
            Passo {step + 1} de {STEPS.length}
          </p>
          <p className="text-base font-semibold text-foreground mt-0.5">
            {STEPS[step].label}
          </p>
        </div>

        {/* ── Step Content ── */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
          {step === 0 && <StepPersonal />}
          {step === 1 && <StepAddress />}
          {step === 2 && <StepResponsible isMinor={clientIsMinor} />}
          {step === 3 && <StepAccess />}
          {step === 4 && <StepAvailability />}
        </div>

        {/* ── Bottom Action Bar — always visible, never squished ── */}
        <div
          className="flex items-center gap-3 px-4 py-4 border-t border-border bg-background shrink-0"
          style={{
            paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
          }}
        >
          {step > 0 && (
            <Button
              variant="outline"
              className="h-12 flex-1"
              onClick={handleBack}
            >
              <ChevronLeft className="size-4 mr-1" />
              Voltar
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button className="h-12 flex-1" onClick={handleNext}>
              Continuar
              <ChevronRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="h-12 flex-1"
              onClick={methods.handleSubmit(
                onSubmit as any,
                handleValidationError
              )}
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Salvar cliente
            </Button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
