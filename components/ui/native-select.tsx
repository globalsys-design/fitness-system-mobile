"use client";

import * as React from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Component ─────────────────────────────────────────────────────────────────

export interface NativeSelectProps extends React.ComponentProps<"select"> {
  /** Exibe spinner no lugar do ChevronDown enquanto carrega opções */
  loading?: boolean;
  /** className aplicado ao wrapper div (para controle de layout externo) */
  wrapperClassName?: string;
}

/**
 * Drop-in replacement para <Select> do Shadcn, usando a tag <select> nativa.
 * No mobile aciona o picker do SO (iOS action sheet / Android spinner).
 * Estilizado com tokens do design system — visualmente idêntico ao <Input>.
 *
 * @example — controlled
 * <NativeSelect value={state} onChange={(e) => setState(e.target.value)}>
 *   <option value="">Selecione</option>
 *   {UFS.map(({ sigla, nome }) => <option key={sigla} value={sigla}>{nome}</option>)}
 * </NativeSelect>
 *
 * @example — com loading
 * <NativeSelect loading={isFetching} disabled={!uf}>
 *   ...
 * </NativeSelect>
 */
const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, loading, wrapperClassName, disabled, children, ...props }, ref) => {
    return (
      <div className={cn("relative", wrapperClassName)}>
        <select
          ref={ref}
          disabled={disabled || loading}
          className={cn(
            // Base — espelha o shadcn <Input>
            "flex h-10 w-full rounded-md border border-input bg-background",
            "px-3 py-2 pr-9",
            "text-sm ring-offset-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Esconde seta nativa do browser — a nossa fica à direita
            "appearance-none cursor-pointer",
            className
          )}
          {...props}
        >
          {children}
        </select>

        {/* Ícone decorativo — pointer-events-none para não bloquear clique */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </span>
      </div>
    );
  }
);

NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
