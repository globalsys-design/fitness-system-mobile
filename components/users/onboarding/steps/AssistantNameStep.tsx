"use client";

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

// Uses AssistantFormData shape (name field)
export function AssistantNameStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<{ name: string }>();

  const name = watch("name") ?? "";

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Como se chama<br />o seu assistente?
        </h1>
        <p className="text-base text-muted-foreground">
          Nome completo para identificação no sistema
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="text"
          autoFocus
          autoComplete="name"
          autoCapitalize="words"
          placeholder="Nome do assistente"
          className={cn(
            "w-full bg-transparent border-0 border-b-2 rounded-none px-0 py-3",
            "text-[1.6rem] font-medium leading-tight",
            "placeholder:text-muted-foreground/35 placeholder:font-normal",
            "focus:outline-none transition-colors duration-200",
            errors.name
              ? "border-destructive caret-destructive"
              : name.length >= 2
              ? "border-primary caret-primary"
              : "border-border caret-primary focus:border-primary"
          )}
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-sm text-destructive animate-in fade-in duration-200">
            {(errors.name as any).message}
          </p>
        ) : name.length >= 2 ? (
          <p className="text-sm text-primary animate-in fade-in duration-200">
            Ótimo nome! 👋
          </p>
        ) : null}
      </div>
    </div>
  );
}
