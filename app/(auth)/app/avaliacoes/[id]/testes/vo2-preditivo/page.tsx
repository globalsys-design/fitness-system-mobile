"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Wind, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PROTOCOLS = [
  { key: "astrand", label: "Åstrand-Ryhming", desc: "Cicloergômetro submáximo" },
  { key: "cooper", label: "Cooper (12 min)", desc: "Corrida/caminhada de 12 minutos" },
  { key: "rockport", label: "Rockport (1 milha)", desc: "Caminhada de 1 milha" },
  { key: "queens_college", label: "Queens College", desc: "Step test de 3 minutos" },
];

interface VO2PredData {
  protocol: string;
  age: string;
  weight: string;
  gender: "M" | "F" | null;
  // Cooper
  distanceMeters: string;
  // Rockport
  walkTimeMin: string;
  hrEnd: string;
  // Queens College
  hrRecovery: string;
  // Astrand
  workload: string;
  hrSteadyState: string;
}

const INITIAL: VO2PredData = {
  protocol: "cooper",
  age: "",
  weight: "",
  gender: null,
  distanceMeters: "",
  walkTimeMin: "",
  hrEnd: "",
  hrRecovery: "",
  workload: "",
  hrSteadyState: "",
};

function calcVO2(data: VO2PredData): number | null {
  const age = parseFloat(data.age);
  const weight = parseFloat(data.weight);

  switch (data.protocol) {
    case "cooper": {
      const dist = parseFloat(data.distanceMeters);
      if (isNaN(dist) || dist <= 0) return null;
      return (dist - 504.9) / 44.73;
    }
    case "rockport": {
      const time = parseFloat(data.walkTimeMin);
      const hr = parseFloat(data.hrEnd);
      if (isNaN(time) || isNaN(hr) || isNaN(weight) || isNaN(age) || !data.gender) return null;
      const genderVal = data.gender === "M" ? 1 : 0;
      return 132.853 - 0.0769 * weight * 2.205 - 0.3877 * age + 6.315 * genderVal - 3.2649 * time - 0.1565 * hr;
    }
    case "queens_college": {
      const hr = parseFloat(data.hrRecovery);
      if (isNaN(hr) || !data.gender) return null;
      if (data.gender === "M") return 111.33 - 0.42 * hr;
      return 65.81 - 0.1847 * hr;
    }
    case "astrand": {
      const hr = parseFloat(data.hrSteadyState);
      const work = parseFloat(data.workload);
      if (isNaN(hr) || isNaN(work) || hr <= 0) return null;
      // Simplified Åstrand nomogram
      const vo2L = (work * 2) / (hr - 60) * 0.014 + 0.3;
      if (isNaN(weight) || weight <= 0) return vo2L * 1000 / 70; // assume 70kg
      return (vo2L * 1000) / weight;
    }
    default:
      return null;
  }
}

function getVO2Classification(vo2: number, age: number, gender: string | null) {
  // Simplified ACSM classification
  if (vo2 >= 50) return { label: "Excelente", color: "text-primary", bg: "bg-primary/10" };
  if (vo2 >= 42) return { label: "Bom", color: "text-primary", bg: "bg-primary/10" };
  if (vo2 >= 35) return { label: "Regular", color: "text-warning", bg: "bg-warning/10" };
  if (vo2 >= 28) return { label: "Fraco", color: "text-orange-600", bg: "bg-orange-500/10" };
  return { label: "Muito Fraco", color: "text-destructive", bg: "bg-destructive/10" };
}

