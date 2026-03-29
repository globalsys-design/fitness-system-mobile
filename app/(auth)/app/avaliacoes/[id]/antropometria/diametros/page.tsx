"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Maximize2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { MeasurementInput } from "@/components/assessments/measurement-input";
import { guideImages } from "@/components/assessments/guide-images";
import { Skeleton } from "@/components/ui/skeleton";

const DIAMETERS = [
  { key: "biestiloide", label: "Biestilóide (Punho)" },
  { key: "biepicondilo_umeral", label: "Biepicôndilo Umeral (Cotovelo)" },
  { key: "biepicondilo_femoral", label: "Biepicôndilo Femoral (Joelho)" },
];

export default function DiametrosPage() {
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
          if (data?.diameters) setValues(data.diameters as Record<string, string>);
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
        body: JSON.stringify({ diameters: values }),
      });
      toast.success("Diâmetros salvos!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Diâmetros" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Diâmetros" showBack>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Maximize2 className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">
              Diâmetros Ósseos
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Medidas com paquímetro em centímetros
            </p>
          </div>
        </div>

        {DIAMETERS.map((d) => {
          const guide = guideImages[d.key];
          return (
            <MeasurementInput
              key={d.key}
              label={d.label}
              unit="cm"
              value={values[d.key] ?? ""}
              onChange={(val) => {
                setValues((v) => ({ ...v, [d.key]: val }));
                setSaved(false);
              }}
              guideImage={guide?.image}
              guideTip={guide?.tip}
              icon={Maximize2}
              iconColor="text-primary"
              iconBg="bg-primary/10"
              min={0}
              max={20}
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
          {saved ? "Salvo" : "Salvar diâmetros"}
        </Button>
      </div>
    </MobileLayout>
  );
}
