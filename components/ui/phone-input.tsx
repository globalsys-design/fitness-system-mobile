"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

// ── Mask utility ──────────────────────────────────────────────────────────────

/**
 * Formata dígitos em (XX) XXXX-XXXX ou (XX) XXXXX-XXXX.
 * Aceita string mascarada ou bruta (só dígitos) — ambas funcionam.
 * Máximo: 11 dígitos (DDD + 9 dígitos mobile).
 */
export function maskPhone(raw: string | number | undefined | null): string {
  const d = String(raw ?? "").replace(/\D/g, "").slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  const area = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 4) return `(${area}) ${rest}`;
  if (rest.length <= 8) return `(${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  // 9 local digits → mobile format: (XX) XXXXX-XXXX
  return `(${area}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

/** Remove máscara — retorna apenas dígitos. Útil antes de persistir no DB. */
export function unMaskPhone(masked: string | undefined | null): string {
  return String(masked ?? "").replace(/\D/g, "");
}

// ── Component ─────────────────────────────────────────────────────────────────

export type PhoneInputProps = Omit<React.ComponentProps<"input">, "type">;

/**
 * Drop-in replacement para <Input type="tel">.
 * Aplica máscara (XX) XXXXX-XXXX em tempo real.
 * Compatible com react-hook-form: register() e Controller/field.onChange.
 *
 * @example — controlled (sheets, profile)
 * <PhoneInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
 *
 * @example — RHF Controller
 * <Controller name="phone" render={({ field }) => <PhoneInput {...field} />} />
 */
const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, placeholder = "(00) 00000-0000", ...props }, ref) => {
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!onChange) return;
        const masked = maskPhone(e.target.value);
        // Mutate target.value before propagating — safe pois somos os primeiros a ver o evento.
        // RHF register() e setState() leem e.target.value depois daqui.
        (e.target as EventTarget & { value: string }).value = masked;
        onChange(e);
      },
      [onChange]
    );

    return (
      <Input
        {...props}
        ref={ref}
        type="tel"
        inputMode="tel"
        placeholder={placeholder}
        // Sempre mascarar o valor exibido — handles initial load de dígitos brutos do DB
        value={value !== undefined ? maskPhone(String(value)) : undefined}
        onChange={handleChange}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
