"use client";

/**
 * ParqAnswersSheet — BottomSheet "Revisar Respostas PARQ+".
 *
 * Lista TODAS as respostas (Etapa 1 + Etapa 2 condicional + follow-ups)
 * em layout scrollável. Mobile-first com vaul drawer.
 */

import { ClipboardList } from "lucide-react";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  PARQ_PLUS_SCREENING,
  PARQ_PLUS_SECTIONS,
  type ParqAnswer,
  type ParqQuestion,
} from "@/lib/data/parq-plus";
import { renderRichText } from "./rich-text";

interface ParqAnswersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answers: Record<string, ParqAnswer>;
  followUpOptions: Record<string, string[]>;
  followUpText: Record<string, string>;
}

export function ParqAnswersSheet({
  open,
  onOpenChange,
  answers,
  followUpOptions,
  followUpText,
}: ParqAnswersSheetProps) {
  const screeningQs = PARQ_PLUS_SCREENING.flatMap((s) => s.questions);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      srOnlyTitle="Revisar Respostas PARQ+"
      srOnlyDescription="Lista completa de respostas do questionário PAR-Q+ preenchido."
    >
      <div className="flex items-center gap-3 px-5 pt-1 pb-3 border-b border-border/60">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <ClipboardList className="h-4.5 w-4.5 text-primary" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          Revisar Respostas PARQ+
        </h2>
      </div>

      <ScrollArea className="max-h-[70dvh]">
        <div className="px-5 py-4 space-y-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {/* Etapa 1 — Respostas primárias */}
          <Section title="Respostas Primárias">
            <div className="divide-y divide-border/60">
              {screeningQs.map((q) => (
                <AnswerRow
                  key={q.id}
                  question={q}
                  answer={answers[q.id] ?? null}
                  followUpOptions={followUpOptions[q.id]}
                  followUpText={followUpText[q.id]}
                />
              ))}
            </div>
          </Section>

          {/* Etapa 2 — por seção visível */}
          {PARQ_PLUS_SECTIONS.map((section) => {
            const gateAnswer = answers[section.gate.id];
            if (gateAnswer == null) return null;
            return (
              <Section key={section.id} title={section.title}>
                <div className="divide-y divide-border/60">
                  <AnswerRow
                    question={section.gate}
                    answer={gateAnswer}
                    emphasisGate
                  />
                  {gateAnswer === "yes" &&
                    section.subQuestions.map((q) => (
                      <AnswerRow
                        key={q.id}
                        question={q}
                        answer={answers[q.id] ?? null}
                        followUpText={followUpText[q.id]}
                      />
                    ))}
                </div>
              </Section>
            );
          })}
        </div>
      </ScrollArea>
    </BottomSheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
        {title}
      </h3>
      <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
        {children}
      </div>
    </section>
  );
}

function AnswerRow({
  question,
  answer,
  followUpOptions,
  followUpText,
  emphasisGate,
}: {
  question: ParqQuestion;
  answer: ParqAnswer;
  followUpOptions?: string[];
  followUpText?: string;
  emphasisGate?: boolean;
}) {
  const hasFU =
    (followUpOptions && followUpOptions.length > 0) ||
    (followUpText && followUpText.trim().length > 0);
  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "text-sm text-foreground leading-relaxed flex-1 min-w-0",
            emphasisGate && "font-medium"
          )}
        >
          {renderRichText(question.text)}
        </p>
        <AnswerBadge answer={answer} />
      </div>
      {hasFU && (
        <div className="mt-2 pl-0 space-y-1">
          {followUpOptions && followUpOptions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {followUpOptions.map((opt) => (
                <span
                  key={opt}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                >
                  {opt}
                </span>
              ))}
            </div>
          )}
          {followUpText && followUpText.trim().length > 0 && (
            <p className="text-xs text-muted-foreground italic leading-relaxed border-l-2 border-border pl-3">
              &ldquo;{followUpText}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function AnswerBadge({ answer }: { answer: ParqAnswer }) {
  if (answer === "yes") {
    return (
      <span className="shrink-0 text-sm font-semibold text-destructive">
        Sim
      </span>
    );
  }
  if (answer === "no") {
    return (
      <span className="shrink-0 text-sm font-semibold text-primary">
        Não
      </span>
    );
  }
  return (
    <span className="shrink-0 text-sm font-medium text-muted-foreground/60">
      —
    </span>
  );
}
