"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { YesNoButtons } from "@/components/ui/yes-no-buttons";
import { RadioPills } from "@/components/ui/radio-pills";
import { MultiChoiceChips } from "@/components/ui/multi-choice-chips";
import {
  Stepper,
  type StepperItem as GlobalStepperItem,
} from "@/components/ui/stepper";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { scrollMobileTop } from "@/lib/utils/scroll";
import { FullQuestionnaireView } from "@/components/assessments/full-questionnaire/full-questionnaire-view";
import {
  EMPTY_FULL_QUESTIONNAIRE,
  EXAM_FIELDS,
  CURRENT_HISTORY_QUESTIONS_BEFORE_PERSONALITY,
  CURRENT_HISTORY_QUESTIONS_AFTER_PERSONALITY,
  PERSONALITY_OPTIONS,
  MORBID_QUESTIONS,
  ACTIVITY_QUESTIONS,
  SPORT_FIELDS,
  getSportOptions,
  PREFERRED_TIME_OPTIONS,
  COMMUTE_OPTIONS,
  EATING_QUALITY_OPTIONS,
  MEAL_OPTIONS,
  WEEKLY_FREQUENCY_FIELDS,
  DAILY_PORTION_FIELDS,
  NUTRITIONIST_OPTIONS,
  FAMILY_HISTORY_QUESTIONS,
  GOAL_ACHIEVEMENT_OPTIONS,
  WEEKLY_FREQUENCY_OPTIONS,
  INTENSITY_OPTIONS,
  DIET_ASSESSMENT_OPTIONS,
  RATING_OPTIONS,
  SOMETIMES_RATING_OPTIONS,
  FINAL_REPORT_OPTIONS,
  FULL_STEPS,
  type FullQuestionnaireDataV2,
  type CurrentHistory,
  type MorbidHistory,
  type PhysicalActivity,
  type DietData,
  type FullExams,
  type PersonalityValue,
  type NutritionistValue,
  type YesNoQuestion,
  type FamilyHistory,
  type PhysicalReassessment,
  type GoalAchievement,
  type DietAssessment,
  type SelfPerception,
  type Rating,
  type SometimesRating,
  type FinalReport,
  type FinalConclusion,
} from "@/lib/data/full-questionnaire";

