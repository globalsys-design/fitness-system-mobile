"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Scale, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface WeightHeightData {
  weight: string;
  height: string;
  waist: string;
  hip: string;
}

const INITIAL: WeightHeightData = {
  weight: "",
  height: "",
  waist: "",
  hip: "",
};

function getIMCClassification(imc: number) {
  if (imc < 18.5) return { label: "Abaixo do peso", color: "text-warning", bg: "bg-warning/10" };
  if (imc < 25) return { label: "Eutrófico", color: "text-primary", bg: "bg-primary/10" };
  if (imc < 30) return { label: "Sobrepeso", color: "text-warning", bg: "bg-warning/10" };
  if (imc < 35) return { label: "Obesidade Grau I", color: "text-orange-600", bg: "bg-orange-500/10" };
  if (imc < 40) return { label: "Obesidade Grau II", color: "text-destructive", bg: "bg-destructive/10" };
  return { label: "Obesidade Grau III", color: "text-destructive", bg: "bg-destructive/15" };
}

function getRCQClassification(rcq: number, gender?: string) {
  if (gender === "F") {
    if (rcq < 0.80) return { label: "Baixo Risco", color: "text-primary", bg: "bg-primary/10" };
    if (rcq < 0.85) return { label: "Risco Moderado", color: "text-warning", bg: "bg-warning/10" };
    return { label: "Alto Risco", color: "text-destructive", bg: "bg-destructive/10" };
  }
  if (rcq < 0.90) return { label: "Baixo Risco", color: "text-primary", bg: "bg-primary/10" };
  if (rcq < 0.95) return { label: "Risco Moderado", color: "text-warning", bg: "bg-warning/10" };
  return { label: "Alto Risco", color: "text-destructive", bg: "bg-destructive/10" };
}

export default function PesoEstatura() {
  const params = useParams();
  const [data, setData] = useState<WeightHeightData>(INITIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/anthropometry`);
        if (res.ok) {
          const d = await res.json();
          if (d?.weight || d?.height) {
            setData({
              weight: d.weight?.toString() ?? "",
              height: d.height?.toString() ?? "",
              waist: (d.perimeters as Record<string, string> | null)?.cintura ?? "",
              hip: (d.perimeters as Record<string, string> | null)?.quadril ?? "",
            });
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

  const weight = parseFloat(data.weight);
  const heightCm = parseFloat(data.height);
  const heightM = heightCm / 100;
  const waist = parseFloat(data.waist);
  const hip = parseFloat(data.hip);

  const imc = useMemo(() => {
    if (!weight || !heightM || heightM <= 0) return null;
    return weight / (heightM * heightM);
  }, [weight, heightM]);

  const rcq = useMemo(() => {
    if (!waist || !hip || hip <= 0) return null;
    return waist / hip;
  }, [waist, hip]);

  const imcClass = imc ? getIMCClassification(imc) : null;
  const rcqClass = rcq ? getRCQClassification(rcq) : null;

  function update(key: keyof WeightHeightData, value: string) {
    setData((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/anthropometry`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: weight || null,
          height: heightCm || null,
        }),
      });
      toast.success("Peso e estatura salvos!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Peso e Estatura" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Peso e Estatura" showBack>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Scale className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">
              Peso, Estatura e Indicadores
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              IMC e RCQ calculados automaticamente
            </p>
          </div>
        </div>

        {/* Weight & Height */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">Peso</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={data.weight}
                  onChange={(e) => update("weight", e.target.value)}
                  className="flex-1 text-base"
                />
                <span className="text-sm text-muted-foreground">kg</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">Estatura</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={data.height}
                  onChange={(e) => update("height", e.target.value)}
                  className="flex-1 text-base"
                />
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* IMC Result */}
        {imc && imcClass && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">IMC</Label>
                <Badge
                  variant="secondary"
                  className={cn("text-xs", imcClass.bg, imcClass.color)}
                >
                  {imcClass.label}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {imc.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  kg/m²
                </span>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Waist & Hip for RCQ */}
        <h3 className="font-semibold text-foreground text-sm mt-2">
          Relação Cintura-Quadril (RCQ)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">Cintura</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={data.waist}
                  onChange={(e) => update("waist", e.target.value)}
                  className="flex-1 text-base"
                />
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">Quadril</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={data.hip}
                  onChange={(e) => update("hip", e.target.value)}
                  className="flex-1 text-base"
                />
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RCQ Result */}
        {rcq && rcqClass && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">RCQ</Label>
                <Badge
                  variant="secondary"
                  className={cn("text-xs", rcqClass.bg, rcqClass.color)}
                >
                  {rcqClass.label}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {rcq.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        )}

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
          {saved ? "Salvo" : "Salvar peso e estatura"}
        </Button>
      </div>
    </MobileLayout>
  );
}
