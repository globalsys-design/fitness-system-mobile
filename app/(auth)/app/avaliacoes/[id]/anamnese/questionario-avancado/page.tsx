"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { YesNoButtons } from "@/components/ui/yes-no-buttons";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ADVANCED_SECTIONS,
  answeredCount,
  countYesAnswers,
  getAllQuestions,
  isQuestionnaireComplete,
  type AdvancedQuestionnaireData,
  type AdvancedSection,
} from "@/lib/data/advanced-questionnaire";
import { AdvancedQuestionnaireView } from "@/components/assessments/advanced-questionnaire/advanced-questionnaire-view";

export default function QuestionarioAvancadoPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = params.id as string;

  const [answers, setAnswers] = useState<Record<string, "yes" | "no">>({});
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [savedData, setSavedData] = useState<AdvancedQuestionnaireData | null>(
    null
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [forceEdit, setForceEdit] = useState(false);
  const isEditQuery = searchParams.get("mode") === "edit";

  /* ── carregamento ───────────────────────────────────────────── */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${assessmentId}/anamnesis`);
        if (res.ok) {
          const d = await res.json();
          const persisted = d?.advancedQuestionnaire;
          if (persisted?.version === "v2") {
            const v2 = persisted as AdvancedQuestionnaireData;
            setAnswers(v2.answers ?? {});
            setObservations(v2.observations ?? {});
            setSavedData(v2);
            setSavedAt(v2.completedAt ?? d?.updatedAt ?? null);
          }
        }
      } catch {
        /* empty */
      } finally {
        setIsFetching(false);
      }
    }
    load();
  }, [assessmentId]);

  /* ── derivações ─────────────────────────────────────────────── */
  const totalQuestions = useMemo(() => getAllQuestions().length, []);
  const answered = useMemo(() => answeredCount(answers), [answers]);
  const yesCount = useMemo(() => countYesAnswers(answers), [answers]);
  const progressPct = totalQuestions
    ? Math.round((answered / totalQuestions) * 100)
    : 0;
  const allAnswered = isQuestionnaireComplete(answers);

  /* ── handlers ───────────────────────────────────────────────── */
  function setAnswer(questionId: string, value: "yes" | "no") {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setSaved(false);
    // Se mudou de "yes" para "no", limpa a observação correspondente.
    if (value === "no") {
      setObservations((prev) => {
        if (!prev[questionId]) return prev;
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  }

  function setObservation(questionId: string, text: string) {
    setObservations((prev) => ({ ...prev, [questionId]: text }));
    setSaved(false);
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      const payload: AdvancedQuestionnaireData = {
        version: "v2",
        answers,
        observations,
        completedAt: new Date().toISOString(),
      };
      await fetch(`/api/assessments/${assessmentId}/anamnesis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advancedQuestionnaire: payload }),
      });
      toast.success("Questionário salvo!");
      setSaved(true);
      setSavedData(payload);
      setSavedAt(payload.completedAt ?? null);
      setForceEdit(false);
      if (isEditQuery) {
        router.replace(
          `/app/avaliacoes/${assessmentId}/anamnese/questionario-avancado`
        );
      }
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit() {
    setForceEdit(true);
  }

  function handleStartNew() {
    setAnswers({});
    setObservations({});
    setSaved(false);
    setForceEdit(true);
  }

  if (isFetching) {
    return (
      <MobileLayout title="Questionário Avançado" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  /* Modo leitura: dados salvos válidos e usuário não pediu edição */
  const hasSavedData =
    savedData != null &&
    savedData.version === "v2" &&
    isQuestionnaireComplete(savedData.answers ?? {});
  const isViewMode = hasSavedData && !isEditQuery && !forceEdit;

  if (isViewMode && savedData) {
    return (
      <MobileLayout title="Questionário Avançado" showBack>
        <AdvancedQuestionnaireView
          answers={savedData.answers ?? {}}
          observations={savedData.observations ?? {}}
          completedAt={savedAt}
          onEdit={handleEdit}
          onStartNew={handleStartNew}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Questionário Avançado" showBack>
      <div className="p-4 flex flex-col gap-4">
        {/* Header informativo */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <ClipboardList className="size-6 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground text-sm">
              Questionário Avançado de Saúde
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Histórico cardíaco, médico e fatores de risco
            </p>
          </div>
        </div>

        {/* Progress + alert de "Sim" */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {answered}/{totalQuestions} respondidas
          </span>
          {yesCount > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-[11px] font-semibold text-destructive border border-destructive/20"
              aria-live="polite"
            >
              <AlertCircle className="size-3" />
              {yesCount} {yesCount === 1 ? "fator" : "fatores"} relatado
              {yesCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Seções */}
        {ADVANCED_SECTIONS.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            answers={answers}
            observations={observations}
            onAnswer={setAnswer}
            onObservation={setObservation}
          />
        ))}

        {/* Save */}
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={isLoading || !allAnswered}
        >
          {isLoading ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="size-4 mr-2" />
          ) : null}
          {saved
            ? "Salvo"
            : !allAnswered
              ? `Responda todas as ${totalQuestions} perguntas`
              : "Salvar questionário"}
        </Button>
      </div>
    </MobileLayout>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Sub-componentes
 * ────────────────────────────────────────────────────────────────────── */

function SectionBlock({
  section,
  answers,
  observations,
  onAnswer,
  onObservation,
}: {
  section: AdvancedSection;
  answers: Record<string, "yes" | "no">;
  observations: Record<string, string>;
  onAnswer: (id: string, v: "yes" | "no") => void;
  onObservation: (id: string, t: string) => void;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="font-semibold text-foreground text-sm mt-2">
        {section.title}
      </h3>
      <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border/60">
        {section.questions.map((q) => (
          <QuestionRow
            key={q.id}
            questionId={q.id}
            text={q.text}
            answer={answers[q.id] ?? null}
            observation={observations[q.id] ?? ""}
            onAnswer={(v) => onAnswer(q.id, v)}
            onObservation={(t) => onObservation(q.id, t)}
          />
        ))}
      </div>
    </section>
  );
}

function QuestionRow({
  questionId,
  text,
  answer,
  observation,
  onAnswer,
  onObservation,
}: {
  questionId: string;
  text: string;
  answer: "yes" | "no" | null;
  observation: string;
  onAnswer: (v: "yes" | "no") => void;
  onObservation: (t: string) => void;
}) {
  const showObservation = answer === "yes";

  return (
    <div className="flex flex-col gap-3 px-4 py-3.5">
      {/* Linha: pergunta + toggle pill */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-foreground/90 leading-relaxed flex-1 min-w-0 pt-1">
          {text}
        </p>
        <YesNoButtons
          value={answer}
          onChange={onAnswer}
          variant="inline"
          dangerYes
          ariaLabel={`Resposta para: ${text}`}
        />
      </div>

      {/* Caixa de observação — aparece quando Sim */}
      {showObservation && (
        <div
          className={cn(
            "animate-in fade-in slide-in-from-top-2 fill-mode-both duration-300"
          )}
        >
          <textarea
            id={`obs-${questionId}`}
            placeholder="Adicionar observações"
            value={observation}
            onChange={(e) => onObservation(e.target.value)}
            aria-label={`Observação para: ${text}`}
            className={cn(
              "w-full rounded-lg border border-border bg-background/60",
              "px-3 py-2.5 text-sm text-foreground",
              "placeholder:text-muted-foreground/70",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "min-h-[4rem] resize-none"
            )}
          />
        </div>
      )}
    </div>
  );
}

