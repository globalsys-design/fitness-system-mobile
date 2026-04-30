"use client";

/**
 * QuestionCard — card de pergunta do PAR-Q+ (padrão Figma).
 *
 * Layout mobile-first:
 *  - Card pleno (rounded-xl bg-card border border-border)
 *  - Linha superior: [ Pergunta X:  texto ]  [ YesNoToggle ]
 *  - subText (opcional) abaixo do enunciado em text-muted-foreground
 *  - followUp (opcional) desce dentro do MESMO card, separado por divider
 *    quando resposta = "Sim"
 *
 * Accessibility:
 *  - `aria-describedby` liga sub-text ao toggle
 *  - `aria-expanded`/`aria-controls` entre toggle e follow-up
 */

import { useId, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { YesNoToggle } from "./yes-no-toggle";
import { renderRichText } from "./rich-text";
import type { ParqQuestion, ParqAnswer } from "@/lib/data/parq-plus";

interface QuestionCardProps {
  question: ParqQuestion;
  answer: ParqAnswer;
  onAnswerChange: (next: "yes" | "no") => void;
  followUpSlot?: ReactNode;
  /** Variante: "header" usa bg-card mais denso (gate da seção); default usa card normal. */
  variant?: "default" | "gate";
  className?: string;
}

export function QuestionCard({
  question,
  answer,
  onAnswerChange,
  followUpSlot,
  variant = "default",
  className,
}: QuestionCardProps) {
  const uid = useId();
  const subId = question.subText ? `${uid}-sub` : undefined;
  const fuId = followUpSlot ? `${uid}-fu` : undefined;
  const showFollowUp = answer === "yes" && !!followUpSlot;

  const handleChange = useCallback(
    (next: "yes" | "no") => onAnswerChange(next),
    [onAnswerChange]
  );

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        variant === "gate"
          ? "bg-card/80 border-primary/20"
          : "bg-card border-border",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          {question.displayNumber && (
            <p className="text-sm font-semibold text-foreground">
              Pergunta {question.displayNumber}:
            </p>
          )}
          <p
            className={cn(
              "text-sm leading-relaxed text-foreground",
              !question.displayNumber && "font-medium"
            )}
          >
            {renderRichText(question.text)}
          </p>
          {question.subText && (
            <p
              id={subId}
              className="text-xs leading-relaxed text-muted-foreground"
            >
              {renderRichText(question.subText)}
            </p>
          )}
        </div>
        <div className="shrink-0 pt-0.5">
          <YesNoToggle
            value={answer}
            onChange={handleChange}
            ariaLabel={`Resposta para: ${question.text}`}
          />
        </div>
      </div>

      {showFollowUp && (
        <div
          id={fuId}
          className={cn(
            "border-t border-border/60 p-4",
            "animate-in fade-in slide-in-from-top-2 fill-mode-both duration-300"
          )}
        >
          {followUpSlot}
        </div>
      )}
    </div>
  );
}
