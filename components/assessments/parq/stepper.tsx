"use client";

/**
 * ParqStepper — indicador horizontal de progresso do PAR-Q+.
 *
 * UX: dots + connector lines, scrollável horizontalmente em mobile.
 * Exibe duas fases visíveis:
 *  - Etapa 1 (Triagem): 6 steps (uma tela por step — P2+P3 juntas)
 *  - Separador visual
 *  - Etapa 2 (Acompanhamento): até 10 steps (só exibe se anyScreeningYes)
 *
 * Estado de cada dot:
 *  - done: resposta completa → bg-primary
 *  - active: atual → ring-primary + zoom
 *  - pending: cinza
 *
 * Auto-scroll mantém o dot ativo centralizado.
 */

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeIdx = items.findIndex((i) => i.status === "active");

  useEffect(() => {
    if (activeIdx < 0 || !scrollRef.current) return;
    const el = scrollRef.current.querySelector<HTMLElement>(
      `[data-step-index="${activeIdx}"]`
    );
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIdx]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto scrollbar-none px-4 py-3",
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        className
      )}
      role="progressbar"
      aria-label="Progresso do PAR-Q+"
      aria-valuemin={0}
      aria-valuemax={items.length}
      aria-valuenow={items.filter((i) => i.status === "done").length}
    >
      {items.map((item, idx) => {
        const isDone = item.status === "done";
        const isActive = item.status === "active";
        const isClickable = !!onStepClick && isDone;
        const nextItem = items[idx + 1];
        const phaseBreakAfter = nextItem && nextItem.phase !== item.phase;
        // Traço depois deste dot é "preenchido" quando este step já foi
        // concluído OU é o atual (a trilha até o próximo dot já foi andada).
        const connectorActive = isDone || isActive;

        return (
          <div
            key={item.id}
            data-step-index={idx}
            className="flex items-center gap-1.5 shrink-0"
          >
            <button
              type="button"
              onClick={() => isClickable && onStepClick(item.id)}
              disabled={!isClickable}
              aria-label={`${item.label}${
                isDone ? " — concluído" : isActive ? " — atual" : ""
              }`}
              className={cn(
                "relative flex items-center justify-center shrink-0",
                "h-7 w-7 rounded-full text-[10px] font-bold tabular-nums",
                "transition-colors duration-300",
                isDone &&
                  "bg-primary text-primary-foreground cursor-pointer",
                isActive &&
                  "bg-background text-primary ring-2 ring-primary",
                !isDone && !isActive && "bg-muted text-muted-foreground"
              )}
            >
              {isDone ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : (
                <span>{item.label}</span>
              )}
            </button>
            {idx < items.length - 1 && !phaseBreakAfter && (
              <div
                aria-hidden="true"
                className={cn(
                  "h-0.5 w-4 rounded-full transition-colors duration-300",
                  connectorActive ? "bg-primary" : "bg-border"
                )}
              />
            )}
            {phaseBreakAfter && (
              <div
                aria-hidden="true"
                className="mx-1 h-4 w-px bg-border"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
