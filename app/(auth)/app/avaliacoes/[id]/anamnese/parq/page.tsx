"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { AnamnesisToggle } from "@/components/assessments/anamnesis-toggle";
import { RiskDashboardCard } from "@/components/assessments/risk-dashboard-card";
import { Skeleton } from "@/components/ui/skeleton";

const PARQ_QUESTIONS = [
  "Algum médico já disse que você possui algum problema de coração e que só deveria realizar atividade física supervisionado por profissionais de saúde?",
  "Você sente dor no peito quando pratica atividade física?",
  "No último mês, você sentiu dor no peito quando praticou atividade física?",
  "Você apresenta desequilíbrio devido à tontura e/ou perda de consciência?",
  "Você possui algum problema ósseo ou articular que poderia ser piorado pela atividade física?",
  "Você toma atualmente algum medicamento para pressão arterial e/ou problema de coração?",
  "Sabe de alguma outra razão pela qual você não deve praticar atividade física?",
  "Você tem diabetes ou problemas de glicemia?",
  "Você tem ou já teve problemas respiratórios como asma?",
  "Você tem histórico familiar de doença cardíaca antes dos 55 anos (homens) ou 65 anos (mulheres)?",
  "Você fuma ou parou de fumar nos últimos 6 meses?",
  "Você tem colesterol alto ou usa medicação para controlar o colesterol?",
  "Você tem pressão arterial elevada ou usa medicação para pressão?",
  "Seu IMC é superior a 30 kg/m²?",
  "Você é sedentário (menos de 150 min/semana de atividade física moderada)?",
  "Você tem ou teve algum problema muscular ou articular nos últimos 12 meses?",
  "Você está grávida ou teve parto nos últimos 12 meses?",
  "Existe alguma condição não mencionada que possa afetar sua participação em atividade física?",
];

export default function ParqPage() {
  const params = useParams();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/anamnesis`);
        if (res.ok) {
          const data = await res.json();
          if (data?.parq) setAnswers(data.parq as Record<number, boolean>);
        }
      } catch {
        /* empty */
      } finally {
        setIsFetching(false);
      }
    }
    load();
  }, [params.id]);

  const yesCount = Object.values(answers).filter((v) => v === true).length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === PARQ_QUESTIONS.length;

  const riskLevel =
    yesCount === 0
      ? "low"
      : yesCount <= 2
        ? "moderate"
        : yesCount <= 5
          ? "high"
          : "very-high";

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/anamnesis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parq: answers }),
      });
      toast.success("PAR-Q+ salvo com sucesso!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="PAR-Q+" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="PAR-Q+" showBack>
      <div className="p-4 flex flex-col gap-4">
        {/* Info banner */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <AlertTriangle className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">
              Questionário de Prontidão para Atividade Física
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Responda todas as {PARQ_QUESTIONS.length} perguntas
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">
            {answeredCount}/{PARQ_QUESTIONS.length} respondidas
          </span>
          {yesCount > 0 && (
            <span className="text-xs text-destructive font-medium">
              {yesCount} resposta{yesCount > 1 ? "s" : ""} positiva
              {yesCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{
              width: `${(answeredCount / PARQ_QUESTIONS.length) * 100}%`,
            }}
          />
        </div>

        {/* Questions */}
        {PARQ_QUESTIONS.map((q, i) => (
          <AnamnesisToggle
            key={i}
            question={q}
            questionNumber={i + 1}
            value={answers[i] ?? null}
            onChange={(val) => setAnswers((a) => ({ ...a, [i]: val }))}
          />
        ))}

        {/* Risk result */}
        {allAnswered && (
          <RiskDashboardCard
            title="Resultado PAR-Q+"
            score={yesCount}
            maxScore={PARQ_QUESTIONS.length}
            riskLevel={riskLevel}
            description={
              yesCount === 0
                ? "Nenhuma restrição identificada. O cliente está apto para iniciar atividade física."
                : yesCount <= 2
                  ? "Atenção moderada. Recomenda-se acompanhamento profissional."
                  : "Risco elevado identificado. Encaminhar para avaliação médica antes de iniciar."
            }
          />
        )}

        {/* Save */}
        <Button
          className="h-12 w-full"
          onClick={handleSave}
          disabled={isLoading || !allAnswered}
        >
          {isLoading ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="size-4 mr-2" />
          ) : null}
          {saved ? "Salvo" : "Salvar PAR-Q+"}
        </Button>
      </div>
    </MobileLayout>
  );
}
