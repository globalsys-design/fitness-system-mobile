"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const OBJECTIVES = [
  {
    value: "emagrecimento",
    label: "Emagrecimento",
    desc: "Perder peso e gordura corporal",
    emoji: "🔥",
  },
  {
    value: "hipertrofia",
    label: "Hipertrofia",
    desc: "Ganhar massa muscular",
    emoji: "💪",
  },
  {
    value: "condicionamento",
    label: "Condicionamento",
    desc: "Melhorar resistência e energia",
    emoji: "⚡",
  },
  {
    value: "saude",
    label: "Saúde & Bem-estar",
    desc: "Qualidade de vida e prevenção",
    emoji: "🌿",
  },
  {
    value: "reabilitacao",
    label: "Reabilitação",
    desc: "Recuperação e mobilidade",
    emoji: "🩺",
  },
  {
    value: "performance",
    label: "Performance",
    desc: "Rendimento atlético de alto nível",
    emoji: "🏆",
  },
] as const;

interface ObjectiveStepProps {
  selectedObjective: string | null;
  onSelect: (value: string | null) => void;
}

export function ObjectiveStep({ selectedObjective, onSelect }: ObjectiveStepProps) {
  return (
    <div className="flex flex-col gap-10">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Qual o principal<br />objetivo?
        </h1>
        <p className="text-base text-muted-foreground">
          Vamos personalizar o plano do cliente
        </p>
      </div>

      {/* Rich Cards */}
      <div className="flex flex-col gap-3">
        {OBJECTIVES.map((obj) => {
          const isSelected = selectedObjective === obj.value;

          return (
            <button
              key={obj.value}
              type="button"
              onClick={() => onSelect(isSelected ? null : obj.value)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl",
                "border-2 text-left transition-all duration-200 active:scale-[0.98]",
                isSelected
                  ? "border-primary bg-primary/8"
                  : "border-border bg-muted/40 hover:bg-muted/70 hover:border-muted-foreground/30"
              )}
            >
              {/* Emoji */}
              <div
                className={cn(
                  "size-12 rounded-2xl flex items-center justify-center text-2xl shrink-0",
                  "transition-colors duration-200",
                  isSelected ? "bg-primary/15" : "bg-muted"
                )}
              >
                {obj.emoji}
              </div>

              {/* Text */}
              <div className="flex flex-col flex-1 min-w-0">
                <span
                  className={cn(
                    "font-semibold text-base leading-tight transition-colors duration-200",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {obj.label}
                </span>
                <span className="text-sm text-muted-foreground mt-0.5 leading-snug">
                  {obj.desc}
                </span>
              </div>

              {/* Check indicator */}
              <div
                className={cn(
                  "size-6 rounded-full flex items-center justify-center shrink-0",
                  "border-2 transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-border bg-transparent"
                )}
              >
                {isSelected && <Check className="size-3.5 text-primary-foreground" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
