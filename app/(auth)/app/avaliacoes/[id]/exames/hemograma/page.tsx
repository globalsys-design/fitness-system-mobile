"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Droplets, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Skeleton } from "@/components/ui/skeleton";

const BLOOD_FIELDS = [
  { key: "hemoglobin", label: "Hemoglobina", unit: "g/dL", ref: "H: 13-17 | M: 12-16" },
  { key: "hematocrit", label: "Hematócrito", unit: "%", ref: "H: 40-54 | M: 36-48" },
  { key: "redBloodCells", label: "Hemácias", unit: "milhões/mm³", ref: "H: 4.5-6.0 | M: 4.0-5.5" },
  { key: "whiteBloodCells", label: "Leucócitos", unit: "/mm³", ref: "4.000-11.000" },
  { key: "platelets", label: "Plaquetas", unit: "/mm³", ref: "150.000-450.000" },
  { key: "glucose", label: "Glicemia Jejum", unit: "mg/dL", ref: "70-99" },
  { key: "totalCholesterol", label: "Colesterol Total", unit: "mg/dL", ref: "< 200" },
  { key: "hdl", label: "HDL", unit: "mg/dL", ref: "> 40" },
  { key: "ldl", label: "LDL", unit: "mg/dL", ref: "< 130" },
  { key: "triglycerides", label: "Triglicerídeos", unit: "mg/dL", ref: "< 150" },
  { key: "uricAcid", label: "Ácido Úrico", unit: "mg/dL", ref: "H: 3.5-7.2 | M: 2.6-6.0" },
  { key: "creatinine", label: "Creatinina", unit: "mg/dL", ref: "H: 0.7-1.3 | M: 0.6-1.1" },
  { key: "tsh", label: "TSH", unit: "mUI/L", ref: "0.4-4.0" },
  { key: "vitaminD", label: "Vitamina D", unit: "ng/mL", ref: "30-60" },
  { key: "iron", label: "Ferro sérico", unit: "µg/dL", ref: "H: 65-175 | M: 50-170" },
  { key: "ferritin", label: "Ferritina", unit: "ng/mL", ref: "H: 20-500 | M: 20-200" },
];

export default function HemogramaPage() {
  const params = useParams();
  const [values, setValues] = useState<Record<string, string>>({});
  const [examDate, setExamDate] = useState("");
  const [observations, setObservations] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/clinical-exams`);
        if (res.ok) {
          const d = await res.json();
          if (d?.bloodCount) {
            const bc = d.bloodCount as Record<string, unknown>;
            setValues((bc.values as Record<string, string>) ?? {});
            setExamDate((bc.examDate as string) ?? "");
            setObservations((bc.observations as string) ?? "");
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

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/clinical-exams`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloodCount: { values, examDate, observations },
        }),
      });
      toast.success("Hemograma salvo!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Hemograma" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Hemograma" showBack>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Droplets className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">Exames Laboratoriais</p>
            <p className="text-xs text-muted-foreground mt-0.5">Hemograma completo e bioquímica</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-2 block">Data do exame</Label>
            <Input type="date" value={examDate} onChange={(e) => { setExamDate(e.target.value); setSaved(false); }} className="h-12 text-base" />
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground px-1">
          {Object.keys(values).filter((k) => values[k]).length}/{BLOOD_FIELDS.length} campos preenchidos
        </p>

        {BLOOD_FIELDS.map((field) => (
          <Card key={field.key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-sm font-medium">{field.label}</Label>
              </div>
              <p className="text-[0.6875rem] text-muted-foreground mb-2">Ref: {field.ref}</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={values[field.key] ?? ""}
                  onChange={(e) => {
                    setValues((v) => ({ ...v, [field.key]: e.target.value }));
                    setSaved(false);
                  }}
                  className="h-12 flex-1 text-base"
                />
                <span className="text-xs text-muted-foreground w-20 text-right shrink-0">{field.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-2 block">Observações</Label>
            <textarea placeholder="Laudos, alterações, recomendações..." value={observations} onChange={(e) => { setObservations(e.target.value); setSaved(false); }} className="flex w-full rounded-xl border border-input bg-background px-3 py-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[5rem] resize-none" />
          </CardContent>
        </Card>

        <Button className="h-12 w-full" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="size-4 mr-2 animate-spin" /> : saved ? <CheckCircle2 className="size-4 mr-2" /> : null}
          {saved ? "Salvo" : "Salvar hemograma"}
        </Button>
      </div>
    </MobileLayout>
  );
}
