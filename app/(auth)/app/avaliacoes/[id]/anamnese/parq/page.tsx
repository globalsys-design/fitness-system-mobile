"use client";

/**
 * PAR-Q+ — fluxo oficial em 2 etapas (mobile-first, alinhado ao Figma).
 *
 * ETAPA 1 (Triagem): 6 telas (7 perguntas). Se alguma = Sim → Etapa 2.
 * ETAPA 2 (Acompanhamento): 10 seções com gate + sub-perguntas condicionais.
 * REVIEW: dashboard de risco + Salvar.
 *
 * Design spells preservados (CSS-only):
 *  - Stepper de progresso horizontal (Etapa 1 | Etapa 2) scrollável
 *  - Slide-in suave na troca de página (remount via key)
 *  - BottomSheet de transição entre etapas ("Estamos quase finalizando…")
 *  - Shimmer no botão Salvar quando risco baixo
 *  - Reveal em cascata das sub-perguntas (stagger 50ms)
 *  - prefers-reduced-motion respeitado
 *
 * Persistência: `Anamnesis.parq` (Json) com shape `ParqPlusData` (versão "plus-v1").
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskDashboardCard } from "@/components/assessments/risk-dashboard-card";
import { ParqView } from "@/components/assessments/parq/parq-view";
import { scrollMobileTop } from "@/lib/utils/scroll";

import {
  PARQ_PLUS_SCREENING,
  PARQ_PLUS_SECTIONS,
  calculateParqPlusRisk,
  countYesAnswers,
  type ParqAnswer,
  type ParqPlusData,
  type ParqPlusHistoryEntry,
} from "@/lib/data/parq-plus";

import { QuestionCard } from "@/components/assessments/parq/question-card";
import { SectionCard } from "@/components/assessments/parq/section-card";
import {
  FollowUpCheckboxes,
  FollowUpTextarea,
} from "@/components/assessments/parq/follow-ups";
import { ParqStepper, type StepperItem } from "@/components/assessments/parq/stepper";
import { TransitionSheet } from "@/components/assessments/parq/transition-sheet";
import { ParqNavBar } from "@/components/assessments/parq/nav-bar";

type Phase = "screening" | "sections" | "review";

export default function ParqPlusPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = params.id as string;

  /* ── state ──────────────────────────────────────────────────── */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [phase, setPhase] = useState<Phase>("screening");
  const [screeningIdx, setScreeningIdx] = useState(0);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [transitionOpen, setTransitionOpen] = useState(false);

  const [answers, setAnswers] = useState<Record<string, ParqAnswer>>({});
  const [followUpOptions, setFollowUpOptions] = useState<
    Record<string, string[]>
  >({});
  const [followUpText, setFollowUpText] = useState<Record<string, string>>({});

  // Dados persistidos do PAR-Q+ (fonte de verdade para modo view)
  const [savedData, setSavedData] = useState<ParqPlusData | null>(null);
  // Flag local para forçar edição mesmo com dados existentes (botão Refazer)
  const [forceEdit, setForceEdit] = useState(false);
  // Flag: true quando usuário clicou "Nova avaliação" (arquiva ao salvar)
  const [isNewEvaluation, setIsNewEvaluation] = useState(false);
  const isEditQuery = searchParams.get("mode") === "edit";

  /* ── carregamento ───────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `/api/assessments/${assessmentId}/anamnesis`
        );
        if (res.ok) {
          const data = await res.json();
          const parq = data?.parq as ParqPlusData | null;
          if (parq?.version === "plus-v1") {
            setAnswers(parq.answers ?? {});
            setFollowUpOptions(parq.followUpOptions ?? {});
            setFollowUpText(parq.followUpText ?? {});
            setSavedData(parq);
          }
        }
      } catch (err) {
        console.error("[parq] load error", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assessmentId]);

  /* ── derivações ─────────────────────────────────────────────── */
  const screeningIds = useMemo(
    () => PARQ_PLUS_SCREENING.flatMap((s) => s.questions.map((q) => q.id)),
    []
  );
  const anyScreeningYes = useMemo(
    () => screeningIds.some((id) => answers[id] === "yes"),
    [answers, screeningIds]
  );
  const yesCount = countYesAnswers(answers);
  const riskLevel = useMemo(() => calculateParqPlusRisk(answers), [answers]);

  /* ── stepper items ──────────────────────────────────────────── */
  const stepperItems = useMemo<StepperItem[]>(() => {
    const screening = PARQ_PLUS_SCREENING.map((screen, i) => {
      const allAnswered = screen.questions.every(
        (q) => answers[q.id] === "yes" || answers[q.id] === "no"
      );
      let status: StepperItem["status"] = "pending";
      if (phase === "screening" && i === screeningIdx) status = "active";
      else if (allAnswered) status = "done";
      return {
        id: screen.id,
        label: String(i + 1),
        phase: "screening" as const,
        status,
      };
    });

    const sections = anyScreeningYes
      ? PARQ_PLUS_SECTIONS.map((sec, i) => {
          const gateAnswered = answers[sec.gate.id] != null;
          let status: StepperItem["status"] = "pending";
          if (phase === "sections" && i === sectionIdx) status = "active";
          else if (gateAnswered) status = "done";
          return {
            id: sec.id,
            label: String(i + 1),
            phase: "sections" as const,
            status,
          };
        })
      : [];

    return [...screening, ...sections];
  }, [answers, phase, screeningIdx, sectionIdx, anyScreeningYes]);

  /* ── handlers de resposta ───────────────────────────────────── */
  const setAnswer = useCallback((id: string, next: "yes" | "no") => {
    setAnswers((prev) => ({ ...prev, [id]: next }));
  }, []);

  const setFollowUpOpts = useCallback((id: string, opts: string[]) => {
    setFollowUpOptions((prev) => ({ ...prev, [id]: opts }));
  }, []);

  const setFollowUpTxt = useCallback((id: string, txt: string) => {
    setFollowUpText((prev) => ({ ...prev, [id]: txt }));
  }, []);

  /* ── navegação ──────────────────────────────────────────────── */
  const goToReview = useCallback(() => {
    setPhase("review");
    scrollMobileTop();
  }, []);

  const handleNext = useCallback(() => {
    if (phase === "screening") {
      if (screeningIdx < PARQ_PLUS_SCREENING.length - 1) {
        setScreeningIdx((v) => v + 1);
        scrollMobileTop();
        return;
      }
      // último screening — decide transição
      if (anyScreeningYes) {
        setTransitionOpen(true);
      } else {
        goToReview();
      }
      return;
    }
    if (phase === "sections") {
      if (sectionIdx < PARQ_PLUS_SECTIONS.length - 1) {
        setSectionIdx((v) => v + 1);
        scrollMobileTop();
        return;
      }
      goToReview();
      return;
    }
  }, [phase, screeningIdx, sectionIdx, anyScreeningYes, goToReview]);

  const handleBack = useCallback(() => {
    if (phase === "review") {
      if (anyScreeningYes) {
        setPhase("sections");
        setSectionIdx(PARQ_PLUS_SECTIONS.length - 1);
      } else {
        setPhase("screening");
        setScreeningIdx(PARQ_PLUS_SCREENING.length - 1);
      }
      scrollMobileTop();
      return;
    }
    if (phase === "sections") {
      if (sectionIdx > 0) {
        setSectionIdx((v) => v - 1);
      } else {
        setPhase("screening");
        setScreeningIdx(PARQ_PLUS_SCREENING.length - 1);
      }
      scrollMobileTop();
      return;
    }
    if (phase === "screening" && screeningIdx > 0) {
      setScreeningIdx((v) => v - 1);
      scrollMobileTop();
    }
  }, [phase, screeningIdx, sectionIdx, anyScreeningYes]);

  const handleTransitionContinue = useCallback(() => {
    setTransitionOpen(false);
    setPhase("sections");
    setSectionIdx(0);
    scrollMobileTop();
  }, []);

  const handleStepClick = useCallback(
    (id: string) => {
      const screenIdx = PARQ_PLUS_SCREENING.findIndex((s) => s.id === id);
      if (screenIdx >= 0) {
        setPhase("screening");
        setScreeningIdx(screenIdx);
        scrollMobileTop();
        return;
      }
      const secIdx = PARQ_PLUS_SECTIONS.findIndex((s) => s.id === id);
      if (secIdx >= 0) {
        setPhase("sections");
        setSectionIdx(secIdx);
        scrollMobileTop();
      }
    },
    []
  );

  /* ── editar vs nova avaliação ───────────────────────────────── */
  const handleEdit = useCallback(() => {
    // Correção da avaliação atual — mantém respostas, permite editar
    setIsNewEvaluation(false);
    setForceEdit(true);
    setPhase("screening");
    setScreeningIdx(0);
    setSectionIdx(0);
  }, []);

  const handleStartNew = useCallback(() => {
    // Nova avaliação — limpa respostas; ao salvar, arquiva a anterior em history[]
    setIsNewEvaluation(true);
    setForceEdit(true);
    setAnswers({});
    setFollowUpOptions({});
    setFollowUpText({});
    setPhase("screening");
    setScreeningIdx(0);
    setSectionIdx(0);
  }, []);

  /* ── persistência ───────────────────────────────────────────── */
  const handleSave = useCallback(async () => {
    setSaving(true);

    // Histórico: preserva o que já existia e, se for nova avaliação, arquiva a atual.
    const previousHistory: ParqPlusHistoryEntry[] = savedData?.history ?? [];
    let history: ParqPlusHistoryEntry[] | undefined = previousHistory.length
      ? previousHistory
      : undefined;

    if (isNewEvaluation && savedData) {
      const archivedEntry: ParqPlusHistoryEntry = {
        archivedAt: new Date().toISOString(),
        completedAt: savedData.completedAt,
        riskLevel: savedData.riskLevel,
        answers: savedData.answers,
        followUpOptions: savedData.followUpOptions,
        followUpText: savedData.followUpText,
      };
      history = [archivedEntry, ...previousHistory];
    }

    const payload: ParqPlusData = {
      version: "plus-v1",
      answers,
      followUpOptions,
      followUpText,
      completedAt: new Date().toISOString(),
      riskLevel,
      ...(history ? { history } : {}),
    };
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/anamnesis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parq: payload }),
      });
      if (!res.ok) throw new Error("save failed");
      toast.success("PAR-Q+ salvo com sucesso");
      setSavedData(payload);
      setForceEdit(false);
      setIsNewEvaluation(false);
      if (isEditQuery) {
        router.replace(`/app/avaliacoes/${assessmentId}/anamnese/parq`);
      }
    } catch (err) {
      console.error("[parq] save error", err);
      toast.error("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }, [
    assessmentId,
    answers,
    followUpOptions,
    followUpText,
    riskLevel,
    isEditQuery,
    router,
  ]);

  /* ── primary button tone/label ──────────────────────────────── */
  const primary = useMemo(() => {
    if (phase === "review") {
      const tone: "success" | "destructive" | "primary" =
        riskLevel === "low"
          ? "success"
          : riskLevel === "high"
          ? "destructive"
          : "primary";
      return { label: "Salvar", tone };
    }
    // Última tela da triagem sem Etapa 2 → "Finalizar" (vai direto ao review)
    const lastScreening = screeningIdx === PARQ_PLUS_SCREENING.length - 1;
    if (phase === "screening" && lastScreening && !anyScreeningYes) {
      return { label: "Finalizar", tone: "primary" as const };
    }
    // Última seção da Etapa 2 → "Finalizar"
    const lastSection = sectionIdx === PARQ_PLUS_SECTIONS.length - 1;
    if (phase === "sections" && lastSection) {
      return { label: "Finalizar", tone: "primary" as const };
    }
    return { label: "Próximo", tone: "primary" as const };
  }, [phase, riskLevel, screeningIdx, sectionIdx, anyScreeningYes]);

  /* ── render ─────────────────────────────────────────────────── */
  if (loading) {
    return (
      <MobileLayout title="PAR-Q+" showBack>
        <div className="p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </MobileLayout>
    );
  }

  // Modo leitura: há dados persistidos E usuário não pediu edição
  const hasData = savedData != null;
  const isViewMode = hasData && !isEditQuery && !forceEdit;

  if (isViewMode && savedData) {
    return (
      <MobileLayout title="PAR-Q+" showBack>
        <ParqView
          data={savedData}
          onEdit={handleEdit}
          onStartNew={handleStartNew}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="PAR-Q+" showBack>
      <div className="flex flex-col min-h-full">
        {/* Intro + Stepper (sticky) */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/60">
          <div className="px-4 pt-3 pb-1">
            <h1 className="text-base font-semibold text-foreground">
              Preparação para Atividades Físicas
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Responda às questões sobre sua condição de saúde.
            </p>
          </div>
          <ParqStepper items={stepperItems} onStepClick={handleStepClick} />
          {yesCount > 0 && (
            <div
              className="px-4 pb-2"
              aria-live="polite"
              aria-atomic="true"
            >
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary"
              >
                {yesCount} {yesCount === 1 ? "resposta" : "respostas"}{" "}
                &ldquo;Sim&rdquo;
              </span>
            </div>
          )}
        </div>

        {/* Conteúdo por fase */}
        <div className="flex-1 px-4 py-4">
          {phase === "screening" && (
            <ScreeningPhase
              key={`screen-${screeningIdx}`}
              index={screeningIdx}
              answers={answers}
              followUpOptions={followUpOptions}
              followUpText={followUpText}
              onAnswer={setAnswer}
              onFollowUpOpts={setFollowUpOpts}
              onFollowUpTxt={setFollowUpTxt}
            />
          )}

          {phase === "sections" && (
            <SectionsPhase
              key={`sec-${sectionIdx}`}
              index={sectionIdx}
              answers={answers}
              followUpText={followUpText}
              onAnswer={setAnswer}
              onFollowUpTxt={setFollowUpTxt}
            />
          )}

          {phase === "review" && (
            <ReviewPhase riskLevel={riskLevel} yesCount={yesCount} />
          )}
        </div>

        {/* Nav bar fixa */}
        <ParqNavBar
          canGoBack={!(phase === "screening" && screeningIdx === 0)}
          onBack={handleBack}
          primaryLabel={primary.label}
          primaryTone={primary.tone}
          primaryLoading={saving}
          onPrimary={phase === "review" ? handleSave : handleNext}
        />

        {/* Transição Etapa 1 → Etapa 2 */}
        <TransitionSheet
          open={transitionOpen}
          onOpenChange={setTransitionOpen}
          onContinue={handleTransitionContinue}
          sectionsCount={PARQ_PLUS_SECTIONS.length}
        />
      </div>
    </MobileLayout>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Sub-componentes de fase
 * ────────────────────────────────────────────────────────────────────── */

interface ScreeningPhaseProps {
  index: number;
  answers: Record<string, ParqAnswer>;
  followUpOptions: Record<string, string[]>;
  followUpText: Record<string, string>;
  onAnswer: (id: string, next: "yes" | "no") => void;
  onFollowUpOpts: (id: string, opts: string[]) => void;
  onFollowUpTxt: (id: string, txt: string) => void;
}

function ScreeningPhase({
  index,
  answers,
  followUpOptions,
  followUpText,
  onAnswer,
  onFollowUpOpts,
  onFollowUpTxt,
}: ScreeningPhaseProps) {
  const screen = PARQ_PLUS_SCREENING[index];
  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-right-2 fill-mode-both duration-300">
      {screen.questions.map((q) => {
        const fu = q.followUp;
        let slot: React.ReactNode = undefined;
        if (fu?.type === "checkboxes" && answers[q.id] === "yes") {
          slot = (
            <FollowUpCheckboxes
              idBase={q.id}
              label={fu.label}
              hint={fu.hint}
              options={fu.options}
              selected={followUpOptions[q.id] ?? []}
              onChange={(opts) => onFollowUpOpts(q.id, opts)}
            />
          );
        } else if (fu?.type === "textarea" && answers[q.id] === "yes") {
          slot = (
            <FollowUpTextarea
              idBase={q.id}
              label={fu.label}
              hint={fu.hint}
              placeholder={fu.placeholder}
              value={followUpText[q.id] ?? ""}
              onChange={(v) => onFollowUpTxt(q.id, v)}
            />
          );
        }
        return (
          <QuestionCard
            key={q.id}
            question={q}
            answer={answers[q.id] ?? null}
            onAnswerChange={(next) => onAnswer(q.id, next)}
            followUpSlot={slot}
          />
        );
      })}
    </div>
  );
}

interface SectionsPhaseProps {
  index: number;
  answers: Record<string, ParqAnswer>;
  followUpText: Record<string, string>;
  onAnswer: (id: string, next: "yes" | "no") => void;
  onFollowUpTxt: (id: string, txt: string) => void;
}

function SectionsPhase({
  index,
  answers,
  followUpText,
  onAnswer,
  onFollowUpTxt,
}: SectionsPhaseProps) {
  const section = PARQ_PLUS_SECTIONS[index];
  return (
    <div className="animate-in fade-in slide-in-from-right-2 fill-mode-both duration-300">
      <SectionCard
        section={section}
        answers={answers}
        followUpText={followUpText}
        onAnswerChange={onAnswer}
        onFollowUpTextChange={onFollowUpTxt}
      />
    </div>
  );
}

interface ReviewPhaseProps {
  riskLevel: "low" | "moderate" | "high";
  yesCount: number;
}

function ReviewPhase({ riskLevel, yesCount }: ReviewPhaseProps) {
  const config = {
    low: {
      title: "Risco Baixo",
      description:
        "Você respondeu &ldquo;Não&rdquo; para todas as perguntas. Está liberado para iniciar atividade física com segurança.",
      score: 0,
    },
    moderate: {
      title: "Risco Moderado",
      description:
        "Você relatou condições relevantes, mas aparentemente controladas. Recomenda-se avaliação adicional antes de atividades de alta intensidade.",
      score: yesCount,
    },
    high: {
      title: "Risco Alto",
      description:
        "Foram identificadas condições que exigem avaliação médica antes de iniciar um programa de exercícios.",
      score: yesCount,
    },
  }[riskLevel];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-400">
      <RiskDashboardCard
        title={config.title}
        score={config.score}
        maxScore={Math.max(yesCount, 1)}
        riskLevel={riskLevel}
        description={config.description}
      />
      <p className="text-xs text-muted-foreground text-center px-4">
        Revise as respostas tocando nos passos acima antes de salvar.
      </p>
    </div>
  );
}
