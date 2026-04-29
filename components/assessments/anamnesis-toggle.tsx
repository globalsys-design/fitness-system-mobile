"use client";

/**
 * AnamnesisToggle — bloco de pergunta numerada com Sim/Não.
 *
 * Wrapper sobre o componente único do design system (`YesNoButtons`).
 * Mantém a API antiga (boolean | null) para não quebrar telas legadas
 * e centraliza a UX de Sim/Não no componente padrão.
 *
 * Use este wrapper quando precisar de:
 *  - número da pergunta visível (badge cyan)
 *  - bloco em card com pergunta acima e botões abaixo (full-width)
 *
 * Para listas inline, use diretamente `<YesNoButtons variant="inline">`.
 */

import { YesNoButtons } from "@/components/ui/yes-no-buttons";

interface AnamnesisToggleProps {
  question: string;
  questionNumber: number;
  value: boolean | null;
  onChange: (val: boolean) => void;
  /** Quando true, "Sim" assume tom destructive (resposta indica risco). */
  dangerYes?: boolean;
  disabled?: boolean;
}

export function AnamnesisToggle({
  question,
  questionNumber,
  value,
  onChange,
  dangerYes = true,
  disabled,
}: AnamnesisToggleProps) {
  // Adapta API boolean → "yes" | "no" do componente padrão
  const yesNoValue: "yes" | "no" | null =
    value === true ? "yes" : value === false ? "no" : null;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card">
      <div className="flex items-start gap-3">
        <span
          className="flex items-center justify-center size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5"
          aria-hidden
        >
          {questionNumber}
        </span>
        <p className="text-sm text-foreground leading-relaxed">{question}</p>
      </div>

      <YesNoButtons
        value={yesNoValue}
        onChange={(v) => onChange(v === "yes")}
        dangerYes={dangerYes}
        disabled={disabled}
        ariaLabel={question}
      />
    </div>
  );
}