export default function VO2PreditivoPage() {
  const params = useParams();
  const [data, setData] = useState<VO2PredData>(INITIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/fitness-tests`);
        if (res.ok) {
          const d = await res.json();
          if (d?.vo2Predictive) setData({ ...INITIAL, ...(d.vo2Predictive as VO2PredData) });
        }
      } catch {
        /* empty */
      } finally {
        setIsFetching(false);
      }
    }
    load();
  }, [params.id]);

  const vo2 = useMemo(() => calcVO2(data), [data]);
  const age = parseFloat(data.age);
  const classification = vo2 && !isNaN(age) ? getVO2Classification(vo2, age, data.gender) : null;

  function update<K extends keyof VO2PredData>(key: K, val: VO2PredData[K]) {
    setData((d) => ({ ...d, [key]: val }));
    setSaved(false);
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/fitness-tests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vo2Predictive: { ...data, calculatedVO2: vo2 },
        }),
      });
      toast.success("VO₂ preditivo salvo!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="VO₂ Preditivo" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="VO₂ Preditivo" showBack>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Wind className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">VO₂máx Preditivo</p>
            <p className="text-xs text-muted-foreground mt-0.5">Estimativa por protocolo submáximo</p>
          </div>
        </div>

        {/* Protocol selector */}
        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 block">Protocolo</Label>
            <div className="flex flex-col gap-2">
              {PROTOCOLS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => update("protocol", p.key)}
                  className={cn(
                    "flex flex-col items-start p-3 rounded-xl text-left transition-colors",
                    data.protocol === p.key
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-muted border border-transparent"
                  )}
                >
                  <span className={cn("text-sm font-medium", data.protocol === p.key ? "text-primary" : "text-foreground")}>{p.label}</span>
                  <span className="text-xs text-muted-foreground">{p.desc}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Common fields */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">Idade</Label>
              <Input type="number" inputMode="decimal" placeholder="0" value={data.age} onChange={(e) => update("age", e.target.value)} className="text-base" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">Peso (kg)</Label>
              <Input type="number" inputMode="decimal" placeholder="0" value={data.weight} onChange={(e) => update("weight", e.target.value)} className="text-base" />
            </CardContent>
          </Card>
        </div>

        {/* Gender */}
        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 block">Sexo</Label>
            <div className="flex gap-2">
              {(["M", "F"] as const).map((g) => (
                <button key={g} type="button" onClick={() => update("gender", g)} className={cn("flex-1 h-12 rounded-xl text-sm font-semibold transition-colors", data.gender === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  {g === "M" ? "Masculino" : "Feminino"}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Protocol-specific fields */}
        {data.protocol === "cooper" && (
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">Distância percorrida</Label>
              <div className="flex items-center gap-2">
                <Input type="number" inputMode="decimal" placeholder="0" value={data.distanceMeters} onChange={(e) => update("distanceMeters", e.target.value)} className="flex-1 text-base" />
                <span className="text-sm text-muted-foreground">metros</span>
              </div>
            </CardContent>
          </Card>
        )}

        {data.protocol === "rockport" && (
          <>
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium mb-2 block">Tempo da caminhada</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" inputMode="decimal" placeholder="0" value={data.walkTimeMin} onChange={(e) => update("walkTimeMin", e.target.value)} className="flex-1 text-base" />
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium mb-2 block">FC ao final</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" inputMode="decimal" placeholder="0" value={data.hrEnd} onChange={(e) => update("hrEnd", e.target.value)} className="flex-1 text-base" />
                  <span className="text-sm text-muted-foreground">bpm</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {data.protocol === "queens_college" && (
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">FC de recuperação (15s × 4)</Label>
              <div className="flex items-center gap-2">
                <Input type="number" inputMode="decimal" placeholder="0" value={data.hrRecovery} onChange={(e) => update("hrRecovery", e.target.value)} className="flex-1 text-base" />
                <span className="text-sm text-muted-foreground">bpm</span>
              </div>
            </CardContent>
          </Card>
        )}

        {data.protocol === "astrand" && (
          <>
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium mb-2 block">Carga de trabalho</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" inputMode="decimal" placeholder="0" value={data.workload} onChange={(e) => update("workload", e.target.value)} className="flex-1 text-base" />
                  <span className="text-sm text-muted-foreground">watts</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium mb-2 block">FC steady-state</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" inputMode="decimal" placeholder="0" value={data.hrSteadyState} onChange={(e) => update("hrSteadyState", e.target.value)} className="flex-1 text-base" />
                  <span className="text-sm text-muted-foreground">bpm</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* VO2 Result */}
        {vo2 && vo2 > 0 && classification && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">VO₂máx Estimado</Label>
                <Badge variant="secondary" className={cn("text-xs", classification.bg, classification.color)}>
                  {classification.label}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {vo2.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">mL/kg/min</span>
              </p>
            </CardContent>
          </Card>
        )}

        <Button className="w-full" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="size-4 mr-2 animate-spin" /> : saved ? <CheckCircle2 className="size-4 mr-2" /> : null}
          {saved ? "Salvo" : "Salvar VO₂ preditivo"}
        </Button>
      </div>
    </MobileLayout>
  );
}
