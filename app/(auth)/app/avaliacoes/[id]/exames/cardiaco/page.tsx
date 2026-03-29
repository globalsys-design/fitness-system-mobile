"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Heart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { AnamnesisToggle } from "@/components/assessments/anamnesis-toggle";
import { Skeleton } from "@/components/ui/skeleton";

interface CardiacData {
  ecg: boolean | null;
  ecgNotes: string;
  echocardiogram: boolean | null;
  echoNotes: string;
  stressTest: boolean | null;
  stressTestNotes: string;
  maxHR: string;
  restHR: string;
  rhythm: string;
  observations: string;
}

const INITIAL: CardiacData = {
  ecg: null,
  ecgNotes: "",
  echocardiogram: null,
  echoNotes: "",
  stressTest: null,
  stressTestNotes: "",
  maxHR: "",
  restHR: "",
  rhythm: "",
  observations: "",
};

export default function CardiacoPage() {
  const params = useParams();
  const [data, setData] = useState<CardiacData>(INITIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/clinical-exams`);
        if (res.ok) {
          const d = await res.json();
          if (d?.cardiacExam) setData({ ...INITIAL, ...(d.cardiacExam as CardiacData) });
        }
      } catch {
        /* empty */
      } finally {
        setIsFetching(false);
      }
    }
    load();
  }, [params.id]);

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/clinical-exams`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardiacExam: data }),
      });
      toast.success("Exame cardíaco salvo!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Exame Cardíaco" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Exame Cardíaco" showBack>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Heart className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">Avaliação Cardíaca</p>
            <p className="text-xs text-muted-foreground mt-0.5">Registro de exames e parâmetros cardíacos</p>
          </div>
        </div>

        {/* Exam toggles */}
        <AnamnesisToggle
          question="Eletrocardiograma (ECG) realizado e normal?"
          questionNumber={1}
          value={data.ecg}
          onChange={(val) => setData((d) => ({ ...d, ecg: val }))}
        />
        {data.ecg !== null && (
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">Observações do ECG</Label>
              <Input placeholder="Resultados..." value={data.ecgNotes} onChange={(e) => setData((d) => ({ ...d, ecgNotes: e.target.value }))} className="h-12 text-base" />
            </CardContent>
          </Card>
        )}

        <AnamnesisToggle
          question="Ecocardiograma realizado e normal?"
          questionNumber={2}
          value={data.echocardiogram}
          onChange={(val) => setData((d) => ({ ...d, echocardiogram: val }))}
        />
        {data.echocardiogram !== null && (
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">Observações do Ecocardiograma</Label>
              <Input placeholder="Resultados..." value={data.echoNotes} onChange={(e) => setData((d) => ({ ...d, echoNotes: e.target.value }))} className="h-12 text-base" />
            </CardContent>
          </Card>
        )}

        <AnamnesisToggle
          question="Teste ergométrico realizado e normal?"
          questionNumber={3}
          value={data.stressTest}
          onChange={(val) => setData((d) => ({ ...d, stressTest: val }))}
        />
        {data.stressTest !== null && (
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">Observações do teste</Label>
              <Input placeholder="Resultados..." value={data.stressTestNotes} onChange={(e) => setData((d) => ({ ...d, stressTestNotes: e.target.value }))} className="h-12 text-base" />
            </CardContent>
          </Card>
        )}

        {/* Numeric fields */}
        <h3 className="font-semibold text-foreground text-sm mt-2">Parâmetros</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">FC Repouso</Label>
              <div className="flex items-center gap-2">
                <Input type="number" inputMode="decimal" placeholder="0" value={data.restHR} onChange={(e) => setData((d) => ({ ...d, restHR: e.target.value }))} className="h-12 flex-1 text-base" />
                <span className="text-sm text-muted-foreground">bpm</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">FC Máxima</Label>
              <div className="flex items-center gap-2">
                <Input type="number" inputMode="decimal" placeholder="0" value={data.maxHR} onChange={(e) => setData((d) => ({ ...d, maxHR: e.target.value }))} className="h-12 flex-1 text-base" />
                <span className="text-sm text-muted-foreground">bpm</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-2 block">Ritmo Cardíaco</Label>
            <Input placeholder="Ex: Sinusal, regular..." value={data.rhythm} onChange={(e) => setData((d) => ({ ...d, rhythm: e.target.value }))} className="h-12 text-base" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-2 block">Observações gerais</Label>
            <textarea placeholder="Informações adicionais..." value={data.observations} onChange={(e) => setData((d) => ({ ...d, observations: e.target.value }))} className="flex w-full rounded-xl border border-input bg-background px-3 py-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[5rem] resize-none" />
          </CardContent>
        </Card>

        <Button className="h-12 w-full" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="size-4 mr-2 animate-spin" /> : saved ? <CheckCircle2 className="size-4 mr-2" /> : null}
          {saved ? "Salvo" : "Salvar exame cardíaco"}
        </Button>
      </div>
    </MobileLayout>
  );
}
