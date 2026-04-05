"use client";

import { Check } from "lucide-react";
import { PROFESSIONS } from "@/lib/constants/professions";
import { cn } from "@/lib/utils";

const PROFESSION_META: Record<string, string> = {
  Médico: "🩺",
  Nutricionista: "🥗",
  Fisioterapeuta: "🦴",
  "Educador Físico": "🏋️",
  Estagiário: "📚",
  Outro: "✨",
};

interface AssistantProfessionStepProps {
  selectedProfession: string | null;
  onSelect: (value: string | null) => void;
}

export function AssistantProfessionStep({
  selectedProfession,
  onSelect,
}: AssistantProfessionStepProps) {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Qual a<br />profissão?
        </h1>
        <p className="text-base text-muted-foreground">
          Ajuda a organizar a sua equipa
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {PROFESSIONS.map((prof) => {
          const isSelected = selectedProfession === prof.value;
          const emoji = PROFESSION_META[prof.value] ?? "👤";

          return (
            <button
              key={prof.value}
              type="button"
              onClick={() => onSelect(isSelected ? null : prof.value)}
              className={cn(
                "w-full flex items-center justify-between px-5 py-4 rounded-2xl",
                "border-2 font-medium text-left text-base",
                "transition-all duration-200 active:scale-[0.98]",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "border-border bg-muted/40 text-foreground hover:bg-muted/70 hover:border-muted-foreground/30"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{emoji}</span>
                <span>{prof.label}</span>
              </div>
              <div
                className={cn(
                  "size-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                  isSelected
                    ? "border-primary-foreground bg-primary-foreground/20"
                    : "border-border"
                )}
              >
                {isSelected && (
                  <Check className="size-3 text-primary-foreground" strokeWidth={3} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Pode ser alterado depois no perfil
      </p>
    </div>
  );
}
