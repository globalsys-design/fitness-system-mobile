"use client";

/**
 * WeekdayStrip — padrão de sistema para exibir disponibilidade semanal.
 *
 * Por quê um componente dedicado?
 *  - Usado em múltiplas telas (ObjectiveView, ClientDetail, AssistantDetail…)
 *    e a gente quer UMA fonte de verdade pro visual.
 *  - Cada chamada pode ter formatos de dado diferentes (keys sun/mon/... vs
 *    monday/tuesday/..., caption pode ser duração ou horário), então aceita
 *    uma array normalizada em vez de impor schema.
 *
 * Spells:
 *  - Grid 7 colunas compacto, cada célula com fade-in + zoom-in staggered
 *    (40ms por dia).
 *  - Dia ativo: bg-primary/10, border-primary/30, label primary, shadow glow.
 *  - Dia inativo: opacity 50, caption "—".
 *  - Respeita prefers-reduced-motion via animate-in.
 */

import { cn } from "@/lib/utils";

export interface WeekdayStripDay {
  /** Chave única (para key do React). */
  key: string;
  /** Label curto de 1 letra — ex.: "S", "T", "Q". */
  label: string;
  /** Caption exibido abaixo do label (duração, horário, check-mark…). `null` = inativo. */
  caption: string | null;
}

interface WeekdayStripProps {
  days: WeekdayStripDay[];
  className?: string;
  /** Stagger em ms entre células no mount. Default 40ms. */
  stagger?: number;
}

export function WeekdayStrip({
  days,
  className,
  stagger = 40,
}: WeekdayStripProps) {
  return (
    <div className={cn("grid grid-cols-7 gap-1.5", className)}>
      {days.map((day, i) => {
        const active = day.caption !== null && day.caption !== undefined;
        return (
          <div
            key={day.key}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-lg border py-2.5 px-1",
              "animate-in fade-in zoom-in-95 fill-mode-both duration-300",
              "transition-[background-color,border-color,box-shadow] duration-300",
              active
                ? "bg-primary/10 border-primary/30 shadow-[0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.1)]"
                : "bg-card border-border opacity-50"
            )}
            style={{ animationDelay: `${i * stagger}ms` }}
          >
            <span
              className={cn(
                "text-[11px] font-bold",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {day.label}
            </span>
            <span
              className={cn(
                "text-[9px] font-semibold tabular-nums leading-none",
                active ? "text-foreground" : "text-muted-foreground/60"
              )}
            >
              {active ? day.caption : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Presets de ordem ─────────────────────────────────────────────────── */

/** Segunda-a-domingo com labels S T Q Q S S D. */
export const WEEKDAYS_MON_FIRST: Array<{ key: string; label: string }> = [
  { key: "monday",    label: "S" },
  { key: "tuesday",   label: "T" },
  { key: "wednesday", label: "Q" },
  { key: "thursday",  label: "Q" },
  { key: "friday",    label: "S" },
  { key: "saturday",  label: "S" },
  { key: "sunday",    label: "D" },
];

/** Alias curto (sun/mon/tue/…) na ordem Seg-Dom com labels S T Q Q S S D. */
export const WEEKDAYS_MON_FIRST_SHORT: Array<{ key: string; label: string }> = [
  { key: "mon", label: "S" },
  { key: "tue", label: "T" },
  { key: "wed", label: "Q" },
  { key: "thu", label: "Q" },
  { key: "fri", label: "S" },
  { key: "sat", label: "S" },
  { key: "sun", label: "D" },
];
