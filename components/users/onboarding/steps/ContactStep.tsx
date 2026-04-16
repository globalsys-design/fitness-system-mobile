"use client";

import { useFormContext } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClientFormData } from "@/lib/validations/client";
import { DDI_OPTIONS } from "@/lib/validations/client";
import { cn } from "@/lib/utils";
import { maskPhone } from "@/components/ui/phone-input";

export function ContactStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ClientFormData>();

  const phoneDdi = watch("phoneDdi") ?? "+55";
  const email = watch("email") ?? "";
  const phone = watch("phone") ?? "";

  return (
    <div className="flex flex-col gap-10">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Para onde enviamos<br />o plano?
        </h1>
        <p className="text-base text-muted-foreground">
          Email e telefone do cliente
        </p>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-8">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Email
          </label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="cliente@email.com"
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
          {errors.email && (
            <p className="text-sm text-destructive animate-in fade-in duration-200">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Telefone
          </label>
          <div
            className={cn(
              "flex items-center gap-1 border-b-2 pb-3 transition-colors duration-200",
              phone.length > 0 ? "border-primary" : "border-border focus-within:border-primary"
            )}
          >
            {/* DDI Selector */}
            <Select
              value={phoneDdi}
              onValueChange={(v) => setValue("phoneDdi", v)}
            >
              <SelectTrigger className="border-0 bg-transparent h-auto p-0 w-20 shrink-0 focus:ring-0 shadow-none text-muted-foreground font-medium text-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DDI_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-muted-foreground/40 text-xl font-light">|</span>

            <input
              type="tel"
              inputMode="tel"
              placeholder="(00) 00000-0000"
              className={cn(
                "flex-1 bg-transparent border-0 rounded-none px-2",
                "text-xl font-medium placeholder:text-muted-foreground/35",
                "focus:outline-none"
              )}
              value={maskPhone(phone)}
              onChange={(e) =>
                setValue("phone", maskPhone(e.target.value), { shouldValidate: true })
              }
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive animate-in fade-in duration-200">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Info tip */}
      <div className="flex items-start gap-3 bg-muted/40 rounded-2xl px-4 py-3.5">
        <span className="text-lg mt-0.5 shrink-0">💡</span>
        <p className="text-sm text-muted-foreground leading-relaxed">
          O email será usado para enviar o acesso à área do cliente.
          Pode ser preenchido depois no perfil.
        </p>
      </div>
    </div>
  );
}
