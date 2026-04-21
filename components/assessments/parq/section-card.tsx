"use client";

/**
 * SectionCard — Etapa 2 "Acompanhamento X: Topic".
 *
 * Layout mobile-first:
 *  - Gate question (título da seção + enunciado do gate + YesNoToggle)
 *  - Se gate = "Sim" → sub-questions aparecem em cascata (slide-in)
 *  - Cada sub-question é um QuestionCard simples
 *  - Se a sub-question tem followUp (textarea em ac10.2), ele desce dentro
 *    do próprio card da sub-pergunta
 */

import { cn } from "@/lib/utils";
import { YesNoToggle } from "./yes-no-toggle";
import { QuestionCard } from "./question-card";
import { FollowUpTextarea } from "./follow-ups";
import { renderRichText } from "./rich-text";
import type {
  ParqSection,
  ParqAnswer,
} from "@/lib/data/parq-plus";

interface SectionCardProps {
  section: ParqSection;
  answers: Record<string, ParqAnswer>;
  followUpText: Record<string, string>;
  onAnswerChange: (questionId: string, next: "yes" | "no") => void;
  onFollowUpTextChange: (questionId: string, value: string) => void;
}

export function SectionCard({
  section,
  answers,
  followUpText,
  onAnswerChange,
  onFollowUpTextChange,
}: SectionCardProps) {
  const gateAnswer = answers[section.gate.id] ?? null;
  const showSubs = gateAnswer === "yes";

  return (
    <div className="space-y-3">
      {/* Gate card — cabeçalho da seção */}
      <div className="rounded-xl bg-card border border-primary/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="text-sm font-semibold text-foreground leading-snug">
              {section.title}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {renderRichText(section.gate.text)}
            </p>
          </div>
          <div className="shrink-0 pt-0.5">
            <YesNoToggle
              value={gateAnswer}
              onChange={(next) => onAnswerChange(section.gate.id, next)}
              ariaLabel={`Resposta para: ${section.gate.text}`}
            />
          </div>
        </div>
      </div>

      {/* Sub-questions — só se gate = Sim */}
      {showSubs && (
        <div
          className={cn(
            "space-y-2.5",
            "animate-in fade-in slide-in-from-top-2 fill-mode-both duration-300"
          )}
        >
          {section.subQuestions.map((q, i) => {
            const hasTextareaFU = q.followUp?.type === "textarea";
            return (
              <div
                key={q.id}
                className="animate-in fade-in slide-in-from-top-2 fill-mode-both duration-300"
                style={{ animationDelay: `${60 + i * 50}ms` }}
              >
                <QuestionCard
                  question={q}
                  answer={answers[q.id] ?? null}
                  onAnswerChange={(next) => onAnswerChange(q.id, next)}
                  followUpSlot={
                    hasTextareaFU && q.followUp?.type === "textarea" ? (
                      <FollowUpTextarea
                        idBase={q.id}
                        label={q.followUp.label}
                        hint={q.followUp.hint}
                        placeholder={q.followUp.placeholder}
                        value={followUpText[q.id] ?? ""}
                        onChange={(v) => onFollowUpTextChange(q.id, v)}
                      />
                    ) : undefined
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
