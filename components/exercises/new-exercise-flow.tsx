"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Dumbbell, Wind, Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import { MUSCLE_GROUPS, EXERCISE_CATEGORIES } from "@/lib/constants/exercises";
import { cn } from "@/lib/utils";

// ── Schema ───────────────────────────────────────────────────────────────────
const newExerciseSchema = z.object({
  name: z.string().min(2, "Minimo 2 caracteres"),
  category: z.enum(["STRENGTH", "AEROBIC"]),
  muscleGroups: z.array(z.string()).min(1, "Selecione ao menos 1"),
  videoUrl: z.string().optional(),
});

type NewExerciseData = z.infer<typeof newExerciseSchema>;

// ── Steps ────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: "identity", cta: "Continuar" },
  { id: "muscles", cta: "Continuar" },
  { id: "video", cta: "Criar Exercicio" },
] as const;

// ── Step 1: Name & Category ──────────────────────────────────────────────────
function IdentityStep() {
  const { watch, setValue } = useFormContext<NewExerciseData>();
  const name = watch("name") ?? "";
  const category = watch("category");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Novo exercicio
        </h1>
        <p className="text-base text-muted-foreground">
          Nome e tipo do exercicio
        </p>
      </div>

      {/* Name input */}
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-muted-foreground">Nome</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setValue("name", e.target.value)}
          placeholder="Ex: Supino Reto"
          className={cn(
            "w-full bg-transparent border-0 border-b-2 rounded-none px-0 py-3",
            "text-[1.4rem] font-medium placeholder:text-muted-foreground/35",
            "focus:outline-none transition-colors duration-200",
            name.length >= 2
              ? "border-primary caret-primary"
              : "border-border caret-primary focus:border-primary"
          )}
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted-foreground">Categoria</p>
        <div className="grid grid-cols-2 gap-3">
          {EXERCISE_CATEGORIES.map((cat) => {
            const isActive = category === cat.value;
            const Icon = cat.value === "STRENGTH" ? Dumbbell : Wind;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setValue("category", cat.value as "STRENGTH" | "AEROBIC")}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 h-24 rounded-2xl border-2 transition-all",
                  isActive
                    ? "border-primary bg-primary/10 text-primary scale-[1.02]"
                    : "border-border bg-muted/20 text-muted-foreground active:scale-95"
                )}
              >
                <Icon className="size-7" />
                <span className="text-sm font-semibold">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Muscle Groups ────────────────────────────────────────────────────
function MusclesStep() {
  const { watch, setValue } = useFormContext<NewExerciseData>();
  const muscleGroups = watch("muscleGroups") ?? [];

  const toggle = (group: string) => {
    const next = muscleGroups.includes(group)
      ? muscleGroups.filter((g) => g !== group)
      : [...muscleGroups, group];
    setValue("muscleGroups", next);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Grupos musculares
        </h1>
        <p className="text-base text-muted-foreground">
          Selecione os musculos trabalhados
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MUSCLE_GROUPS.map((group) => {
          const isActive = muscleGroups.includes(group.value);
          return (
            <button
              key={group.value}
              type="button"
              onClick={() => toggle(group.value)}
              className={cn(
                "flex items-center gap-2 h-11 px-4 rounded-full border-2 text-sm font-medium transition-all",
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/20 text-muted-foreground active:scale-95"
              )}
            >
              {isActive && <Check className="size-4" />}
              {group.label}
            </button>
          );
        })}
      </div>

      {muscleGroups.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {muscleGroups.length} selecionado{muscleGroups.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

// ── Step 3: Video URL ────────────────────────────────────────────────────────
function VideoStep() {
  const { watch, setValue } = useFormContext<NewExerciseData>();
  const videoUrl = watch("videoUrl") ?? "";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Video demonstrativo
        </h1>
        <p className="text-base text-muted-foreground">
          Cole o link do YouTube ou Vimeo (opcional)
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="relative">
          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
          <input
            value={videoUrl}
            onChange={(e) => setValue("videoUrl", e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            inputMode="url"
            className={cn(
              "w-full h-14 bg-muted/30 border-2 rounded-xl pl-12 pr-4",
              "text-base text-foreground placeholder:text-muted-foreground/35",
              "focus:outline-none transition-all duration-200",
              videoUrl
                ? "border-primary focus:border-primary"
                : "border-border focus:border-primary"
            )}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Pode pular e adicionar depois
      </p>
    </div>
  );
}

// ── Main Flow ────────────────────────────────────────────────────────────────
interface NewExerciseFlowProps {
  onClose: () => void;
}

export function NewExerciseFlow({ onClose }: NewExerciseFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<NewExerciseData>({
    resolver: zodResolver(newExerciseSchema),
    defaultValues: {
      name: "",
      category: "STRENGTH",
      muscleGroups: [],
      videoUrl: "",
    },
    mode: "onChange",
  });

  const { trigger, getValues, watch } = methods;
  const name = watch("name") ?? "";
  const muscleGroups = watch("muscleGroups") ?? [];

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // Validation per step
  const isNextDisabled =
    (currentStep === 0 && name.length < 2) ||
    (currentStep === 1 && muscleGroups.length === 0);

  // Submit
  const onSubmit = useCallback(
    async (data: NewExerciseData) => {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            category: data.category,
            muscleGroups: data.muscleGroups,
            videoUrl: data.videoUrl || "",
          }),
        });

        if (!res.ok) throw new Error("Erro ao criar exercicio");

        toast.success("Exercicio criado!");
        onClose();
        router.refresh();
      } catch {
        toast.error("Erro ao criar exercicio");
        setIsSubmitting(false);
      }
    },
    [onClose, router]
  );

  const handleNext = useCallback(async () => {
    if (currentStep === 0) {
      const valid = await trigger(["name", "category"]);
      if (!valid) return;
    }
    if (currentStep === STEPS.length - 1) {
      onSubmit(getValues());
      return;
    }
    setDirection("forward");
    setCurrentStep((s) => s + 1);
  }, [currentStep, trigger, getValues, onSubmit]);

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
        <p className="text-lg font-bold text-foreground">Salvando exercicio...</p>
      </div>
    );
  }

  const stepContent: Record<number, React.ReactNode> = {
    0: <IdentityStep />,
    1: <MusclesStep />,
    2: <VideoStep />,
  };

  return (
    <FormProvider {...methods}>
      <div className="fixed inset-0 z-[60] flex flex-col bg-background overflow-hidden" style={{ height: "100dvh" }}>
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
