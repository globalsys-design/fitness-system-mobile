"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { AnamnesisToggle } from "@/components/assessments/anamnesis-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SYSTEM_SECTIONS = [
  {
    title: "Sistema Cardiovascular",
    questions: [
      "Sente dor ou opressão no peito?",
      "Apresenta palpitações ou batimentos cardíacos irregulares?",
      "Tem inchaço nos pés, tornozelos ou pernas?",
      "Sente falta de ar ao deitar-se (ortopneia)?",
      "Já teve diagnóstico de sopro cardíaco?",
    ],
  },
  {
    title: "Sistema Respiratório",
    questions: [
      "Apresenta tosse persistente?",
      "Tem falta de ar ao realizar atividades do dia a dia?",
      "Tem ou já teve asma?",
      "Já teve pneumonia ou bronquite frequente?",
      "Faz uso de inaladores ou broncodilatadores?",
    ],
  },
  {
    title: "Sistema Musculoesquelético",
    questions: [
      "Sente dor articular frequente?",
      "Tem limitação de movimento em alguma articulação?",
      "Já teve fratura óssea?",
      "Tem diagnóstico de artrite, artrose ou osteoporose?",
      "Sente dor lombar frequente?",
      "Já fez fisioterapia?",
    ],
  },
  {
    title: "Sistema Metabólico / Endócrino",
    questions: [
      "Tem diagnóstico de diabetes (tipo 1 ou 2)?",
      "Tem diagnóstico de disfunção tireoidiana (hipo/hipertireoidismo)?",
      "Já teve alteração significativa de peso nos últimos 6 meses?",
      "Possui síndrome metabólica diagnosticada?",
    ],
  },
  {
    title: "Sistema Neurológico",
    questions: [
      "Tem episódios de tontura ou vertigem?",
      "Já perdeu a consciência (desmaio)?",
      "Tem dores de cabeça frequentes?",
      "Tem diagnóstico de epilepsia ou convulsões?",
      "Apresenta dormência ou formigamento em membros?",
    ],
  },
  {
    title: "Saúde Mental",
    questions: [
      "Tem diagnóstico de depressão ou ansiedade?",
      "Faz uso de medicação psiquiátrica?",
      "Tem dificuldade para dormir (insônia)?",
      "Sente-se frequentemente sem energia ou motivação?",
    ],
  },
];

interface FullQuestionnaireData {
  answers: Record<string, boolean>;
  familyHistory: string;
  surgicalHistory: string;
  currentMedications: string;
  supplementation: string;
  dietType: string;
  waterIntake: string;
  sleepHours: string;
  stressLevel: string;
  painAreas: string;
  additionalNotes: string;
}

const INITIAL: FullQuestionnaireData = {
  answers: {},
  familyHistory: "",
  surgicalHistory: "",
  currentMedications: "",
  supplementation: "",
  dietType: "",
  waterIntake: "",
  sleepHours: "",
  stressLevel: "",
  painAreas: "",
  additionalNotes: "",
};

const STRESS_LEVELS = ["Baixo", "Moderado", "Alto", "Muito Alto"];

export default function QuestionarioCompletoPage() {
  const params = useParams();
  const [data, setData] = useState<FullQuestionnaireData>(INITIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/anamnesis`);
        if (res.ok) {
          const d = await res.json();
          if (d?.fullQuestionnaire)
            setData({ ...INITIAL, ...d.fullQuestionnaire });
        }
      } catch {
        /* empty */
      } finally {
        setIsFetching(false);
      }
    }
    load();
  }, [params.id]);

  let qNum = 0;

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/anamnesis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullQuestionnaire: data }),
      });
      toast.success("Questionário completo salvo!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
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

  return (
    <MobileLayout title="Questionário Completo" showBack>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <FileText className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">
              Anamnese Completa por Sistemas
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Avaliação detalhada de todos os sistemas corporais
            </p>
          </div>
        </div>

        {/* System-based questions */}
        {SYSTEM_SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground text-sm mt-2 px-1">
              {section.title}
            </h3>
            {section.questions.map((q) => {
              qNum++;
              const key = `sys_${qNum}`;
              return (
                <AnamnesisToggle
                  key={key}
                  question={q}
                  questionNumber={qNum}
                  value={data.answers[key] ?? null}
                  onChange={(val) =>
                    setData((d) => ({
                      ...d,
                      answers: { ...d.answers, [key]: val },
                    }))
                  }
                />
              );
            })}
          </div>
        ))}

        {/* Complementary fields */}
        <h3 className="font-semibold text-foreground text-sm mt-2 px-1">
          Informações Complementares
        </h3>

        <Card>
          <CardContent className="p-4 space-y-4">
            {[
              {
                key: "familyHistory" as const,
                label: "Histórico familiar de doenças",
                placeholder: "Ex: Pai com hipertensão, mãe com diabetes...",
              },
              {
                key: "surgicalHistory" as const,
                label: "Cirurgias realizadas",
                placeholder: "Ex: Apendicectomia em 2020...",
              },
              {
                key: "currentMedications" as const,
                label: "Medicamentos em uso",
                placeholder: "Nome, dosagem e frequência...",
              },
              {
                key: "supplementation" as const,
                label: "Suplementação",
                placeholder: "Ex: Whey, Creatina, Vitamina D...",
              },
              {
                key: "dietType" as const,
                label: "Tipo de dieta",
                placeholder: "Ex: Onívora, vegetariana, low carb...",
              },
              {
                key: "painAreas" as const,
                label: "Áreas de dor ou desconforto",
                placeholder: "Ex: Lombar, joelho direito...",
              },
            ].map((field) => (
              <div key={field.key}>
                <Label className="text-sm font-medium mb-2 block">
                  {field.label}
                </Label>
                <Input
                  placeholder={field.placeholder}
                  value={data[field.key]}
                  onChange={(e) =>
                    setData((d) => ({ ...d, [field.key]: e.target.value }))
                  }
                  className="h-12 text-base"
                />
              </div>
            ))}

            {/* Numeric fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Água/dia (L)
                </Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="2.0"
                  value={data.waterIntake}
                  onChange={(e) =>
                    setData((d) => ({ ...d, waterIntake: e.target.value }))
                  }
                  className="h-12 text-base"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Sono (horas)
                </Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="7"
                  value={data.sleepHours}
                  onChange={(e) =>
                    setData((d) => ({ ...d, sleepHours: e.target.value }))
                  }
                  className="h-12 text-base"
                />
              </div>
            </div>

            {/* Stress level */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Nível de estresse
              </Label>
              <div className="flex gap-2">
                {STRESS_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setData((d) => ({ ...d, stressLevel: level }))
                    }
                    className={cn(
                      "flex-1 h-10 rounded-xl text-xs font-medium transition-colors",
                      data.stressLevel === level
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Observações gerais
              </Label>
              <textarea
                placeholder="Informações adicionais relevantes..."
                value={data.additionalNotes}
                onChange={(e) =>
                  setData((d) => ({ ...d, additionalNotes: e.target.value }))
                }
                className="flex w-full rounded-xl border border-input bg-background px-3 py-3 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[6rem] resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          className="h-12 w-full"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="size-4 mr-2" />
          ) : null}
          {saved ? "Salvo" : "Salvar questionário completo"}
        </Button>
      </div>
    </MobileLayout>
  );
}