export default function QuestionarioCompletoPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = params.id as string;

  const [data, setData] = useState<FullQuestionnaireDataV2>(
    EMPTY_FULL_QUESTIONNAIRE
  );
  const [savedData, setSavedData] = useState<FullQuestionnaireDataV2 | null>(
    null
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
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
          if (d?.fullQuestionnaire?.version === "v2") {
            const v2 = {
              ...EMPTY_FULL_QUESTIONNAIRE,
              ...(d.fullQuestionnaire as FullQuestionnaireDataV2),
            };
            setData(v2);
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

  /* ── handlers ───────────────────────────────────────────────── */
  function patchExams(patch: Partial<FullExams>) {
    setData((d) => ({ ...d, exams: { ...d.exams, ...patch } }));
    setSaved(false);
  }

  function patchCurrentHistory(patch: Partial<CurrentHistory>) {
    setData((d) => ({
      ...d,
      currentHistory: { ...d.currentHistory, ...patch },
    }));
    setSaved(false);
  }

  function patchMorbid(patch: Partial<MorbidHistory>) {
    setData((d) => ({
      ...d,
      morbidHistory: { ...d.morbidHistory, ...patch },
    }));
    setSaved(false);
  }

  function patchActivity(patch: Partial<PhysicalActivity>) {
    setData((d) => ({
      ...d,
      physicalActivity: { ...d.physicalActivity, ...patch },
    }));
    setSaved(false);
  }

  function patchDiet(patch: Partial<DietData>) {
    setData((d) => ({ ...d, diet: { ...d.diet, ...patch } }));
    setSaved(false);
  }

  function patchFamily(patch: Partial<FamilyHistory>) {
    setData((d) => ({
      ...d,
      familyHistory: { ...d.familyHistory, ...patch },
    }));
    setSaved(false);
  }

  function patchReassessment(patch: Partial<PhysicalReassessment>) {
    setData((d) => ({
      ...d,
      reassessment: { ...d.reassessment, ...patch },
    }));
    setSaved(false);
  }

  function patchSelfPerception(patch: Partial<SelfPerception>) {
    setData((d) => ({
      ...d,
      selfPerception: { ...d.selfPerception, ...patch },
    }));
    setSaved(false);
  }

  function patchFinalReport(patch: Partial<FinalReport>) {
    setData((d) => ({
      ...d,
      finalReport: { ...d.finalReport, ...patch },
    }));
    setSaved(false);
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      const payload: FullQuestionnaireDataV2 = {
        ...data,
        completedAt: new Date().toISOString(),
      };
      await fetch(`/api/assessments/${assessmentId}/anamnesis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullQuestionnaire: payload }),
      });
      toast.success("Questionário salvo!");
      setSaved(true);
      setSavedData(payload);
      setSavedAt(payload.completedAt ?? null);
      setForceEdit(false);
      if (isEditQuery) {
        router.replace(
          `/app/avaliacoes/${assessmentId}/anamnese/questionario-completo`
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
    setStepIdx(0);
  }

  function handleStartNew() {
    setData(EMPTY_FULL_QUESTIONNAIRE);
    setSaved(false);
    setForceEdit(true);
    setStepIdx(0);
  }

  const currentStep = FULL_STEPS[stepIdx];
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === FULL_STEPS.length - 1;

  function goNext() {
    if (!isLast) {
      setStepIdx((i) => i + 1);
      scrollMobileTop();
    }
  }
  function goBack() {
    if (!isFirst) {
      setStepIdx((i) => i - 1);
      scrollMobileTop();
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Questionário Completo" showBack>
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
    savedData != null && savedData.version === "v2";
  const isViewMode = hasSavedData && !isEditQuery && !forceEdit;

  if (isViewMode && savedData) {
    return (
      <MobileLayout title="Questionário Completo" showBack>
        <FullQuestionnaireView
          data={savedData}
          completedAt={savedAt}
          onEdit={handleEdit}
          onStartNew={handleStartNew}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Questionário Completo" showBack>
      <div className="p-4 flex flex-col gap-4 pb-24">
        {/* Header informativo */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <FileText className="size-6 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground text-sm">
              Questionário Completo
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Etapa {stepIdx + 1} de {FULL_STEPS.length} ·{" "}
              {currentStep.label}
            </p>
          </div>
        </div>

        {/* Stepper horizontal — componente único do design system */}
        <div className="-mx-4">
          <Stepper
            items={FULL_STEPS.map<GlobalStepperItem>((s, i) => ({
              id: s.id,
              label: String(i + 1),
              status:
                i < stepIdx ? "done" : i === stepIdx ? "active" : "pending",
            }))}
            onStepClick={(id) => {
              const idx = FULL_STEPS.findIndex((s) => s.id === id);
              if (idx >= 0) setStepIdx(idx);
            }}
            ariaLabel="Progresso do questionário completo"
          />
        </div>

        {/* Título da etapa atual (substitui o chip com nome) */}
        <h2 className="text-base font-semibold text-foreground -mt-1">
          {currentStep.label}
        </h2>

        {/* Conteúdo da etapa */}
        {currentStep.id === "exams" && (
          <ExamsSection exams={data.exams} onChange={patchExams} />
        )}
        {currentStep.id === "current" && (
          <CurrentHistorySection
            data={data.currentHistory}
            onChange={patchCurrentHistory}
          />
        )}
        {currentStep.id === "morbid" && (
          <MorbidHistorySection
            data={data.morbidHistory}
            onChange={patchMorbid}
          />
        )}
        {currentStep.id === "activity" && (
          <ActivitySection
            data={data.physicalActivity}
            onChange={patchActivity}
          />
        )}
        {currentStep.id === "diet" && (
          <DietSection data={data.diet} onChange={patchDiet} />
        )}
        {currentStep.id === "family" && (
          <FamilyHistorySection
            data={data.familyHistory}
            onChange={patchFamily}
          />
        )}
        {currentStep.id === "reassessment" && (
          <ReassessmentSection
            data={data.reassessment}
            onChange={patchReassessment}
          />
        )}
        {currentStep.id === "selfperception" && (
          <SelfPerceptionSection
            data={data.selfPerception}
            onChange={patchSelfPerception}
          />
        )}
        {currentStep.id === "report" && (
          <FinalReportSection
            data={data.finalReport}
            onChange={patchFinalReport}
          />
        )}

        {/* Navegação */}
        <div className="flex items-center justify-between gap-3 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={isFirst}
            className="h-12"
          >
            <ChevronLeft className="size-4 mr-1" />
            Voltar
          </Button>

          {!isLast ? (
            <Button type="button" onClick={goNext} className="h-12">
              Próximo
              <ChevronRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="h-12"
            >
              {isLoading ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="size-4 mr-2" />
              ) : null}
              {saved ? "Salvo" : "Salvar questionário"}
            </Button>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Etapa 1 — Últimos Exames
 * ────────────────────────────────────────────────────────────────────── */

function ExamsSection({
  exams,
  onChange,
}: {
  exams: FullExams;
  onChange: (patch: Partial<FullExams>) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          Últimos Exames
        </h3>
        <p className="text-xs text-muted-foreground -mt-2">
          Informe a data dos últimos exames realizados (opcional).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXAM_FIELDS.map((f) => (
            <div key={f.id} className="space-y-1.5">
              <Label htmlFor={`exam-${f.id}`} className="text-sm font-medium">
                {f.label}
              </Label>
              <Input
                id={`exam-${f.id}`}
                type="date"
                value={exams[f.id] ?? ""}
                onChange={(e) => onChange({ [f.id]: e.target.value || undefined } as Partial<FullExams>)}
                className="text-base"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Etapa 2 — Histórico Atual
 * ────────────────────────────────────────────────────────────────────── */

function CurrentHistorySection({
  data,
  onChange,
}: {
  data: CurrentHistory;
  onChange: (patch: Partial<CurrentHistory>) => void;
}) {
  function setAnswer(qid: string, v: "yes" | "no") {
    const nextAnswers = { ...data.answers, [qid]: v };
    let nextObs = data.observations;
    if (v === "no" && nextObs[qid]) {
      nextObs = { ...nextObs };
      delete nextObs[qid];
    }
    onChange({ answers: nextAnswers, observations: nextObs });
  }

  function setObservation(qid: string, t: string) {
    onChange({ observations: { ...data.observations, [qid]: t } });
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold text-foreground text-sm">Histórico Atual</h3>
      <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border/60">
        {CURRENT_HISTORY_QUESTIONS_BEFORE_PERSONALITY.map((q) => (
          <YesNoRow
            key={q.id}
            question={q}
            answer={data.answers[q.id] ?? null}
            observation={data.observations[q.id] ?? ""}
            dangerYes
            onAnswer={(v) => setAnswer(q.id, v)}
            onObservation={(t) => setObservation(q.id, t)}
          />
        ))}

        {/* Pergunta especial — Personalidade (radio inline) */}
        <PersonalityRow
          value={data.personality}
          onChange={(v) => onChange({ personality: v })}
        />

        {CURRENT_HISTORY_QUESTIONS_AFTER_PERSONALITY.map((q) => (
          <YesNoRow
            key={q.id}
            question={q}
            answer={data.answers[q.id] ?? null}
            observation={data.observations[q.id] ?? ""}
            dangerYes
            onAnswer={(v) => setAnswer(q.id, v)}
            onObservation={(t) => setObservation(q.id, t)}
          />
        ))}
      </div>
    </section>
  );
}

function PersonalityRow({
  value,
  onChange,
}: {
  value: PersonalityValue | undefined;
  onChange: (v: PersonalityValue) => void;
}) {
  return (
    <div className="flex flex-col gap-3 px-4 py-3.5">
      <p className="text-sm text-foreground/90 leading-relaxed">
        Você se considera uma pessoa:
      </p>
      <RadioPills
        ariaLabel="Personalidade"
        options={PERSONALITY_OPTIONS}
        value={value}
        onChange={(v) => onChange(v as PersonalityValue)}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Etapa 3 — Antecedentes Mórbidos
 * ────────────────────────────────────────────────────────────────────── */

function MorbidHistorySection({
  data,
  onChange,
}: {
  data: MorbidHistory;
  onChange: (patch: Partial<MorbidHistory>) => void;
}) {
  function setAnswer(qid: string, v: "yes" | "no") {
    const nextAnswers = { ...data.answers, [qid]: v };
    let nextObs = data.observations;
    if (v === "no" && nextObs[qid]) {
      nextObs = { ...nextObs };
      delete nextObs[qid];
    }
    onChange({ answers: nextAnswers, observations: nextObs });
  }
  function setObservation(qid: string, t: string) {
    onChange({ observations: { ...data.observations, [qid]: t } });
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold text-foreground text-sm">
        Antecedentes Mórbidos
      </h3>
      <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border/60">
        {MORBID_QUESTIONS.map((q) => (
          <YesNoRow
            key={q.id}
            question={q}
            answer={data.answers[q.id] ?? null}
            observation={data.observations[q.id] ?? ""}
            dangerYes
            onAnswer={(v) => setAnswer(q.id, v)}
            onObservation={(t) => setObservation(q.id, t)}
          />
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Etapa 4 — Atividade Física
 * ────────────────────────────────────────────────────────────────────── */

function ActivitySection({
  data,
  onChange,
}: {
  data: PhysicalActivity;
  onChange: (patch: Partial<PhysicalActivity>) => void;
}) {
  function setAnswer(qid: string, v: "yes" | "no") {
    const nextAnswers = { ...data.answers, [qid]: v };
    let nextObs = data.observations;
    if (v === "no" && nextObs[qid]) {
      nextObs = { ...nextObs };
      delete nextObs[qid];
    }
    onChange({ answers: nextAnswers, observations: nextObs });
  }
  function setObservation(qid: string, t: string) {
    onChange({ observations: { ...data.observations, [qid]: t } });
  }
  function setSport(name: string, v: string) {
    onChange({ sports: { ...data.sports, [name]: v } });
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold text-foreground text-sm">Atividade Física</h3>

      <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border/60">
        {ACTIVITY_QUESTIONS.map((q) => (
          <YesNoRow
            key={q.id}
            question={q}
            answer={data.answers[q.id] ?? null}
            observation={data.observations[q.id] ?? ""}
            onAnswer={(v) => setAnswer(q.id, v)}
            onObservation={(t) => setObservation(q.id, t)}
          />
        ))}
      </div>

      {/* Esportes */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">
            Quais atividades você gosta ou pratica?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SPORT_FIELDS.map((sport) => {
              const options = getSportOptions(sport);
              return (
                <div key={sport} className="space-y-1.5">
                  <Label
                    htmlFor={`sport-${sport}`}
                    className="text-sm font-medium"
                  >
                    {sport}
                  </Label>
                  <NativeSelect
                    id={`sport-${sport}`}
                    value={data.sports[sport] ?? ""}
                    onChange={(e) => setSport(sport, e.target.value)}
                  >
                    {options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Horário preferido + Deslocamento */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="preferred-time"
              className="text-sm font-medium"
            >
              Qual horário você prefere fazer exercício físico?
            </Label>
            <NativeSelect
              id="preferred-time"
              value={data.preferredTime ?? ""}
              onChange={(e) =>
                onChange({ preferredTime: e.target.value || undefined })
              }
            >
              {PREFERRED_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="commute" className="text-sm font-medium">
              Nos deslocamentos para o trabalho ou estudos, habitualmente são
              feitos de que forma?
            </Label>
            <NativeSelect
              id="commute"
              value={data.commute ?? ""}
              onChange={(e) =>
                onChange({ commute: e.target.value || undefined })
              }
            >
              {COMMUTE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Etapa 5 — Dieta
 * ────────────────────────────────────────────────────────────────────── */

function DietSection({
  data,
  onChange,
}: {
  data: DietData;
  onChange: (patch: Partial<DietData>) => void;
}) {
  function setWeekly(id: string, v: number | undefined) {
    const next = { ...data.weeklyFrequency };
    if (v === undefined) delete next[id];
    else next[id] = v;
    onChange({ weeklyFrequency: next });
  }

  function setDaily(id: string, v: number | undefined) {
    const next = { ...data.dailyPortions };
    if (v === undefined) delete next[id];
    else next[id] = v;
    onChange({ dailyPortions: next });
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold text-foreground text-sm">Dieta</h3>

      {/* Pesos + idade + alimentação */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumberWithUnit
              label="O que você considera um bom peso para você?"
              unit="kg"
              value={data.idealWeight}
              onChange={(v) => onChange({ idealWeight: v })}
            />
            <div className="space-y-1.5">
              <NumberWithUnit
                label="Qual o máximo de peso que você já pesou?"
                unit="kg"
                value={data.maxWeight}
                onChange={(v) => onChange({ maxWeight: v })}
              />
              <p className="text-[11px] text-muted-foreground">
                Necessário incluir período gestacional
              </p>
            </div>
            <NumberWithUnit
              label="Com qual idade?"
              unit="anos"
              value={data.maxWeightAge}
              onChange={(v) => onChange({ maxWeightAge: v })}
            />
            <NumberWithUnit
              label="Qual seu peso atual?"
              unit="kg"
              value={data.currentWeight}
              onChange={(v) => onChange({ currentWeight: v })}
            />
            <NumberWithUnit
              label="Número de refeições que você faz por dia"
              unit=""
              value={data.mealsPerDay}
              onChange={(v) => onChange({ mealsPerDay: v })}
              integer
            />
            <div className="space-y-1.5">
              <Label
                htmlFor="eating-quality"
                className="text-sm font-medium"
              >
                Você considera sua alimentação:
              </Label>
              <NativeSelect
                id="eating-quality"
                value={data.eatingQuality ?? ""}
                onChange={(e) =>
                  onChange({ eatingQuality: e.target.value || undefined })
                }
              >
                {EATING_QUALITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>

          {/* Quais refeições — multi-choice chips (componente global) */}
          <div className="space-y-2 pt-2">
            <Label className="text-sm font-medium">
              Quais dessas refeições você realiza?
            </Label>
            <MultiChoiceChips
              options={MEAL_OPTIONS.map((m) => ({
                value: m.id,
                label: m.label,
              }))}
              values={data.mealsTaken}
              onChange={(next) => onChange({ mealsTaken: next })}
              ariaLabel="Refeições realizadas"
            />
          </div>
        </CardContent>
      </Card>

      {/* Frequência semanal */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">
            Número de vezes por semana, que você comumente come:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {WEEKLY_FREQUENCY_FIELDS.map((f) => (
              <NumberWithUnit
                key={f.id}
                label={f.label}
                value={data.weeklyFrequency[f.id]}
                onChange={(v) => setWeekly(f.id, v)}
                placeholder="Digite um valor"
                integer
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Porções diárias */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">
            Número de porções (xícaras, copos) que você normalmente consome por
            dia:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DAILY_PORTION_FIELDS.map((f) => (
              <NumberWithUnit
                key={f.id}
                label={f.label}
                value={data.dailyPortions[f.id]}
                onChange={(v) => setDaily(f.id, v)}
                placeholder="Digite um valor"
                integer
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bebida alcoólica */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <YesNoRow
          question={{ id: "alcohol", text: "Você toma bebida alcoólica?" }}
          answer={data.drinksAlcohol ?? null}
          observation=""
          dangerYes
          onAnswer={(v) => onChange({ drinksAlcohol: v })}
          onObservation={() => {}}
          hideObservation
        />
      </div>

      {/* Acompanhamento nutricionista — radio com 3 opções */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="text-sm font-medium text-foreground">
            Faz acompanhamento com nutricionista ou endócrino?
          </p>
          <RadioPills
            ariaLabel="Acompanhamento nutricional"
            options={NUTRITIONIST_OPTIONS}
            value={data.nutritionist}
            onChange={(v) => onChange({ nutritionist: v as NutritionistValue })}
          />
        </CardContent>
      </Card>

      {/* Suplementos */}
      <Card>
        <CardContent className="p-4 space-y-1.5">
          <Label htmlFor="supplements" className="text-sm font-medium">
            Quais suplemento dietético, que você já tomou ou está tomando agora?
          </Label>
          <Input
            id="supplements"
            placeholder="Digite os suplementos dietéticos"
            value={data.supplements ?? ""}
            onChange={(e) =>
              onChange({ supplements: e.target.value || undefined })
            }
            className="text-base"
          />
        </CardContent>
      </Card>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Etapa 6 — Histórico Familiar
 * ────────────────────────────────────────────────────────────────────── */

function FamilyHistorySection({
  data,
  onChange,
}: {
  data: FamilyHistory;
  onChange: (patch: Partial<FamilyHistory>) => void;
}) {
  function setAnswer(qid: string, v: "yes" | "no") {
    const nextAnswers = { ...data.answers, [qid]: v };
    let nextObs = data.observations;
    if (v === "no" && nextObs[qid]) {
      nextObs = { ...nextObs };
      delete nextObs[qid];
    }
    onChange({ answers: nextAnswers, observations: nextObs });
  }
  function setObservation(qid: string, t: string) {
    onChange({ observations: { ...data.observations, [qid]: t } });
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold text-foreground text-sm">
        Histórico Familiar
      </h3>
      <p className="text-xs text-muted-foreground -mt-1">
        Marque as condições presentes em familiares de primeiro grau.
      </p>
      <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border/60">
        {FAMILY_HISTORY_QUESTIONS.map((q) => (
          <YesNoRow
            key={q.id}
            question={q}
            answer={data.answers[q.id] ?? null}
            observation={data.observations[q.id] ?? ""}
            dangerYes
            onAnswer={(v) => setAnswer(q.id, v)}
            onObservation={(t) => setObservation(q.id, t)}
          />
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Etapa 7 — Anamnese - Reavaliação Física
 * ────────────────────────────────────────────────────────────────────── */

function ReassessmentSection({
  data,
  onChange,
}: {
  data: PhysicalReassessment;
  onChange: (patch: Partial<PhysicalReassessment>) => void;
}) {
  function patchRecent(patch: Partial<PhysicalReassessment["recentActivity"]>) {
    onChange({ recentActivity: { ...data.recentActivity, ...patch } });
  }
  function patchIntended(
    patch: Partial<PhysicalReassessment["intendedActivity"]>
  ) {
    onChange({ intendedActivity: { ...data.intendedActivity, ...patch } });
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold text-foreground text-sm">
        Anamnese - Reavaliação Física
      </h3>

      {/* Quanto considera ter alcançado o objetivo */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">
            O quanto considera ter alcançado seu objetivo?
          </p>
          <RadioPills
            ariaLabel="Alcance do objetivo"
            options={GOAL_ACHIEVEMENT_OPTIONS}
            value={data.goalAchievement}
            onChange={(v) =>
              onChange({ goalAchievement: v as GoalAchievement })
            }
          />
        </CardContent>
      </Card>

      {/* Objetivo atual */}
      <Card>
        <CardContent className="p-4 space-y-1.5">
          <Label htmlFor="current-goal" className="text-sm font-medium">
            Qual o seu objetivo atual?
          </Label>
          <Input
            id="current-goal"
            placeholder="Descreva"
            value={data.currentGoal ?? ""}
            onChange={(e) =>
              onChange({ currentGoal: e.target.value || undefined })
            }
            className="text-base"
          />
        </CardContent>
      </Card>

      {/* Frequência de atividades no último período */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">
            Frequência de atividades no último período
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="recent-activity"
                className="text-sm font-medium"
              >
                Qual atividade?
              </Label>
              <Input
                id="recent-activity"
                placeholder="Digite uma atividade"
                value={data.recentActivity.activity ?? ""}
                onChange={(e) =>
                  patchRecent({ activity: e.target.value || undefined })
                }
                className="text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recent-time" className="text-sm font-medium">
                Qual foi o tempo gasto?
              </Label>
              <Input
                id="recent-time"
                placeholder="Informe o tempo"
                value={data.recentActivity.timeSpent ?? ""}
                onChange={(e) =>
                  patchRecent({ timeSpent: e.target.value || undefined })
                }
                className="text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="recent-frequency"
                className="text-sm font-medium"
              >
                Quantas vezes por semana?
              </Label>
              <NativeSelect
                id="recent-frequency"
                value={data.recentActivity.weeklyFrequency ?? ""}
                onChange={(e) =>
                  patchRecent({
                    weeklyFrequency: e.target.value || undefined,
                  })
                }
              >
                {WEEKLY_FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="recent-intensity"
                className="text-sm font-medium"
              >
                Qual a intensidade?
              </Label>
              <NativeSelect
                id="recent-intensity"
                value={data.recentActivity.intensity ?? ""}
                onChange={(e) =>
                  patchRecent({ intensity: e.target.value || undefined })
                }
              >
                {INTENSITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label
                htmlFor="recent-duration"
                className="text-sm font-medium"
              >
                Pratica a quanto tempo?
              </Label>
              <Input
                id="recent-duration"
                placeholder="Informe o tempo"
                value={data.recentActivity.duration ?? ""}
                onChange={(e) =>
                  patchRecent({ duration: e.target.value || undefined })
                }
                className="text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Atividades pretendidas */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">
            Atividades pretendidas
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="intended-frequency"
                className="text-sm font-medium"
              >
                Quantas vezes por semana?
              </Label>
              <NativeSelect
                id="intended-frequency"
                value={data.intendedActivity.weeklyFrequency ?? ""}
                onChange={(e) =>
                  patchIntended({
                    weeklyFrequency: e.target.value || undefined,
                  })
                }
              >
                {WEEKLY_FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="intended-activity"
                className="text-sm font-medium"
              >
                Atividade
              </Label>
              <Input
                id="intended-activity"
                placeholder="Digite uma atividade"
                value={data.intendedActivity.activity ?? ""}
                onChange={(e) =>
                  patchIntended({ activity: e.target.value || undefined })
                }
                className="text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avaliação da alimentação no período */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">
            Como avalia sua alimentação no período?
          </p>
          <RadioPills
            ariaLabel="Avaliação da alimentação"
            options={DIET_ASSESSMENT_OPTIONS}
            value={data.dietAssessment}
            onChange={(v) =>
              onChange({ dietAssessment: v as DietAssessment })
            }
          />
        </CardContent>
      </Card>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Etapa 8 — Autopercepção
 * ────────────────────────────────────────────────────────────────────── */

function SelfPerceptionSection({
  data,
  onChange,
}: {
  data: SelfPerception;
  onChange: (patch: Partial<SelfPerception>) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold text-foreground text-sm">Autopercepção</h3>

      <RatingRow
        label="Como avalia sua qualidade de vida?"
        value={data.qualityOfLife}
        onChange={(v) => onChange({ qualityOfLife: v })}
      />
      <RatingRow
        label="Como avalia seu condicionamento físico?"
        value={data.fitnessCondition}
        onChange={(v) => onChange({ fitnessCondition: v })}
      />
      <RatingRow
        label="Como avalia sua aparência física?"
        value={data.appearance}
        onChange={(v) => onChange({ appearance: v })}
      />
      <RatingRow
        label="Como avalia o seu humor?"
        value={data.mood}
        onChange={(v) => onChange({ mood: v })}
      />

      {/* Sono — horas + horários */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NumberWithUnit
              label="Quantas horas dorme por noite?"
              unit="h"
              value={data.sleepHours}
              onChange={(v) => onChange({ sleepHours: v })}
              placeholder="Digite um número"
              integer
            />
            <div className="space-y-1.5">
              <Label htmlFor="bed-time" className="text-sm font-medium">
                Dorme às:
              </Label>
              <Input
                id="bed-time"
                type="time"
                value={data.bedTime ?? ""}
                onChange={(e) =>
                  onChange({ bedTime: e.target.value || undefined })
                }
                className="text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wake-time" className="text-sm font-medium">
                Acorda às:
              </Label>
              <Input
                id="wake-time"
                type="time"
                value={data.wakeTime ?? ""}
                onChange={(e) =>
                  onChange({ wakeTime: e.target.value || undefined })
                }
                className="text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <RatingRow
        label="Como avalia sua qualidade do seu sono?"
        value={data.sleepQuality}
        onChange={(v) => onChange({ sleepQuality: v })}
      />

      <SometimesRow
        label="Se sente sonolento durante o dia?"
        value={data.daytimeSleepiness}
        onChange={(v) => onChange({ daytimeSleepiness: v })}
      />
      <SometimesRow
        label="Se sente descansado após acordar?"
        value={data.restedAfterSleep}
        onChange={(v) => onChange({ restedAfterSleep: v })}
      />
    </section>
  );
}

function RatingRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Rating | undefined;
  onChange: (v: Rating) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <RadioPills
          ariaLabel={label}
          options={RATING_OPTIONS}
          value={value}
          onChange={(v) => onChange(v as Rating)}
        />
      </CardContent>
    </Card>
  );
}

function SometimesRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: SometimesRating | undefined;
  onChange: (v: SometimesRating) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <RadioPills
          ariaLabel={label}
          options={SOMETIMES_RATING_OPTIONS}
          value={value}
          onChange={(v) => onChange(v as SometimesRating)}
        />
      </CardContent>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Etapa 9 — Laudo Final
 * ────────────────────────────────────────────────────────────────────── */

function FinalReportSection({
  data,
  onChange,
}: {
  data: FinalReport;
  onChange: (patch: Partial<FinalReport>) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold text-foreground text-sm">Laudo Final</h3>

      {/* 4 opções clínicas — radio cards full-width */}
      <div
        role="radiogroup"
        aria-label="Conclusão da anamnese"
        className="flex flex-col gap-2"
      >
        {FINAL_REPORT_OPTIONS.map((opt) => {
          const selected = data.conclusion === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() =>
                onChange({ conclusion: opt.value as FinalConclusion })
              }
              className={cn(
                "flex items-start gap-3 p-4 rounded-2xl border text-left transition-colors active:scale-[0.99]",
                selected
                  ? "bg-primary/10 border-primary/40"
                  : "bg-card border-border hover:bg-muted/30"
              )}
            >
              <span
                className={cn(
                  "shrink-0 mt-0.5 size-4 rounded-full border-2 transition-colors",
                  selected
                    ? "border-primary bg-primary ring-2 ring-primary/20"
                    : "border-border bg-background"
                )}
                aria-hidden
              />
              <p className="text-sm text-foreground/90 leading-relaxed flex-1">
                {opt.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Observações */}
      <Card>
        <CardContent className="p-4 space-y-1.5">
          <Label htmlFor="report-obs" className="text-sm font-medium">
            Observações
          </Label>
          <textarea
            id="report-obs"
            placeholder="Adicione alguma observação importante sobre o resultado obtido"
            value={data.observations ?? ""}
            onChange={(e) =>
              onChange({ observations: e.target.value || undefined })
            }
            className={cn(
              "w-full rounded-lg border border-border bg-background/60",
              "px-3 py-2.5 text-sm text-foreground",
              "placeholder:text-muted-foreground/70",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "min-h-[6rem] resize-none"
            )}
          />
        </CardContent>
      </Card>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Helpers UI: YesNoRow + NumberWithUnit
 * ────────────────────────────────────────────────────────────────────── */

function YesNoRow({
  question,
  answer,
  observation,
  dangerYes,
  hideObservation,
  onAnswer,
  onObservation,
}: {
  question: YesNoQuestion;
  answer: "yes" | "no" | null;
  observation: string;
  dangerYes?: boolean;
  hideObservation?: boolean;
  onAnswer: (v: "yes" | "no") => void;
  onObservation: (t: string) => void;
}) {
  const showObs = !hideObservation && answer === "yes";
  return (
    <div className="flex flex-col gap-3 px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-foreground/90 leading-relaxed flex-1 min-w-0 pt-1">
          {question.text}
        </p>
        <YesNoButtons
          value={answer}
          onChange={onAnswer}
          variant="inline"
          dangerYes={dangerYes}
          ariaLabel={`Resposta para: ${question.text}`}
        />
      </div>
      {showObs && (
        <div className="animate-in fade-in slide-in-from-top-2 fill-mode-both duration-300">
          <textarea
            placeholder="Adicione alguma observação importante sobre o resultado obtido"
            value={observation}
            onChange={(e) => onObservation(e.target.value)}
            aria-label={`Observação para: ${question.text}`}
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

function NumberWithUnit({
  label,
  unit,
  value,
  onChange,
  placeholder = "Digite um número",
  integer,
}: {
  label: string;
  unit?: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  integer?: boolean;
}) {
  const [raw, setRaw] = useState<string>(value != null ? String(value) : "");

  // mantém raw em sincronia quando value muda externamente
  useMemo(() => {
    setRaw(value != null ? String(value) : "");
  }, [value]);

  function handleChange(next: string) {
    setRaw(next);
    if (next === "") {
      onChange(undefined);
      return;
    }
    const cleaned = next.replace(",", ".");
    const n = integer ? parseInt(cleaned, 10) : parseFloat(cleaned);
    if (Number.isFinite(n)) onChange(n);
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-stretch gap-2">
        <Input
          type="text"
          inputMode={integer ? "numeric" : "decimal"}
          pattern={integer ? "[0-9]*" : "[0-9.,]*"}
          placeholder={placeholder}
          value={raw}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 text-base"
        />
        {unit && (
          <span className="self-center text-sm text-muted-foreground w-12 text-center">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
