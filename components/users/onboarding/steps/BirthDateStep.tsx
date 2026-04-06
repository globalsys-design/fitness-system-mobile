"use client";

import { useFormContext } from "react-hook-form";
import type { ClientFormData } from "@/lib/validations/client";
import { cn } from "@/lib/utils";

/**
 * Applies DD/MM/AAAA mask to raw numeric input.
 * Returns the masked string and the ISO date (YYYY-MM-DD) if complete.
 */
function applyDateMask(raw: string): { masked: string; iso: string | null } {
  const digits = raw.replace(/\D/g, "").slice(0, 8);

  let masked = "";
  if (digits.length > 0) masked += digits.slice(0, 2);
  if (digits.length > 2) masked += "/" + digits.slice(2, 4);
  if (digits.length > 4) masked += "/" + digits.slice(4, 8);

  let iso: string | null = null;
  if (digits.length === 8) {
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);
    iso = `${year}-${month}-${day}`;
  }

  return { masked, iso };
}

export function BirthDateStep() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ClientFormData>();

  const birthDate = watch("birthDate") ?? "";

  // Display value: convert stored ISO back to DD/MM/AAAA for display
  const displayValue = (() => {
    if (!birthDate) return "";
    // If already in DD/MM/AAAA format (during typing), return as-is
    if (birthDate.includes("/")) return birthDate;
    // If in ISO format (YYYY-MM-DD), convert to display
    const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;
    return birthDate;
  })();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { masked, iso } = applyDateMask(e.target.value);
    // Store ISO when complete, otherwise store masked for display
    setValue("birthDate", iso ?? masked, { shouldValidate: false });
  };

  const isComplete = /^\d{4}-\d{2}-\d{2}$/.test(birthDate);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Data de<br />nascimento?
        </h1>
        <p className="text-base text-muted-foreground">
          Usado para cálculos de idade e avaliação
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          type="text"
          inputMode="numeric"
          autoFocus
          placeholder="DD/MM/AAAA"
          value={displayValue}
          onChange={handleChange}
          maxLength={10}
          className={cn(
            "w-full bg-transparent border-0 border-b-2 rounded-none px-0 py-3",
            "text-[1.6rem] font-medium placeholder:text-muted-foreground/35 tabular-nums",
            "focus:outline-none transition-colors duration-200",
            errors.birthDate
              ? "border-destructive caret-destructive"
              : isComplete
              ? "border-primary caret-primary"
              : "border-border caret-primary focus:border-primary"
          )}
        />
        {errors.birthDate ? (
          <p className="text-sm text-destructive animate-in fade-in duration-200">
            {(errors.birthDate as any).message}
          </p>
        ) : isComplete ? (
          <p className="text-sm text-primary animate-in fade-in duration-200">
            Perfeito! 📅
          </p>
        ) : null}
      </div>
    </div>
  );
}
