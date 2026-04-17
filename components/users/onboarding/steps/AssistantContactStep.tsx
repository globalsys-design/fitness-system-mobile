"use client";

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { maskPhone } from "@/components/ui/phone-input";
import { maskCpf } from "@/components/ui/cpf-input";
import type { AssistantFormData } from "@/lib/validations";

const FIELD_CLASS = cn(
  "w-full bg-transparent border-0 border-b-2 border-border rounded-none px-0 py-3",
  "text-xl font-medium placeholder:text-muted-foreground/35",
  "focus:outline-none focus:border-primary transition-colors duration-200 caret-primary"
);

const FIELD_CLASS_ERROR = cn(
  "w-full bg-transparent border-0 border-b-2 border-destructive rounded-none px-0 py-3",
  "text-xl font-medium placeholder:text-muted-foreground/35",
  "focus:outline-none focus:border-destructive transition-colors duration-200 caret-destructive"
);

const LABEL_CLASS =
  "text-xs font-semibold text-muted-foreground uppercase tracking-widest";

const MARITAL_STATUS_OPTIONS = [
  { value: "single",   label: "Solteiro(a)" },
  { value: "married",  label: "Casado(a)" },
  { value: "divorced", label: "Divorciado(a)" },
  { value: "widowed",  label: "Viúvo(a)" },
  { value: "other",    label: "Outro" },
];

export function AssistantContactStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<AssistantFormData>();

  const email          = watch("email") ?? "";
  const phone          = watch("phone") ?? "";
  const emergencyPhone = watch("emergencyPhone") ?? "";
  const cpf            = watch("cpf") ?? "";
  const maritalStatus  = watch("maritalStatus");

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Dados<br />pessoais
        </h1>
        <p className="text-base text-muted-foreground">
          Email obrigatório para o acesso ao sistema
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* ── Email — obrigatório ── */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>
            Email <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            placeholder="assistente@email.com"
            className={errors.email ? FIELD_CLASS_ERROR : cn(FIELD_CLASS, email.length > 0 && "border-primary")}
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-sm text-destructive animate-in fade-in duration-200">
              {errors.email.message}
            </p>
          ) : email.length > 4 ? (
            <p className="text-sm text-primary animate-in fade-in duration-200">
              Convite de acesso será enviado para este email ✉️
            </p>
          ) : null}
        </div>

        {/* ── Telefone principal ── */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>
            Telefone <span className="text-muted-foreground/50 normal-case font-normal">(opcional)</span>
          </label>
          <input
            type="tel"
            inputMode="tel"
            placeholder="(00) 00000-0000"
            className={cn(FIELD_CLASS, phone.length > 0 && "border-primary")}
            value={maskPhone(phone)}
            onChange={(e) => setValue("phone", maskPhone(e.target.value))}
          />
        </div>

        {/* ── Telefone de emergência ── */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>
            Tel. emergência <span className="text-muted-foreground/50 normal-case font-normal">(opcional)</span>
          </label>
          <input
            type="tel"
            inputMode="tel"
            placeholder="(00) 00000-0000"
            className={cn(FIELD_CLASS, emergencyPhone.length > 0 && "border-primary")}
            value={maskPhone(emergencyPhone)}
            onChange={(e) => setValue("emergencyPhone", maskPhone(e.target.value))}
          />
        </div>

        {/* ── CPF ── */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>
            CPF <span className="text-muted-foreground/50 normal-case font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            className={cn(FIELD_CLASS, cpf.length > 0 && "border-primary")}
            value={maskCpf(cpf)}
            onChange={(e) => setValue("cpf", maskCpf(e.target.value))}
          />
        </div>

        {/* ── Data de nascimento ── */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>
            Data de nascimento <span className="text-muted-foreground/50 normal-case font-normal">(opcional)</span>
          </label>
          <input
            type="date"
            className={FIELD_CLASS}
            {...register("birthDate")}
          />
        </div>

        {/* ── Cidade natal ── */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>
            Cidade natal <span className="text-muted-foreground/50 normal-case font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            placeholder="Ex: São Paulo, SP"
            className={FIELD_CLASS}
            {...register("birthCity")}
          />
        </div>

        {/* ── Estado civil ── */}
        <div className="flex flex-col gap-3">
          <label className={LABEL_CLASS}>
            Estado civil <span className="text-muted-foreground/50 normal-case font-normal">(opcional)</span>
          </label>
          <div className="flex flex-col gap-2">
            {MARITAL_STATUS_OPTIONS.map((opt) => {
              const isSelected = maritalStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("maritalStatus", isSelected ? "" : opt.value)}
                  className={cn(
                    "w-full flex items-center px-5 py-4 rounded-2xl",
                    "border-2 text-left transition-all duration-200 active:scale-[0.98]",
                    isSelected
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-border bg-muted/40 text-foreground hover:bg-muted/70"
                  )}
                >
                  <span className="font-semibold text-base">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
