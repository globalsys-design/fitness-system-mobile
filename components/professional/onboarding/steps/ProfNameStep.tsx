"use client";

import { useFormContext } from "react-hook-form";
import type { ProfOnboardingData } from "../ProfessionalOnboardingFlow";
import { cn } from "@/lib/utils";

export function ProfNameStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ProfOnboardingData>();

  const name = watch("name") ?? "";
  const cref = watch("cref") ?? "";

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Como posso<br />te chamar?
        </h1>
        <p className="text-base text-muted-foreground">
          Seu nome aparecerá nos documentos gerados
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Nome */}
        <div className="flex flex-col gap-1.5">
          <input
            {...register("name")}
            autoFocus
            placeholder="Seu nome completo"
            className={cn(
              "w-full bg-transparent border-0 border-b-2 rounded-none px-0 py-3",
              "text-[1.6rem] font-medium placeholder:text-muted-foreground/35",
              "focus:outline-none transition-colors duration-200",
              errors.name
                ? "border-destructive caret-destructive"
                : name.length >= 2
                ? "border-primary caret-primary"
                : "border-border caret-primary focus:border-primary"
            )}
          />
          {name.length >= 2 && !errors.name && (
            <p className="text-sm text-primary animate-in fade-in duration-200">
              Olá, {name.split(" ")[0]}! 👋
            </p>
          )}
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* CREF */}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-muted-foreground">
            CREF (opcional)
          </p>
          <input
            {...register("cref")}
            placeholder="Ex: 012345-G/SP"
            className={cn(
              "w-full bg-transparent border-0 border-b-2 rounded-none px-0 py-2",
              "text-lg font-medium placeholder:text-muted-foreground/35 uppercase",
              "focus:outline-none transition-colors duration-200",
              cref
                ? "border-primary caret-primary"
                : "border-border caret-primary focus:border-primary"
            )}
          />
          <p className="text-xs text-muted-foreground">
            Exibido no rodapé das prescrições em PDF
          </p>
        </div>
      </div>
    </div>
  );
}
