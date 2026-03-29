"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, HeartPulse, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { AnamnesisToggle } from "@/components/assessments/anamnesis-toggle";
import { RiskDashboardCard } from "@/components/assessments/risk-dashboard-card";
import { Skeleton } from "@/components/ui/skeleton";

const RISK_FACTORS = [
  { key: "age", question: "Homem ≥ 45 anos ou Mulher ≥ 55 anos (ou menopausa prematura sem TRH)?" },
  { key: "family", question: "Histórico familiar de infarto ou morte súbita cardíaca em parente de 1° grau (homem < 55 anos; mulher < 65 anos)?" },
  { key: "smoking", question: "Fumante atual ou parou nos últimos 6 meses?" },
  { key: "sedentary", question: "Sedentário (não atinge 150 min/semana de atividade física moderada)?" },
  { key: "obesity", question: "IMC ≥ 30 kg/m² ou circunferência abdominal > 102 cm (H) / > 88 cm (M)?" },
  { key: "hypertension", question: "Pressão arterial ≥ 140/90 mmHg confirmada em 2+ ocasiões, ou em uso de medicação anti-hipertensiva?" },
  { key: "dyslipidemia", question: "LDL ≥ 130 mg/dL, HDL < 40 mg/dL, ou colesterol total > 200 mg/dL, ou em uso de medicação hipolipemiante?" },
  { key: "glucose", question: "Glicemia de jejum ≥ 100 mg/dL confirmada em 2+ ocasiões?" },
];

const NEGATIVE_FACTOR = {
  key: "hdl_high",
  question: "HDL > 60 mg/dL? (fator protetor — subtrai 1 ponto do risco)",
};

export default function RiscoCoronarianoPage() {
  const params = useParams();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/anamnesis`);
        if (res.ok) {
          const data = await res.json();
          if (data?.coronaryRisk)
            setAnswers(data.coronaryRisk as Record<string, boolean>);
        }
      } catch {
        /* empty */
      } finally {
        setIsFetching(false);
      }
    }
    load();
  }, [params.id]);

  const positiveCount = RISK_FACTORS.filter((f) => answers[f.key] === true).length;
  const hasProtective = answers[NEGATIVE_FACTOR.key] === true;
  const score = Math.max(0, positiveCount - (hasProtective ? 1 : 0));

  const allFactors = [...RISK_FACTORS, NEGATIVE_FACTOR];
  const answeredCount = allFactors.filter((f) => answers[f.key] !== undefined).length;
  const allAnswered = answeredCount === allFactors.length;

  const riskLevel =
    score <= 1
      ? "low"
      : score <= 3
        ? "moderate"
        : score <= 5
          ? "high"
          : "very-high";

  const classification =
    score <= 1
      ? "Baixo Risco — Pode iniciar programa de exercícios sem necessidade de avaliação médica adicional."
      : score <= 3
        ? "Risco Moderado — Recomenda-se avaliação médica antes de exercícios vigorosos."
        : "Alto Risco — Necessita avaliação médica completa antes de qualquer programa de exercícios.";

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/anamnesis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coronaryRisk: answers }),
      });
      toast.success("Risco coronariano salvo!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Risco Coronariano" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Risco Coronariano" showBack>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <HeartPulse className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">
              Estratificação de Risco (ACSM)
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              8 fatores de risco + 1 fator protetor
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">
            {answeredCount}/{allFactors.length} respondidas
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{
              width: `${(answeredCount / allFactors.length) * 100}%`,
            }}
          />
        </div>

        {/* Risk factors */}
        <h3 className="font-semibold text-foreground text-sm mt-2">
          Fatores de Risco
        </h3>
        {RISK_FACTORS.map((f, i) => (
          <AnamnesisToggle
            key={f.key}
            question={f.question}
            questionNumber={i + 1}
            value={answers[f.key] ?? null}
            onChange={(val) => setAnswers((a) => ({ ...a, [f.key]: val }))}
          />
        ))}

        {/* Protective factor */}
        <h3 className="font-semibold text-foreground text-sm mt-2">
          Fator Protetor (negativo)
        </h3>
        <AnamnesisToggle
          question={NEGATIVE_FACTOR.question}
          questionNumber={9}
          value={answers[NEGATIVE_FACTOR.key] ?? null}
          onChange={(val) =>
            setAnswers((a) => ({ ...a, [NEGATIVE_FACTOR.key]: val }))
          }
        />

        {/* Result */}
        {allAnswered && (
          <RiskDashboardCard
            title="Risco Coronariano (ACSM)"
            score={score}
            maxScore={8}
            riskLevel={riskLevel}
            description={classification}
          />
        )}

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
          {saved ? "Salvo" : "Salvar risco coronariano"}
        </Button>
      </div>
    </MobileLayout>
  );
}
