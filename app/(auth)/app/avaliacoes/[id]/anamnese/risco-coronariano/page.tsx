"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  HeartPulse,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CORONARY_QUESTIONS,
  calcCoronaryRiskLevel,
  calcCoronaryScore,
  describeCoronaryRisk,
  getCoronaryMaxScore,
  isAllAnswered,
  type CoronaryRiskData,
} from "@/lib/data/coronary-questions";
import { CoronaryRiskView } from "@/components/assessments/coronary/coronary-risk-view";

export default function RiscoCoronarianoPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = params.id as string;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [savedData, setSavedData] = useState<CoronaryRiskData | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [forceEdit, setForceEdit] = useState(false);
  const isEditQuery = searchParams.get("mode") === "edit";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${assessmentId}/anamnesis`);
        if (res.ok) {
          const data = await res.json();
          const persisted = data?.coronaryRisk;
          // Compatibilidade: aceitar shape v2 (atual). Versões anteriores
          // (booleanos) são ignoradas — o usuário deve refazer a avaliação.
          if (
            persisted &&
            typeof persisted === "object" &&
            persisted.version === "v2" &&
            persisted.answers
          ) {
            const v2 = persisted as CoronaryRiskData;
            setAnswers(v2.answers ?? {});
            setNotes(v2.notes ?? "");
            setSavedData(v2);
            setSavedAt(v2.completedAt ?? data?.updatedAt ?? null);
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

  const maxScore = useMemo(() => getCoronaryMaxScore(), []);
  const score = useMemo(() => calcCoronaryScore(answers), [answers]);
  const allAnswered = useMemo(() => isAllAnswered(answers), [answers]);
  const riskLevel = useMemo(
    () => calcCoronaryRiskLevel(score, maxScore),
    [score, maxScore]
  );

  function setAnswer(questionKey: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      const payload: CoronaryRiskData = {
        version: "v2",
        answers,
        notes: notes.trim() || undefined,
        completedAt: new Date().toISOString(),
        riskLevel,
        score,
      };
      await fetch(`/api/assessments/${assessmentId}/anamnesis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coronaryRisk: payload }),
      });
      toast.success("Risco coronariano salvo!");
      setSaved(true);
      setSavedData(payload);
      setSavedAt(payload.completedAt ?? null);
      setForceEdit(false);
      if (isEditQuery) {
        router.replace(
          `/app/avaliacoes/${assessmentId}/anamnese/risco-coronariano`
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
    setNotes("");
    setSaved(false);
    setForceEdit(true);
  }

  if (isFetching) {
    return (
      <MobileLayout title="Risco Coronariano" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  /* Modo leitura: dados salvos válidos e usuário não pediu edição */
  const hasSavedData =
    savedData != null && isAllAnswered(savedData.answers ?? {});
  const isViewMode = hasSavedData && !isEditQuery && !forceEdit;

  if (isViewMode && savedData) {
    const savedScore =
      savedData.score ?? calcCoronaryScore(savedData.answers ?? {});
    const savedLevel =
      savedData.riskLevel ?? calcCoronaryRiskLevel(savedScore, maxScore);
    return (
      <MobileLayout title="Risco Coronariano" showBack>
        <CoronaryRiskView
          questions={CORONARY_QUESTIONS}
          answers={savedData.answers ?? {}}
          notes={savedData.notes}
          score={savedScore}
          maxScore={maxScore}
          riskLevel={savedLevel}
          description={describeCoronaryRisk(savedLevel)}
          completedAt={savedAt}
          onEdit={handleEdit}
          onStartNew={handleStartNew}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Risco Coronariano" showBack>
      <div className="p-4 flex flex-col gap-4">
        {/* Header informativo */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <HeartPulse className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">
              Estratificação de Risco Coronariano
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {CORONARY_QUESTIONS.length} fatores categorizados · pontuação 0–
              {maxScore}
            </p>
          </div>
        </div>

        {/* Resultado preview (durante edição) */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            Resultado
          </Label>
          {!allAnswered ? (
            <div className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-5 space-y-1">
              <div className="flex items-center gap-2 text-foreground/80">
                <Info className="size-4" />
                <p className="text-sm font-semibold">
                  Nenhuma classificação de risco
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Preencha o formulário para obter uma estimativa do nível de
                risco cardiovascular.
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "rounded-xl border-2 px-4 py-4 space-y-1.5",
                riskLevel === "low"
                  ? "bg-primary/5 border-primary/30"
                  : riskLevel === "moderate"
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-destructive/10 border-destructive/30"
              )}
            >
              <div className="flex items-center justify-between">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    riskLevel === "low"
                      ? "text-primary"
                      : riskLevel === "moderate"
                        ? "text-amber-600 dark:text-amber-300"
                        : "text-destructive"
                  )}
                >
                  {riskLevel === "low"
                    ? "Risco Baixo"
                    : riskLevel === "moderate"
                      ? "Risco Moderado"
                      : riskLevel === "high"
                        ? "Risco Alto"
                        : "Risco Muito Alto"}
                </p>
                <span
                  className={cn(
                    "text-xs font-bold tabular-nums px-2 py-0.5 rounded-full",
                    riskLevel === "low"
                      ? "bg-primary/15 text-primary"
                      : riskLevel === "moderate"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                        : "bg-destructive/15 text-destructive"
                  )}
                >
                  {score} / {maxScore} pts
                </span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {describeCoronaryRisk(riskLevel)}
              </p>
            </div>
          )}
        </div>

        {/* Questões — dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4">
          {CORONARY_QUESTIONS.map((q) => (
            <div key={q.key} className="space-y-1.5">
              <Label
                htmlFor={`coronary-${q.key}`}
                className="text-sm font-medium text-foreground"
              >
                {q.label}
              </Label>
              <NativeSelect
                id={`coronary-${q.key}`}
                value={answers[q.key] ?? ""}
                onChange={(e) => setAnswer(q.key, e.target.value)}
              >
                <option value="" disabled>
                  Selecione uma opção
                </option>
                {q.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
          ))}
        </div>

        {/* Observações */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <Label
            htmlFor="coronary-notes"
            className="text-sm font-medium text-foreground"
          >
            Observações
          </Label>
          <textarea
            id="coronary-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione alguma observação importante sobre o resultado obtido"
            rows={4}
            className={cn(
              "flex w-full rounded-md border border-input bg-background px-3 py-2",
              "text-sm ring-offset-background placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "resize-none"
            )}
          />
        </div>

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
          {saved ? "Salvo" : "Salvar risco coronariano"}
        </Button>
      </div>
    </MobileLayout>
  );
}
