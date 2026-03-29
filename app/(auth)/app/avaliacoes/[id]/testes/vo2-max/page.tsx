"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PROTOCOLS = [
  { key: "treadmill_bruce", label: "Esteira — Bruce" },
  { key: "treadmill_balke", label: "Esteira — Balke" },
  { key: "treadmill_ellestad", label: "Esteira — Ellestad" },
  { key: "cycle_direct", label: "Cicloergômetro — Direto" },
  { key: "other", label: "Outro protocolo" },
];

interface VO2MaxData {
  protocol: string;
  vo2max: string;
  maxHR: string;
  maxSpeed: string;
  maxIncline: string;
  testDuration: string;
  reasonStopped: string;
  rer: string;
  ventilationMax: string;
  lactateMax: string;
  observations: string;
}

const INITIAL: VO2MaxData = {
  protocol: "treadmill_bruce",
  vo2max: "",
  maxHR: "",
  maxSpeed: "",
  maxIncline: "",
  testDuration: "",
  reasonStopped: "",
  rer: "",
  ventilationMax: "",
  lactateMax: "",
  observations: "",
};

function getVO2Classification(vo2: number) {
  if (vo2 >= 55) return { label: "Superior", color: "text-primary", bg: "bg-primary/10" };
  if (vo2 >= 47) return { label: "Excelente", color: "text-primary", bg: "bg-primary/10" };
  if (vo2 >= 40) return { label: "Bom", color: "text-primary", bg: "bg-primary/10" };
  if (vo2 >= 33) return { label: "Regular", color: "text-warning", bg: "bg-warning/10" };
  if (vo2 >= 25) return { label: "Fraco", color: "text-orange-600", bg: "bg-orange-500/10" };
  return { label: "Muito Fraco", color: "text-destructive", bg: "bg-destructive/10" };
}

export default function VO2MaxPage() {
  const params = useParams();
  const [data, setData] = useState<VO2MaxData>(INITIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/fitness-tests`);
        if (res.ok) {
          const d = await res.json();
          if (d?.vo2Max) setData({ ...INITIAL, ...(d.vo2Max as VO2MaxData) });
        }
      } catch {
        /* empty */
      } finally {
        setIsFetching(false);
      }
    }
    load();
  }, [params.id]);

  const vo2val = parseFloat(data.vo2max);
  const classification = !isNaN(vo2val) && vo2val > 0 ? getVO2Classification(vo2val) : null;

  function update(key: keyof VO2MaxData, value: string) {
    setData((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/fitness-tests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vo2Max: data }),
      });
      toast.success("VO₂máx salvo!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="VO₂ Máximo" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="VO₂ Máximo" showBack>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Zap className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">Teste de VO₂máx Direto</p>
            <p className="text-xs text-muted-foreground mt-0.5">Teste máximo com ergoespirometria</p>
          </div>
        </div>

        {/* Protocol */}
        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 block">Protocolo</Label>
            <div className="flex flex-wrap gap-2">
              {PROTOCOLS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => update("protocol", p.key)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                    data.protocol === p.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* VO2 max value */}
        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-2 block">VO₂máx medido</Label>
            <div className="flex items-center gap-2">
              <Input type="number" inputMode="decimal" placeholder="0" value={data.vo2max} onChange={(e) => update("vo2max", e.target.value)} className="flex-1 text-base" />
              <span className="text-sm text-muted-foreground">mL/kg/min</span>
            </div>
            {classification && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className={cn("text-xs", classification.bg, classification.color)}>
                  {classification.label}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test parameters */}
        <h3 className="font-semibold text-foreground text-sm mt-2">Parâmetros do Teste</h3>

        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "maxHR" as const, label: "FC Máxima", unit: "bpm" },
            { key: "testDuration" as const, label: "Duração", unit: "min" },
            { key: "maxSpeed" as const, label: "Velocidade Máx", unit: "km/h" },
            { key: "maxIncline" as const, label: "Inclinação Máx", unit: "%" },
            { key: "rer" as const, label: "RER (R)", unit: "" },
            { key: "ventilationMax" as const, label: "VE máx", unit: "L/min" },
          ].map((field) => (
            <Card key={field.key}>
              <CardContent className="p-3">
                <Label className="text-xs font-medium mb-1.5 block">{field.label}</Label>
                <div className="flex items-center gap-1">
                  <Input type="number" inputMode="decimal" placeholder="0" value={data[field.key]} onChange={(e) => update(field.key, e.target.value)} className="h-10 flex-1 text-sm" />
                  {field.unit && <span className="text-xs text-muted-foreground shrink-0">{field.unit}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-2 block">Lactato máximo</Label>
            <div className="flex items-center gap-2">
              <Input type="number" inputMode="decimal" placeholder="0" value={data.lactateMax} onChange={(e) => update("lactateMax", e.target.value)} className="flex-1 text-base" />
              <span className="text-sm text-muted-foreground">mmol/L</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-2 block">Motivo da interrupção</Label>
            <Input placeholder="Ex: Exaustão, sintomas, limite HR..." value={data.reasonStopped} onChange={(e) => update("reasonStopped", e.target.value)} className="text-base" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-2 block">Observações</Label>
            <textarea placeholder="Informações adicionais do teste..." value={data.observations} onChange={(e) => update("observations", e.target.value)} className="flex w-full rounded-xl border border-input bg-background px-3 py-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[5rem] resize-none" />
          </CardContent>
        </Card>

        <Button className="w-full" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="size-4 mr-2 animate-spin" /> : saved ? <CheckCircle2 className="size-4 mr-2" /> : null}
          {saved ? "Salvo" : "Salvar VO₂máx"}
        </Button>
      </div>
    </MobileLayout>
  );
}
