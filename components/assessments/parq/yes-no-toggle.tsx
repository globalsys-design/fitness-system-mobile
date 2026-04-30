"use client";

/**
 * YesNoToggle — wrapper do PAR-Q+ sobre o componente padrão `YesNoButtons`.
 *
 * Antes: pill deslizante 72×32 (alternava entre Sim/Não com 1 click).
 * Agora: 2 botões inline (1 click = decisão direta) — padrão único do app.
 *
 * Mudança aprovada para padronizar UX em toda a aplicação. A API foi
 * preservada (`value: ParqAnswer`, `onChange: (next: "yes" | "no") => void`)
 * para não quebrar QuestionCard, SectionCard e demais consumidores.
 *
 * Em formulários longos (PAR-Q+ Etapa 2 com 60+ subperguntas), 2 botões
 * eliminam ambiguidade que o switch tri-estado introduzia.
 */

import { YesNoButtons } from "@/components/ui/yes-no-buttons";
import type { ParqAnswer } from "@/lib/data/parq-plus";

interface YesNoToggleProps {
  value: ParqAnswer;
  onChange: (next: "yes" | "no") => void;
  /** Label acessível; default "Resposta". */
  ariaLabel?: string;
  disabled?: boolean;
}

export function YesNoToggle({
  value,
  onChange,
  ariaLabel = "Resposta",
  disabled,
}: YesNoToggleProps) {
  return (
    <YesNoButtons
      value={value}
      onChange={onChange}
      variant="inline"
      dangerYes
      ariaLabel={ariaLabel}
      disabled={disabled}
    />
  );
}
