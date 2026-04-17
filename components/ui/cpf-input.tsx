"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

// ── Mask utility ──────────────────────────────────────────────────────────────

/**
 * Formata dígitos no padrão CPF: XXX.XXX.XXX-XX (progressivo).
 * Aceita string mascarada ou bruta (só dígitos) — idempotente.
 * Máximo: 11 dígitos.
 *
 * @example
 * maskCpf("12345")        // "123.45"
 * maskCpf("12345678901")  // "123.456.789-01"
 * maskCpf("123.456.789-01") // "123.456.789-01"
 */
export function maskCpf(raw: string | number | undefined | null): string {
  const d = String(raw ?? "").replace(/\D/g, "").slice(0, 11);
  if (!d) return "";
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Remove máscara — retorna apenas dígitos. Útil antes de persistir no DB. */
export function unMaskCpf(masked: string | undefined | null): string {
  return String(masked ?? "").replace(/\D/g, "");
}

// ── Component ─────────────────────────────────────────────────────────────────

export type CpfInputProps = Omit<React.ComponentProps<"input">, "type">;

/**
 * Drop-in replacement para <Input> de CPF.
 * Aplica máscara XXX.XXX.XXX-XX em tempo real (onChange), mantendo o cursor estável.
 * Compatible com react-hook-form: register() e Controller/field.onChange.
 * Aceita valores brutos (só dígitos) vindos do DB — converte automaticamente no display.
 *
 * @example — RHF register
 * <CpfInput {...register("cpf")} />
 *
 * @example — controlled (sheet/estado local)
 * <CpfInput value={form.cpf} onChange={(e) => set("cpf", e.target.value)} />
 *
 * @example — RHF Controller
 * <Controller name="cpf" render={({ field }) => <CpfInput {...field} value={field.value || ""} />} />
 */
const CpfInput = React.forwardRef<HTMLInputElement, CpfInputProps>(
  ({ value, onChange, placeholder = "000.000.000-00", ...props }, ref) => {
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!onChange) return;
        const masked = maskCpf(e.target.value);
        // Mutate target.value antes de propagar — RHF register() e setState() leem e.target.value aqui.
        (e.target as EventTarget & { value: string }).value = masked;
        onChange(e);
      },
      [onChange]
    );

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        autoComplete="off"
        // Sempre mascarar o valor exibido — converte dígitos brutos do DB na montagem inicial
        value={value !== undefined ? maskCpf(String(value)) : undefined}
        onChange={handleChange}
      />
    );
  }
);

CpfInput.displayName = "CpfInput";

export { CpfInput };
