"use client";

import { useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import type { ProfOnboardingData } from "../ProfessionalOnboardingFlow";
import { cn } from "@/lib/utils";

const SPECIALTIES = [
  { value: "personal_trainer", label: "Personal Trainer", desc: "Treinos individuais e grupos", emoji: "🏃" },
  { value: "musculacao",       label: "Musculação",        desc: "Força, hipertrofia e powerlifting", emoji: "🏋️" },
  { value: "esportes_combate", label: "Esportes de Combate", desc: "Luta, boxe, MMA", emoji: "🥊" },
  { value: "aquaticos",        label: "Natação / Aquáticos", desc: "Natação, polo aquático, hydrofit", emoji: "🏊" },
  { value: "pilates_func",     label: "Pilates / Funcional", desc: "Pilates, yoga, treinamento funcional", emoji: "🧘" },
] as const;

export function ProfSpecialtyStep() {
  const { watch, setValue } = useFormContext<ProfOnboardingData>();
  const specialty = watch("specialty");

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Qual a sua<br />especialidade?
        </h1>
        <p className="text-base text-muted-foreground">
          Personalizamos o sistema para o seu foco
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {SPECIALTIES.map((s) => {
          const isSelected = specialty === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => setValue("specialty", isSelected ? "" : s.value)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl",
                "border-2 text-left transition-all duration-200 active:scale-[0.98]",
                isSelected
                  ? "border-primary bg-primary/8"
                  : "border-border bg-muted/40 hover:bg-muted/70 hover:border-muted-foreground/30"
              )}
            >
              <div className={cn(
                "size-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-colors duration-200",
                isSelected ? "bg-primary/15" : "bg-muted"
              )}>
                {s.emoji}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className={cn(
                  "font-semibold text-base leading-tight transition-colors duration-200",
                  isSelected ? "text-primary" : "text-foreground"
                )}>{s.label}</span>
                <span className="text-sm text-muted-foreground mt-0.5 leading-snug">{s.desc}</span>
              </div>
              <div className={cn(
                "size-6 rounded-full flex items-center justify-center shrink-0",
                "border-2 transition-all duration-200",
                isSelected ? "border-primary bg-primary" : "border-border bg-transparent"
              )}>
                {isSelected && <Check className="size-3.5 text-primary-foreground" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Pode ignorar e alterar depois no perfil
      </p>
    </div>
  );
}
