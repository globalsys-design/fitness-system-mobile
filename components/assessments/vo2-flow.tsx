"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Bike, Footprints, StepForward } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Schema ───────────────────────────────────────────────────────────────────
const vo2FlowSchema = z.object({
  ergometer: z.enum(["TREADMILL", "CYCLE", "STEP"]),
  protocol: z.string().min(1, "Selecione um protocolo"),
  testDuration: z.string().min(1, "Informe a duracao"),
  maxHR: z.string().min(1, "Informe a FC maxima"),
  maxSpeed: z.string().optional(),
  maxIncline: z.string().optional(),
  vo2Result: z.string().optional(),
  reasonStopped: z.string().optional(),
});

type VO2FlowData = z.infer<typeof vo2FlowSchema>;

// ── Constants ────────────────────────────────────────────────────────────────
const ERGOMETERS = [
  {
    value: "TREADMILL" as const,
    label: "Esteira",
    icon: Footprints,
    description: "Protocolos em esteira rolante",
  },
  {
    value: "CYCLE" as const,
    label: "Cicloergometro",
    icon: Bike,
    description: "Bicicleta ergometrica",
  },
  {
    value: "STEP" as const,
    label: "Step",
    icon: StepForward,
    description: "Banco/degrau",
  },
];

const PROTOCOLS: Record<string, Array<{ value: string; label: string; description: string }>> = {
  TREADMILL: [
    { value: "BRUCE", label: "Bruce", description: "Incrementos a cada 3 min" },
    { value: "BALKE", label: "Balke", description: "Velocidade fixa, inclinacao progressiva" },
    { value: "ELLESTAD", label: "Ellestad", description: "Velocidade progressiva" },
    { value: "NAUGHTON", label: "Naughton", description: "Baixa intensidade inicial" },
  ],
  CYCLE: [
    { value: "ASTRAND", label: "Astrand", description: "Submaximal 6 min" },
    { value: "STORER", label: "Storer-Davis", description: "Rampa 15W/min" },
    { value: "YMCA", label: "YMCA", description: "Multistagio submaximal" },
  ],
  STEP: [
    { value: "QUEENS_COLLEGE", label: "Queens College", description: "3 min step test" },
    { value: "FOREST_SERVICE", label: "Forest Service", description: "Step 5 min" },
  ],
};

// ── Steps Config ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: "ergometer", cta: "Continuar" },
  { id: "protocol", cta: "Continuar" },
  { id: "data", cta: "Salvar Teste" },
] as const;

