"use client";

/**
 * MultiChoiceChips — componente único do design system para MULTI-CHOICE.
 *
 * Diferença visual em relação a <RadioPills /> (single):
 *  - Forma `rounded-xl` (12px) — cantos visíveis = "chip" não "pílula"
 *    Sinal pré-atentivo de "selecione várias"
 *  - Ícone <Check /> dentro do chip quando selecionado (h-4 w-4 strokeWidth=3)
 *  - Helper text default "Selecione todas que se aplicam" (sempre visível)
 *  - role="checkbox" individual em cada chip (semântica correta para multi)
 *
 * Mobile-first (idêntico ao RadioPills):
 *  - 44px altura (Apple HIG / Material)
 *  - gap 10px entre chips (mistap protection)
 *  - active:scale-[0.96] — feedback tátil instantâneo
 *  - haptic opt-in via navigator.vibrate(8)
 *
 * Importante: Não usar para confirmações isoladas (Termos, etc.) — ali
 * use o <Checkbox /> quadrado padrão. Este componente é específico para
 * "selecione N de M opções relacionadas".
 */

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultiChoiceOption {
  value: string;
  label: string;
}

interface MultiChoiceChipsProps {
  options: readonly MultiChoiceOption[];
  /** Array com os valores selecionados. */
  values: string[];
  onChange: (next: string[]) => void;
  ariaLabel: string;
  /**
   * Texto orientativo abaixo do grupo. Default: "Selecione todas que se
   * aplicam". Passe `null` para esconder.
   */
  helperText?: string | null;
  disabled?: boolean;
  className?: string;
}

export function MultiChoiceChips({
  options,
  values,
  onChange,
  ariaLabel,
  helperText = "Selecione todas que se aplicam",
  disabled,
  className,
}: MultiChoiceChipsProps) {
  function toggle(v: string) {
    if (disabled) return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(8);
      } catch {
        /* noop */
      }
    }
    const set = new Set(values);
    if (set.has(v)) set.delete(v);
    else set.add(v);
    onChange(Array.from(set));
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        role="group"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        className={cn(
          "flex flex-wrap gap-2.5",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        {options.map((opt) => {
          const selected = values.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              role="checkbox"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => toggle(opt.value)}
              className={cn(
                // Hit area mobile-safe: 44px altura
                "inline-flex items-center justify-center gap-1.5 h-11 px-4",
                "rounded-xl text-sm font-semibold border",
                "transition-[background-color,color,border-color,transform] duration-150",
                "active:scale-[0.96]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                selected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-transparent hover:bg-muted/70"
              )}
            >
              {selected && (
                <Check
                  className="h-4 w-4 shrink-0"
                  strokeWidth={3}
                  aria-hidden
                />
              )}
              <span className="truncate">{opt.label}</span>
            </button>
          );
        })}
      </div>
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
