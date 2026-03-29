"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Ruler, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { MeasurementInput } from "@/components/assessments/measurement-input";
import { guideImages } from "@/components/assessments/guide-images";
import { Skeleton } from "@/components/ui/skeleton";

const PERIMETERS = [
  { key: "pescoco", label: "Pescoço" },
  { key: "ombro", label: "Ombro" },
  { key: "torax", label: "Tórax" },
  { key: "cintura", label: "Cintura" },
  { key: "abdomen", label: "Abdômen" },
  { key: "quadril", label: "Quadril" },
  { key: "braco_relaxado", label: "Braço Relaxado" },
  { key: "braco_contraido", label: "Braço Contraído" },
  { key: "antebraco", label: "Antebraço" },
  { key: "punho", label: "Punho" },
  { key: "coxa_proximal", label: "Coxa Proximal" },
  { key: "coxa_medial", label: "Coxa Medial" },
  { key: "coxa_distal", label: "Coxa Distal" },
  { key: "perna", label: "Perna (Panturrilha)" },
  { key: "tornozelo", label: "Tornozelo" },
];

export default function PerimetrosPage() {
  const params = useParams();
  const [values, setValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/anthropometry`);
        if (res.ok) {
          const data = await res.json();
          if (data?.perimeters) setValues(data.perimeters as Record<string, string>);
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
      await fetch(`/api/assessments/${params.id}/anthropometry`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ perimeters: values }),
      });
      toast.success("Perímetros salvos!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Perímetros" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Perímetros" showBack>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Ruler className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">
              Perímetros Corporais
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Circunferências em centímetros. Toque em &quot;Técnica&quot; para ver o guia.
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground px-1">
          {Object.keys(values).filter((k) => values[k]).length}/{PERIMETERS.length} medidas preenchidas
        </p>

        {PERIMETERS.map((p) => {
          const guide = guideImages[p.key];
          return (
            <MeasurementInput
              key={p.key}
              label={p.label}
              unit="cm"
              value={values[p.key] ?? ""}
              onChange={(val) => {
                setValues((v) => ({ ...v, [p.key]: val }));
                setSaved(false);
              }}
              guideImage={guide?.image}
              guideTip={guide?.tip}
              icon={Ruler}
              iconColor="text-primary"
              iconBg="bg-primary/10"
              min={0}
              max={300}
            />
          );
        })}

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="size-4 mr-2" />
          ) : null}
          {saved ? "Salvo" : "Salvar perímetros"}
        </Button>
      </div>
    </MobileLayout>
  );
}
