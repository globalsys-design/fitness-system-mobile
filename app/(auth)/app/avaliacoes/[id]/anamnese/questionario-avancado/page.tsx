"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ClipboardList, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { AnamnesisToggle } from "@/components/assessments/anamnesis-toggle";
import { Skeleton } from "@/components/ui/skeleton";

const SECTIONS = [
  {
    title: "Histórico de Saúde",
    questions: [
      "Já foi internado(a) em hospital?",
      "Fez alguma cirurgia nos últimos 5 anos?",
      "Possui alguma doença crônica diagnosticada?",
      "Apresenta alguma alergia a medicamentos?",
      "Faz uso contínuo de algum medicamento?",
    ],
  },
  {
    title: "Hábitos de Vida",
    questions: [
      "Consome bebida alcoólica regularmente (mais de 2x por semana)?",
      "Dorme menos de 6 horas por noite regularmente?",
      "Possui uma alimentação equilibrada e variada?",
      "Ingere pelo menos 2 litros de água por dia?",
      "Sente-se frequentemente estressado(a) ou ansioso(a)?",
    ],
  },
  {
    title: "Histórico de Exercícios",
    questions: [
      "Pratica atividade física atualmente?",
      "Já praticou atividade física de forma regular anteriormente?",
      "Já sofreu alguma lesão durante a prática de exercícios?",
      "Sente dor ou desconforto durante atividade física?",
      "Já fez acompanhamento com profissional de Educação Física?",
    ],
  },
];

interface AdvancedData {
  answers: Record<string, boolean>;
  medications: string;
  allergies: string;
  observations: string;
}

export default function QuestionarioAvancadoPage() {
  const params = useParams();
  const [data, setData] = useState<AdvancedData>({
    answers: {},
    medications: "",
    allergies: "",
    observations: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/anamnesis`);
        if (res.ok) {
          const d = await res.json();
          if (d?.advancedQuestionnaire)
            setData({
              answers: {},
              medications: "",
              allergies: "",
              observations: "",
              ...d.advancedQuestionnaire,
            });
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
        body: JSON.stringify({ advancedQuestionnaire: data }),
      });
      toast.success("Questionário salvo!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Questionário Avançado" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Questionário Avançado" showBack>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <ClipboardList className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">
              Questionário Avançado de Saúde
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Histórico detalhado de saúde e hábitos
            </p>
          </div>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground text-sm mt-2">
              {section.title}
            </h3>
            {section.questions.map((q) => {
              qNum++;
              const key = `q_${qNum}`;
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

        {/* Text fields */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Medicamentos em uso
              </Label>
              <Input
                placeholder="Liste os medicamentos..."
                value={data.medications}
                onChange={(e) =>
                  setData((d) => ({ ...d, medications: e.target.value }))
                }
                className="h-12 text-base"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Alergias conhecidas
              </Label>
              <Input
                placeholder="Liste as alergias..."
                value={data.allergies}
                onChange={(e) =>
                  setData((d) => ({ ...d, allergies: e.target.value }))
                }
                className="h-12 text-base"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Observações adicionais
              </Label>
              <textarea
                placeholder="Informações complementares..."
                value={data.observations}
                onChange={(e) =>
                  setData((d) => ({ ...d, observations: e.target.value }))
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
          {saved ? "Salvo" : "Salvar questionário"}
        </Button>
      </div>
    </MobileLayout>
  );
}
