"use client";

import { useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import { PROFESSIONS } from "@/lib/constants/professions";
import { cn } from "@/lib/utils";
import type { AssistantFormData } from "@/lib/validations";

const PROFESSION_META: Record<string, string> = {
  Médico: "🩺",
  Nutricionista: "🥗",
  Fisioterapeuta: "🦴",
  "Educador Físico": "🏋️",
  Estagiário: "📚",
  Outro: "✨",
};

const FIELD_CLASS = cn(
  "w-full bg-transparent border-0 border-b-2 border-border rounded-none px-0 py-3",
  "text-xl font-medium placeholder:text-muted-foreground/35",
  "focus:outline-none focus:border-primary transition-colors duration-200 caret-primary"
);

export function AssistantProfessionStep() {
  const { watch, setValue, register } = useFormContext<AssistantFormData>();
  const profession = watch("profession");

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Dados<br />profissionais
        </h1>
        <p className="text-base text-muted-foreground">
          Ajuda a organizar a sua equipa
        </p>
      </div>

      {/* ── Profissão ── */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Profissão <span className="text-muted-foreground/50 normal-case font-normal">(opcional)</span>
        </label>
        <div className="flex flex-col gap-3">
          {PROFESSIONS.map((prof) => {
            const isSelected = profession === prof.value;
            const emoji = PROFESSION_META[prof.value] ?? "👤";

            return (
              <button
                key={prof.value}
                type="button"
                onClick={() => setValue("profession", isSelected ? "" : prof.value)}
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
      </div>

      {/* ── Cargo / Função ── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Cargo / Função <span className="text-muted-foreground/50 normal-case font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          placeholder="Ex: Assistente de avaliação, Estagiário…"
          className={FIELD_CLASS}
          {...register("role")}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Pode ser alterado depois no perfil
      </p>
    </div>
  );
}
