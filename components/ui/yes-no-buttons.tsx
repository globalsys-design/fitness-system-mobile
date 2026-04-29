"use client";

/**
 * YesNoButtons — componente único do design system para perguntas Sim/Não.
 *
 * Substitui:
 *  - YesNoToggle (pill switch deslizante PAR-Q+) — manter apenas no wizard
 *    1-tela-por-pergunta, onde o switch faz sentido contextual
 *  - AnamnesisToggle — full-width 2-buttons antigo
 *  - Variantes ad-hoc espalhadas em pages
 *
 * Por que 2 botões em vez de switch:
 *  - 1 clique = decisão final, sem alternância acidental
 *  - Estado visível: usuário enxerga qual está marcado
 *  - Ideal para formulários extensos (Questionário Avançado, Framingham etc.)
 *  - Semântica radio acessível (role="radiogroup" + role="radio")
 *
 * Variants:
 *  - "default" → blocos full-width h-12 (formulários com pergunta acima)
 *  - "inline"  → compacto lado a lado (listas com pergunta na linha)
 *
 * Tom semântico:
 *  - dangerYes={true} → "Sim" pinta destructive (resposta indica risco/atenção)
 *    Ex: "Você fuma?" → Sim em vermelho
 *  - dangerYes={false} (default) → "Sim" pinta primary (resposta neutra/positiva)
 *    Ex: "Está em tratamento?" → Sim em primary
 */

import { cn } from "@/lib/utils";

export type YesNoValue = "yes" | "no" | null | undefined;

interface YesNoButtonsProps {
  value: YesNoValue;
  onChange: (next: "yes" | "no") => void;
  /** Layout — `default` (full-width) | `inline` (compacto) */
  variant?: "default" | "inline";
  /** Quando true, "Sim" assume tom destructive (resposta indica risco) */
  dangerYes?: boolean;
  /** Texto a11y descrevendo o que está sendo respondido */
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function YesNoButtons({
  value,
  onChange,
  variant = "default",
  dangerYes = false,
  ariaLabel = "Resposta",
  disabled,
  className,
}: YesNoButtonsProps) {
  const isInline = variant === "inline";

  const yesActiveCls = dangerYes
    ? "bg-destructive text-destructive-foreground border-destructive"
    : "bg-primary text-primary-foreground border-primary";

  const noActiveCls = dangerYes
    ? "bg-primary text-primary-foreground border-primary"
    : "bg-primary text-primary-foreground border-primary";

  const idleCls =
    "bg-muted text-muted-foreground border-transparent hover:bg-muted/70";

  // Mobile-first: ambos variants atendem 44px+ de altura tocável
  const sizeCls = isInline
    ? "h-11 px-4 text-xs"
    : "flex-1 h-12 px-4 text-sm";

  function handleSelect(next: "yes" | "no") {
    if (disabled) return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(8);
      } catch {
        /* noop */
      }
    }
    onChange(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "flex items-center gap-2",
        isInline ? "shrink-0" : "w-full",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === "yes"}
        disabled={disabled}
        onClick={() => handleSelect("yes")}
        className={cn(
          "rounded-xl font-semibold border",
          "transition-[background-color,color,border-color,transform] duration-150",
          "active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          sizeCls,
          value === "yes" ? yesActiveCls : idleCls
        )}
      >
        Sim
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "no"}
        disabled={disabled}
        onClick={() => handleSelect("no")}
        className={cn(
          "rounded-xl font-semibold border",
          "transition-[background-color,color,border-color,transform] duration-150",
          "active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          sizeCls,
          value === "no" ? noActiveCls : idleCls
        )}
      >
        Não
      </button>
    </div>
  );
}
