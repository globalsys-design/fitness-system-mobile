"use client";

import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { assistantSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";

type AssistantFormData = z.infer<typeof assistantSchema>;

const FIELD_CLASS = cn(
  "w-full bg-transparent border-0 border-b-2 border-border rounded-none px-0 py-3",
  "text-xl font-medium placeholder:text-muted-foreground/35",
  "focus:outline-none focus:border-primary transition-colors duration-200 caret-primary"
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

export function AssistantPersonalDataStep() {
  const { register, watch, setValue } = useFormContext<AssistantFormData>();
  const maritalStatus = watch("maritalStatus");

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Dados pessoais<br />adicionais
        </h1>
        <p className="text-base text-muted-foreground">
          Opcional — use para registro interno
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Cidade natal */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>Cidade natal</label>
          <input
            type="text"
            placeholder="Ex: São Paulo, SP"
            className={FIELD_CLASS}
            {...register("birthCity")}
          />
        </div>

        {/* Estado civil */}
        <div className="flex flex-col gap-3">
          <label className={LABEL_CLASS}>Estado civil</label>
          <div className="flex flex-col gap-2">
            {MARITAL_STATUS_OPTIONS.map((opt) => {
              const isSelected = maritalStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setValue("maritalStatus", isSelected ? "" : opt.value)
                  }
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

      <div className="flex items-start gap-3 bg-muted/40 rounded-2xl px-4 py-3.5">
        <span className="text-lg mt-0.5 shrink-0">📋</span>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Informações usadas apenas para registro interno do profissional.
        </p>
      </div>
    </div>
  );
}
