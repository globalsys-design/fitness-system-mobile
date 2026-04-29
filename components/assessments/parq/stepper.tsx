"use client";

/**
 * ParqStepper — wrapper sobre o Stepper global preservando API antiga.
 *
 * Antes: implementava o stepper inline com lógica de fases (screening|sections).
 * Agora: delega para `<Stepper>` (componente único do design system),
 * convertendo `phase` em `separatorAfter` (quebra visual entre Etapa 1 e 2).
 *
 * Tudo que importa `<ParqStepper>` continua funcionando.
 */

import {
  Stepper,
  type StepperItem as GlobalStepperItem,
} from "@/components/ui/stepper";

export interface StepperItem {
  id: string;
  label: string;
  phase: "screening" | "sections";
  status: "done" | "active" | "pending";
}

interface ParqStepperProps {
  items: StepperItem[];
  className?: string;
  /** Callback ao clicar num dot já concluído (navegação para trás). */
  onStepClick?: (id: string) => void;
}

export function ParqStepper({
  items,
  className,
  onStepClick,
}: ParqStepperProps) {
  // Converte API "phase" em "separatorAfter": quebra visual quando o
  // próximo item está em outra fase.
  const mapped: GlobalStepperItem[] = items.map((it, i) => {
    const next = items[i + 1];
    const phaseBreakAfter = !!next && next.phase !== it.phase;
    return {
      id: it.id,
      label: it.label,
      status: it.status,
      separatorAfter: phaseBreakAfter,
    };
  });

  return (
    <Stepper
      items={mapped}
      onStepClick={onStepClick}
      ariaLabel="Progresso do PAR-Q+"
      className={className}
    />
  );
}
