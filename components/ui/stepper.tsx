"use client";

/**
 * Stepper — componente único do design system para fluxos multi-etapa.
 *
 * Visual canônico (referência: PAR-Q+):
 *  - Dots numerados com linha conectora horizontal
 *  - done   → bg-primary com ícone de check
 *  - active → ring-2 ring-primary, fundo transparente, número visível
 *  - pending → bg-muted, número cinza
 *  - Conector preenchido quando step concluído ou ativo
 *  - Separador vertical opcional entre fases (ex: PAR-Q+ Etapa 1 → Etapa 2)
 *  - Auto-scroll horizontal mantém step ativo centralizado
 *
 * USO OBRIGATÓRIO em qualquer fluxo multi-etapa novo. Não criar variantes
 * próprias — a UX precisa ser idêntica em PAR-Q+, Questionário Completo e
 * demais formulários.
 *
 * Para mostrar título da etapa atual (ex: "Histórico Atual"), renderize
 * um <h2> separado abaixo do <Stepper> — o componente em si só mostra
 * progresso visual.
 */

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperItem {
  id: string;
  /** Label curto (geralmente número 1-9 ou letra). */
  label: string;
  status: "done" | "active" | "pending";
  /** Quebra visual depois deste step (linha vertical curta). */
  separatorAfter?: boolean;
}

interface StepperProps {
  items: StepperItem[];
  /** Callback de clique. Por padrão, só steps "done" são clicáveis. */
  onStepClick?: (id: string) => void;
  /** Permite clicar em qualquer step (incluindo pending). */
  allowClickPending?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function Stepper({
  items,
  onStepClick,
  allowClickPending,
  ariaLabel = "Progresso do questionário",
  className,
}: StepperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeIdx = items.findIndex((i) => i.status === "active");

  /* Auto-scroll horizontal interno: centraliza o step ativo no eixo X
   * sem mexer no scroll vertical do `<main>` ancestral. Antes usávamos
   * `scrollIntoView({ block: "nearest" })`, que em mobile roladava o
   * `<main>` para tornar o stepper visível, fazendo a tela "parar no
   * meio" depois de chamar scrollMobileTop(). */
  useEffect(() => {
    if (activeIdx < 0 || !scrollRef.current) return;
    const container = scrollRef.current;
    const el = container.querySelector<HTMLElement>(
      `[data-step-index="${activeIdx}"]`
    );
    if (!el) return;
    const targetLeft = el.offsetLeft - (container.clientWidth - el.offsetWidth) / 2;
    container.scrollTo({ left: targetLeft, behavior: "smooth" });
  }, [activeIdx]);

  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto px-4 py-3",
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        className
      )}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={items.length}
      aria-valuenow={doneCount}
    >
      {items.map((item, idx) => {
        const isDone = item.status === "done";
        const isActive = item.status === "active";
        const isClickable =
          !!onStepClick && (allowClickPending || isDone || isActive);
        const isLast = idx === items.length - 1;
        // Conector "andado" quando step atual já passou (done ou ativo).
        const connectorActive = isDone || isActive;

        return (
          <div
            key={item.id}
            data-step-index={idx}
            className="flex items-center gap-1.5 shrink-0"
          >
            <button
              type="button"
              onClick={() => isClickable && onStepClick?.(item.id)}
              disabled={!isClickable}
              aria-label={`${item.label}${
                isDone ? " — concluído" : isActive ? " — atual" : ""
              }`}
              className={cn(
                "relative flex items-center justify-center shrink-0",
                "h-7 w-7 rounded-full text-[10px] font-bold tabular-nums",
                "transition-colors duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isClickable && "cursor-pointer",
                isDone && "bg-primary text-primary-foreground",
                isActive &&
                  "bg-background text-primary ring-2 ring-primary",
                !isDone && !isActive && "bg-muted text-muted-foreground"
              )}
            >
              {isDone ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
              ) : (
                <span>{item.label}</span>
              )}
            </button>

            {/* Conector horizontal — só não desenha depois do último item nem
                quando há quebra de fase explícita. */}
            {!isLast && !item.separatorAfter && (
              <div
                aria-hidden="true"
                className={cn(
                  "h-0.5 w-4 rounded-full transition-colors duration-300",
                  connectorActive ? "bg-primary" : "bg-border"
                )}
              />
            )}

            {/* Separador vertical de fase — substitui o conector horizontal. */}
            {!isLast && item.separatorAfter && (
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
