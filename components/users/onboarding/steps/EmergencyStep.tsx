"use client";

import { useFormContext } from "react-hook-form";
import type { ClientFormData } from "@/lib/validations/client";
import { cn } from "@/lib/utils";

const FIELD_CLASS = cn(
  "w-full bg-transparent border-0 border-b-2 border-border rounded-none px-0 py-3",
  "text-xl font-medium placeholder:text-muted-foreground/35",
  "focus:outline-none focus:border-primary transition-colors duration-200 caret-primary"
);

const LABEL_CLASS =
  "text-xs font-semibold text-muted-foreground uppercase tracking-widest";

const RELATIONSHIP_OPTIONS = [
  { value: "conjuge", label: "Cônjuge / Parceiro(a)" },
  { value: "pai_mae", label: "Pai / Mãe" },
  { value: "filho_filha", label: "Filho(a)" },
  { value: "irmao_irma", label: "Irmão / Irmã" },
  { value: "amigo", label: "Amigo(a)" },
  { value: "outro", label: "Outro" },
];

export function EmergencyStep() {
  const { register } = useFormContext<ClientFormData>();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Contato de<br />emergência
        </h1>
        <p className="text-base text-muted-foreground">
          Quem acionar em caso de necessidade — opcional
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Nome */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>Nome completo</label>
          <input
            type="text"
            placeholder="Nome do contato"
            autoComplete="name"
            className={FIELD_CLASS}
            {...register("emergency.name")}
          />
        </div>

        {/* Parentesco */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>Parentesco</label>
          <select
            className={cn(FIELD_CLASS, "appearance-none")}
            {...register("emergency.notes")}
          >
            <option value="">Selecionar...</option>
            {RELATIONSHIP_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Celular */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>Celular</label>
          <input
            type="tel"
            inputMode="tel"
            placeholder="(00) 00000-0000"
            className={FIELD_CLASS}
            {...register("emergency.phone")}
          />
        </div>

        {/* Fixo */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>Telefone fixo</label>
          <input
            type="tel"
            inputMode="tel"
            placeholder="(00) 0000-0000"
            className={FIELD_CLASS}
            {...register("emergency.landline")}
          />
        </div>
      </div>

      <div className="flex items-start gap-3 bg-muted/40 rounded-2xl px-4 py-3.5">
        <span className="text-lg mt-0.5 shrink-0">🆘</span>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Usado apenas em situações de emergência durante as sessões. Pode ser preenchido depois.
        </p>
      </div>
    </div>
  );
}
