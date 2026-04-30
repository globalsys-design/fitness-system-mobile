"use client";

/**
 * ObjectiveRatingCard — Card com seletor segmentado 0–4 para relevância do objetivo.
 *
 * Design spells aplicados (tudo CSS/GPU-accelerated, sem libs):
 *  - Segmented cells: `active:scale-[0.92]` (tactile press) + `ring` suave quando selecionado.
 *  - "Thermometer line": barra inferior preenche suavemente com `transition-[width]`
 *    acompanhando o rating (0 → 0%, 4 → 100%). Cor fica mais quente conforme sobe.
 *  - Intensity pill: faz `fade+slide` ao trocar usando `key` remount.
 *  - Card background: ganha tint sutil (`bg-primary/5`) quando value > 0, criando
 *    um senso de "está ativo" à distância.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

const INTENSITY_LABEL: Record<number, string> = {
  0: "",
  1: "Baixo",
  2: "Moderado",
  3: "Alto",
  4: "Muito alto",
};

interface ObjectiveRatingCardProps {
  label: string;
  value: number; // 0..4
  onChange: (next: number) => void;
  /** Nome para agrupar radios na árvore de acessibilidade. Default: label. */
  name?: string;
}

export function ObjectiveRatingCard({
  label,
  value,
  onChange,
  name,
}: ObjectiveRatingCardProps) {
  const groupName = name ?? `obj-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const intensity = INTENSITY_LABEL[value] ?? "";
  const isActive = value > 0;
  // Largura proporcional à nota: 0 → 0%, 4 → 100%.
  const fillPct = (value / 4) * 100;

  return (
    <div
      data-active={isActive}
      className={cn(
        "relative rounded-xl border p-4 flex flex-col gap-3 overflow-hidden",
        "transition-[background-color,border-color] duration-300 ease-out",
        isActive
          ? "bg-primary/5 border-primary/30"
          : "bg-card border-border"
      )}
    >
      <div className="flex items-center justify-between gap-3 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{label}</p>

        {/* Pill de intensidade: remonta a cada mudança para animar entrada. */}
        {intensity && (
          <span
            key={`${label}-${value}`}
            className={cn(
              "text-[11px] font-semibold tracking-wide shrink-0 px-2 py-0.5 rounded-full",
              "bg-primary/10 text-primary",
              "animate-in fade-in slide-in-from-right-1 duration-200"
            )}
            aria-live="polite"
          >
            {intensity}
          </span>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label={`Relevância: ${label}`}
        className="grid grid-cols-5 gap-1.5"
      >
        {[0, 1, 2, 3, 4].map((n) => {
          const selected = n === value;
          // Semântica visual:
          //  - 0 selecionado = estado neutro/default (não é um "pick" real).
          //  - 1..4 selecionado = pick primário com glow.
          //  - não selecionado = ghost.
          const isZeroSelected = selected && n === 0;
          const isPositiveSelected = selected && n > 0;

          return (
            <label
              key={n}
              className={cn(
                "relative flex items-center justify-center h-10 rounded-lg border text-sm font-semibold cursor-pointer select-none",
                "transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out",
                "active:scale-[0.92]",
                isPositiveSelected &&
                  "bg-primary text-primary-foreground border-primary shadow-[0_0_0_3px_var(--color-primary)/15]",
                isZeroSelected &&
                  "bg-transparent text-foreground border-muted-foreground/40",
                !selected &&
                  "bg-transparent text-muted-foreground/70 border-border hover:bg-muted/60"
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={n}
                checked={selected}
                onChange={() => onChange(n)}
                className="sr-only"
              />
              {n}
            </label>
          );
        })}
      </div>

      {/* Thermometer line — preenche conforme a nota sobe.
          Fica invisível quando value=0 para não virar "linha fantasma". */}
      <div
        className={cn(
          "absolute left-0 bottom-0 h-[3px] w-full pointer-events-none transition-opacity duration-300",
          isActive ? "bg-muted/40 opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary rounded-r-full transition-[width] duration-500 ease-out"
          style={{ width: `${fillPct}%` }}
        />
      </div>
    </div>
  );
}