// ── Step 1: Ergometer ────────────────────────────────────────────────────────
function ErgometerStep() {
  const { watch, setValue } = useFormContext<VO2FlowData>();
  const selected = watch("ergometer");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Ergometro
        </h1>
        <p className="text-base text-muted-foreground">
          Selecione o equipamento utilizado
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {ERGOMETERS.map((erg) => {
          const isActive = selected === erg.value;
          const Icon = erg.icon;
          return (
            <button
              key={erg.value}
              type="button"
              onClick={() => {
                setValue("ergometer", erg.value);
                setValue("protocol", "");
              }}
              className={cn(
                "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left",
                isActive
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border bg-card active:scale-[0.98]"
              )}
            >
              <div
                className={cn(
                  "size-14 rounded-xl flex items-center justify-center shrink-0",
                  isActive ? "bg-primary/10" : "bg-muted/50"
                )}
              >
                <Icon className={cn("size-7", isActive ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <p className={cn("font-semibold text-base", isActive ? "text-primary" : "text-foreground")}>
                  {erg.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{erg.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 2: Protocol ─────────────────────────────────────────────────────────
function ProtocolStep() {
  const { watch, setValue } = useFormContext<VO2FlowData>();
  const ergometer = watch("ergometer");
  const selected = watch("protocol");
  const protocols = PROTOCOLS[ergometer] ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Protocolo
        </h1>
        <p className="text-base text-muted-foreground">
          Escolha o protocolo de teste
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {protocols.map((proto) => {
          const isActive = selected === proto.value;
          return (
            <button
              key={proto.value}
              type="button"
              onClick={() => setValue("protocol", proto.value)}
              className={cn(
                "flex flex-col gap-1 p-5 rounded-2xl border-2 transition-all text-left",
                isActive
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border bg-card active:scale-[0.98]"
              )}
            >
              <p className={cn("font-semibold text-base", isActive ? "text-primary" : "text-foreground")}>
                {proto.label}
              </p>
              <p className="text-xs text-muted-foreground">{proto.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 3: Data Input ───────────────────────────────────────────────────────
function DataStep() {
  const { watch, setValue } = useFormContext<VO2FlowData>();

  const fields = [
    { key: "testDuration", label: "Duracao do teste", unit: "min:seg", placeholder: "12:30", required: true },
    { key: "maxHR", label: "FC Maxima", unit: "bpm", placeholder: "185", required: true },
    { key: "maxSpeed", label: "Velocidade maxima", unit: "km/h", placeholder: "16.0", required: false },
    { key: "maxIncline", label: "Inclinacao maxima", unit: "%", placeholder: "18", required: false },
    { key: "vo2Result", label: "VO2 obtido", unit: "ml/kg/min", placeholder: "42.5", required: false },
  ] as const;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Dados do teste
        </h1>
        <p className="text-base text-muted-foreground">
          Insira os resultados obtidos
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {fields.map((field) => {
          const value = watch(field.key as keyof VO2FlowData) ?? "";
          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">
                  {field.label}
                  {field.required && <span className="text-destructive ml-0.5">*</span>}
                </label>
                <span className="text-xs text-muted-foreground">{field.unit}</span>
              </div>
              <input
                inputMode="decimal"
                type="tel"
                value={value}
                onChange={(e) => setValue(field.key as keyof VO2FlowData, e.target.value)}
                placeholder={field.placeholder}
                className={cn(
                  "h-14 text-2xl text-center font-bold tabular-nums",
                  "bg-muted/30 border-2 rounded-xl px-4",
                  "text-foreground placeholder:text-muted-foreground/30",
                  "focus:outline-none transition-all duration-200",
                  value
                    ? "border-primary focus:border-primary"
                    : "border-border focus:border-primary"
                )}
              />
            </div>
          );
        })}

        {/* Reason stopped */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Motivo da interrupcao (opcional)
          </label>
          <input
            value={watch("reasonStopped") ?? ""}
            onChange={(e) => setValue("reasonStopped", e.target.value)}
            placeholder="Ex: Fadiga muscular"
            className="h-14 bg-muted/30 border-2 border-border rounded-xl px-4 text-base text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Flow ────────────────────────────────────────────────────────────────
interface VO2FlowProps {
  assessmentId: string;
  onClose: () => void;
  onSave?: () => void;
}

export function VO2Flow({ assessmentId, onClose, onSave }: VO2FlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<VO2FlowData>({
    resolver: zodResolver(vo2FlowSchema),
    defaultValues: {
      ergometer: "TREADMILL",
      protocol: "",
      testDuration: "",
      maxHR: "",
      maxSpeed: "",
      maxIncline: "",
      vo2Result: "",
      reasonStopped: "",
    },
    mode: "onChange",
  });

  const { watch, getValues, trigger } = methods;
  const ergometer = watch("ergometer");
  const protocol = watch("protocol");
  const testDuration = watch("testDuration");
  const maxHR = watch("maxHR");

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const isNextDisabled =
    (currentStep === 1 && !protocol);

  // Submit
  const onSubmit = useCallback(
    async (data: VO2FlowData) => {
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/assessments/${assessmentId}/fitness-tests`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vo2Max: {
              ergometer: data.ergometer,
              protocol: data.protocol,
              testDuration: data.testDuration,
              maxHR: data.maxHR,
              maxSpeed: data.maxSpeed || null,
              maxIncline: data.maxIncline || null,
              vo2Result: data.vo2Result || null,
              reasonStopped: data.reasonStopped || null,
            },
          }),
        });

        if (!res.ok) throw new Error("Erro ao salvar teste");

        toast.success("Teste VO2 salvo!");
        onSave?.();
        onClose();
        router.refresh();
      } catch {
        toast.error("Erro ao salvar teste");
        setIsSubmitting(false);
      }
    },
    [assessmentId, onClose, onSave, router]
  );

  const handleNext = useCallback(async () => {
    if (currentStep === STEPS.length - 1) {
      const data = getValues();
      if (!data.testDuration || !data.maxHR) {
        toast.error("Preencha duracao e FC maxima");
        return;
      }
      onSubmit(data);
      return;
    }
    setDirection("forward");
    setCurrentStep((s) => s + 1);
  }, [currentStep, getValues, onSubmit]);

  const handleBack = useCallback(() => {
    if (currentStep === 0) {
      onClose();
      return;
    }
    setDirection("back");
    setCurrentStep((s) => s - 1);
  }, [currentStep, onClose]);

  // Loading
  if (isSubmitting) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background gap-6">
        <div className="relative size-16">
          <div className="absolute inset-0 rounded-full border-[3px] border-primary/15" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-lg font-bold text-foreground">Salvando teste...</p>
      </div>
    );
  }

  const stepContent: Record<number, React.ReactNode> = {
    0: <ErgometerStep />,
    1: <ProtocolStep />,
    2: <DataStep />,
  };

  return (
    <FormProvider {...methods}>
      <div
        className="fixed inset-0 z-[60] flex flex-col bg-background overflow-hidden"
        style={{ height: "100dvh" }}
      >
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
            className="size-10 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors -ml-1 active:scale-90"
          >
            <ArrowLeft className="size-5 text-foreground" />
          </button>
          <span className="text-sm font-medium text-muted-foreground tabular-nums">
            {currentStep + 1} / {STEPS.length}
          </span>
        </div>

        {/* Content */}
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
              "w-full h-14 rounded-full font-bold text-lg transition-all duration-300",
              isNextDisabled
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.97] shadow-lg shadow-primary/25"
            )}
          >
            {STEPS[currentStep].cta}
          </button>
        </div>
      </div>
    </FormProvider>
  );
}
