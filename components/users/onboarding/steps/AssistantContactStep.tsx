"use client";

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { maskPhone } from "@/components/ui/phone-input";

// Uses a simplified shape with email (required), phone, cpf
export function AssistantContactStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<{ email: string; phone?: string; cpf?: string }>();

  const email = watch("email") ?? "";
  const phone = watch("phone") ?? "";

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Como entrar<br />em contacto?
        </h1>
        <p className="text-base text-muted-foreground">
          Email obrigatório para o acesso ao sistema
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Email — obrigatório */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Email <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            placeholder="assistente@email.com"
            className={cn(
              "w-full bg-transparent border-0 border-b-2 rounded-none px-0 py-3",
              "text-xl font-medium placeholder:text-muted-foreground/35",
              "focus:outline-none transition-colors duration-200",
              errors.email
                ? "border-destructive caret-destructive"
                : email.length > 0
                ? "border-primary caret-primary"
                : "border-border caret-primary focus:border-primary"
            )}
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-sm text-destructive animate-in fade-in duration-200">
              {(errors.email as any).message}
            </p>
          ) : email.length > 4 ? (
            <p className="text-sm text-primary animate-in fade-in duration-200">
              Convite de acesso será enviado para este email ✉️
            </p>
          ) : null}
        </div>

        {/* Telefone — opcional */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Telefone <span className="text-muted-foreground/50 normal-case font-normal">(opcional)</span>
          </label>
          <input
            type="tel"
            inputMode="tel"
            placeholder="(00) 00000-0000"
            className={cn(
              "w-full bg-transparent border-0 border-b-2 rounded-none px-0 py-3",
              "text-xl font-medium placeholder:text-muted-foreground/35",
              "focus:outline-none transition-colors duration-200",
              phone.length > 0
                ? "border-primary caret-primary"
                : "border-border caret-primary focus:border-primary"
            )}
            value={maskPhone(phone)}
            onChange={(e) => setValue("phone", maskPhone(e.target.value))}
          />
        </div>

        {/* CPF — opcional */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            CPF <span className="text-muted-foreground/50 normal-case font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            className={cn(
              "w-full bg-transparent border-0 border-b-2 rounded-none px-0 py-3",
              "text-xl font-medium placeholder:text-muted-foreground/35",
              "focus:outline-none transition-colors duration-200",
              "border-border caret-primary focus:border-primary"
            )}
            {...register("cpf")}
          />
        </div>
      </div>
    </div>
  );
}
