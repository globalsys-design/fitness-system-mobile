"use client";

import { useFormContext } from "react-hook-form";
import type { ClientFormData } from "@/lib/validations/client";
import { cn } from "@/lib/utils";

export function NameStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ClientFormData>();

  const name = watch("name") ?? "";

  return (
    <div className="flex flex-col gap-10">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Como podemos<br />te chamar?
        </h1>
        <p className="text-base text-muted-foreground">
          Digite o nome completo do cliente
        </p>
      </div>

      {/* Input minimalista — apenas borda inferior */}
      <div className="flex flex-col gap-2">
        <input
          type="text"
          autoFocus
          autoComplete="name"
          autoCapitalize="words"
          placeholder="Nome completo"
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
            {errors.name.message}
          </p>
        ) : name.length >= 2 ? (
          <p className="text-sm text-primary animate-in fade-in duration-200">
            Ótimo! 👋
          </p>
        ) : null}
      </div>
    </div>
  );
}
