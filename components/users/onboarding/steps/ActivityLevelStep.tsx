"use client";

import { useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import type { ClientFormData } from "@/lib/validations/client";
import { cn } from "@/lib/utils";

const ACTIVITY_LEVELS = [
  {
    value: "sedentary",
    label: "Sedentário",
    desc: "Pouca ou nenhuma atividade física",
    emoji: "🛋️",
  },
  {
    value: "light",
    label: "Levemente ativo",
    desc: "Exercício leve 1-2x por semana",
    emoji: "🚶",
  },
  {
    value: "moderate",
    label: "Moderadamente ativo",
    desc: "Exercício moderado 3-4x por semana",
    emoji: "🏃",
  },
  {
    value: "active",
    label: "Muito ativo",
    desc: "Exercício intenso 5-6x por semana",
    emoji: "💪",
  },
  {
    value: "athlete",
    label: "Atleta",
    desc: "Treino diário de alta intensidade",
    emoji: "🏆",
  },
] as const;

export function ActivityLevelStep() {
  const { watch, setValue } = useFormContext<ClientFormData>();
  const activityLevel = watch("activityLevel");

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Qual o nível<br />de atividade?
        </h1>
        <p className="text-base text-muted-foreground">
          Ajuda a definir o ponto de partida
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {ACTIVITY_LEVELS.map((level) => {
          const isSelected = activityLevel === level.value;

          return (
            <button
              key={level.value}
              type="button"
              onClick={() =>
                setValue("activityLevel", isSelected ? "" : level.value)
              }
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl",
                "border-2 text-left transition-all duration-200 active:scale-[0.98]",
                isSelected
                  ? "border-primary bg-primary/8"
                  : "border-border bg-muted/40 hover:bg-muted/70 hover:border-muted-foreground/30"
              )}
            >
              <div
                className={cn(
                  "size-12 rounded-2xl flex items-center justify-center text-2xl shrink-0",
                  "transition-colors duration-200",
                  isSelected ? "bg-primary/15" : "bg-muted"
                )}
              >
                {level.emoji}
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <span
                  className={cn(
                    "font-semibold text-base leading-tight transition-colors duration-200",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {level.label}
                </span>
                <span className="text-sm text-muted-foreground mt-0.5 leading-snug">
                  {level.desc}
                </span>
              </div>

              <div
                className={cn(
                  "size-6 rounded-full flex items-center justify-center shrink-0",
                  "border-2 transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-border bg-transparent"
                )}
              >
                {isSelected && (
                  <Check
                    className="size-3.5 text-primary-foreground"
                    strokeWidth={3}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Pode ignorar este campo se preferir
      </p>
    </div>
  );
}
