"use client";

/**
 * YesNoToggle — pill deslizante mobile-first reproduzindo o Figma do PAR-Q+.
 *
 * Design:
 *  - Container 72×32 (touch area 44px via padding externo no parent).
 *  - Bolinha 24×24 desliza horizontalmente: esquerda = Não (muted),
 *    direita = Sim (primary/ciano).
 *  - Label "Sim"/"Não" vazada do lado oposto à bolinha.
 *  - Transição 260ms cubic-bezier(0.2, 0.8, 0.2, 1) para o desliza.
 *  - aria-pressed reflete "sim".
 *  - Toque em qualquer parte do toggle alterna; NÃO auto-avança — a navegação
 *    é explícita via "Próximo" (modelo Figma).
 */

import { cn } from "@/lib/utils";
import type { ParqAnswer } from "@/lib/data/parq-plus";

interface YesNoToggleProps {
  value: ParqAnswer;
  onChange: (next: "yes" | "no") => void;
  /** Label acessível; default "Resposta" */
  ariaLabel?: string;
  disabled?: boolean;
}

export function YesNoToggle({
  value,
  onChange,
  ariaLabel = "Resposta",
  disabled,
}: YesNoToggleProps) {
  const isYes = value === "yes";
  const isNo = value === "no";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isYes}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(isYes ? "no" : "yes")}
      className={cn(
        // Touch area: container 72×32 com padding externo de 6px = 44×44 hit area
        "relative inline-flex items-center shrink-0",
        "h-8 w-[72px] rounded-full p-0.5",
        "transition-colors duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isYes
          ? "bg-primary/90 shadow-[0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.4),0_8px_16px_-8px_oklch(from_var(--color-primary)_l_c_h/0.5)]"
          : isNo
          ? "bg-muted"
          : "bg-muted/60",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Label "Sim" / "Não" — fica do lado oposto à bolinha */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 flex items-center pointer-events-none",
          "text-[11px] font-semibold tabular-nums",
          "transition-[color,padding] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          isYes
            ? "justify-start pl-3 text-primary-foreground"
            : "justify-end pr-3 text-muted-foreground"
        )}
      >
        {isYes ? "Sim" : "Não"}
      </span>

      {/* Bolinha */}
      <span
        aria-hidden="true"
        className={cn(
          "relative z-10 block h-7 w-7 rounded-full bg-background shadow-md",
          "transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          isYes ? "translate-x-[40px]" : "translate-x-0"
        )}
      />
    </button>
  );
}
