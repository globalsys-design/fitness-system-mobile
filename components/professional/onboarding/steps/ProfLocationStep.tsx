"use client";

import { useFormContext } from "react-hook-form";
import type { ProfOnboardingData } from "../ProfessionalOnboardingFlow";
import { cn } from "@/lib/utils";

export function ProfLocationStep() {
  const { watch, setValue } = useFormContext<ProfOnboardingData>();
  const city = watch("city") ?? "";
  const state = watch("state") ?? "";

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Onde você<br />atua?
        </h1>
        <p className="text-base text-muted-foreground">
          Exibido nos documentos e avaliações
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Cidade */}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-muted-foreground">Cidade</p>
          <input
            autoFocus
            value={city}
            onChange={(e) => setValue("city", e.target.value)}
            placeholder="Ex: Vitória"
            className={cn(
              "w-full bg-transparent border-0 border-b-2 rounded-none px-0 py-3",
              "text-[1.4rem] font-medium placeholder:text-muted-foreground/35",
              "focus:outline-none transition-colors duration-200",
              city
                ? "border-primary caret-primary"
                : "border-border caret-primary focus:border-primary"
            )}
          />
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-muted-foreground">Estado (UF)</p>
          <input
            value={state}
            onChange={(e) => setValue("state", e.target.value.toUpperCase().slice(0, 2))}
            placeholder="ES"
            maxLength={2}
            className={cn(
              "w-24 bg-transparent border-0 border-b-2 rounded-none px-0 py-3",
              "text-[1.4rem] font-medium uppercase placeholder:text-muted-foreground/35",
              "focus:outline-none transition-colors duration-200",
              state.length === 2
                ? "border-primary caret-primary"
                : "border-border caret-primary focus:border-primary"
            )}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Pode ignorar e preencher depois no perfil
      </p>
    </div>
  );
}
