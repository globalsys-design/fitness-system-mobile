"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, FileText, CheckCircle2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Skeleton } from "@/components/ui/skeleton";

interface ExamEntry {
  name: string;
  date: string;
  result: string;
  notes: string;
}

export default function OutrosExamesPage() {
  const params = useParams();
  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/clinical-exams`);
        if (res.ok) {
          const d = await res.json();
          if (d?.otherExams) {
            const oe = d.otherExams as Record<string, unknown>;
            setExams((oe.exams as ExamEntry[]) ?? []);
            setGeneralNotes((oe.generalNotes as string) ?? "");
          }
        }
      } catch {
        /* empty */
      } finally {
        setIsFetching(false);
      }
    }
    load();
  }, [params.id]);

  function addExam() {
    setExams((e) => [...e, { name: "", date: "", result: "", notes: "" }]);
    setSaved(false);
  }

  function removeExam(index: number) {
    setExams((e) => e.filter((_, i) => i !== index));
    setSaved(false);
  }

  function updateExam(index: number, field: keyof ExamEntry, value: string) {
    setExams((e) =>
      e.map((exam, i) => (i === index ? { ...exam, [field]: value } : exam))
    );
    setSaved(false);
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/clinical-exams`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otherExams: { exams, generalNotes },
        }),
      });
      toast.success("Outros exames salvos!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Outros Exames" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Outros Exames" showBack>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <FileText className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">Outros Exames</p>
            <p className="text-xs text-muted-foreground mt-0.5">Registre exames complementares</p>
          </div>
        </div>

        {exams.map((exam, idx) => (
          <Card key={idx}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Exame {idx + 1}</Label>
                <button
                  type="button"
                  onClick={() => removeExam(idx)}
                  className="flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
              <Input placeholder="Nome do exame" value={exam.name} onChange={(e) => updateExam(idx, "name", e.target.value)} className="text-base" />
              <Input type="date" value={exam.date} onChange={(e) => updateExam(idx, "date", e.target.value)} className="text-base" />
              <Input placeholder="Resultado" value={exam.result} onChange={(e) => updateExam(idx, "result", e.target.value)} className="text-base" />
              <Input placeholder="Observações" value={exam.notes} onChange={(e) => updateExam(idx, "notes", e.target.value)} className="text-base" />
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" className="w-full" onClick={addExam} type="button">
          <Plus className="size-4 mr-2" />
          Adicionar exame
        </Button>

        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-2 block">Observações gerais</Label>
            <textarea
              placeholder="Laudos, pareceres médicos..."
              value={generalNotes}
              onChange={(e) => { setGeneralNotes(e.target.value); setSaved(false); }}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[5rem] resize-none"
            />
          </CardContent>
        </Card>

        <Button className="w-full" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="size-4 mr-2 animate-spin" /> : saved ? <CheckCircle2 className="size-4 mr-2" /> : null}
          {saved ? "Salvo" : "Salvar exames"}
        </Button>
      </div>
    </MobileLayout>
  );
}
