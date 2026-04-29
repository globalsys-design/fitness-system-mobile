"use client";

/**
 * RadioPills — componente único do design system para SINGLE-CHOICE.
 *
 * Mobile-first specs (Apple HIG: 44pt · Material: 48dp):
 *  - Altura mínima 44px (h-11)
 *  - Padding lateral generoso (px-4)
 *  - Gap entre opções 8px (gap-2)
 *  - Forma `rounded-full` — sinal pré-atentivo de "single choice"
 *  - Sem ícone interno — só texto/cor
 *  - active:scale-[0.96] (feedback tátil instantâneo)
 *  - Haptic opt-in via navigator.vibrate(8) — degrada graciosamente em iOS
 *  - role="radiogroup" + role="radio" semanticamente corretos
 *
 * Para multi-choice, use <MultiChoiceChips /> (forma diferente: chip + check).
 *
 * Importante: Não criar variantes próprias. Esta é a fonte de verdade.
 */

import { cn } from "@/lib/utils";

export interface RadioPillsOption<T extends string = string> {
  value: T;
  label: string;
}

interface RadioPillsProps<T extends string> {
  options: readonly RadioPillsOption<T>[];
  value: T | undefined;
  onChange: (next: T) => void;
  ariaLabel: string;
  /** Texto opcional logo abaixo do grupo (ex: "Selecione uma opção"). */
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export function RadioPills<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  helperText,
  disabled,
  className,
}: RadioPillsProps<T>) {
  function handleSelect(v: T) {
    if (disabled) return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(8);
      } catch {
        /* noop — Safari iOS lança em alguns contextos */
      }
    }
    onChange(v);
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        className={cn(
          "flex flex-wrap gap-2",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => handleSelect(opt.value)}
              className={cn(
                // Hit area mobile-safe: 44px altura
                "inline-flex items-center justify-center h-11 px-4",
                "rounded-full text-sm font-semibold border",
                "transition-[background-color,color,border-color,transform] duration-150",
                "active:scale-[0.96]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                selected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-transparent hover:bg-muted/70"
              )}
            >
              {opt.label}
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
