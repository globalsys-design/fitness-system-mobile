"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Activity, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { RiskDashboardCard } from "@/components/assessments/risk-dashboard-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Gender = "M" | "F" | null;

interface FraminghamData {
  gender: Gender;
  age: string;
  totalCholesterol: string;
  hdl: string;
  systolic: string;
  isTreatedBP: boolean;
  isSmoker: boolean;
  hasDiabetes: boolean;
}

const INITIAL: FraminghamData = {
  gender: null,
  age: "",
  totalCholesterol: "",
  hdl: "",
  systolic: "",
  isTreatedBP: false,
  isSmoker: false,
  hasDiabetes: false,
};

function calcFraminghamScore(data: FraminghamData): {
  score: number;
  risk10Year: number;
} | null {
  const age = parseInt(data.age);
  const tc = parseInt(data.totalCholesterol);
  const hdl = parseInt(data.hdl);
  const sbp = parseInt(data.systolic);

  if (!data.gender || isNaN(age) || isNaN(tc) || isNaN(hdl) || isNaN(sbp))
    return null;

  let points = 0;

  if (data.gender === "M") {
    // Age points (male)
    if (age >= 20 && age <= 34) points += -9;
    else if (age <= 39) points += -4;
    else if (age <= 44) points += 0;
    else if (age <= 49) points += 3;
    else if (age <= 54) points += 6;
    else if (age <= 59) points += 8;
    else if (age <= 64) points += 10;
    else if (age <= 69) points += 11;
    else if (age <= 74) points += 12;
    else points += 13;

    // Total cholesterol (male, age-adjusted simplified)
    if (tc < 160) points += 0;
    else if (tc <= 199) points += 4;
    else if (tc <= 239) points += 7;
    else if (tc <= 279) points += 9;
    else points += 11;

    // HDL
    if (hdl >= 60) points += -1;
    else if (hdl >= 50) points += 0;
    else if (hdl >= 40) points += 1;
    else points += 2;

    // Systolic BP
    if (!data.isTreatedBP) {
      if (sbp < 120) points += 0;
      else if (sbp <= 129) points += 0;
      else if (sbp <= 139) points += 1;
      else if (sbp <= 159) points += 1;
      else points += 2;
    } else {
      if (sbp < 120) points += 0;
      else if (sbp <= 129) points += 1;
      else if (sbp <= 139) points += 2;
      else if (sbp <= 159) points += 2;
      else points += 3;
    }

    if (data.isSmoker) points += 8;
    if (data.hasDiabetes) points += 5;
  } else {
    // Age points (female)
    if (age >= 20 && age <= 34) points += -7;
    else if (age <= 39) points += -3;
    else if (age <= 44) points += 0;
    else if (age <= 49) points += 3;
    else if (age <= 54) points += 6;
    else if (age <= 59) points += 8;
    else if (age <= 64) points += 10;
    else if (age <= 69) points += 12;
    else if (age <= 74) points += 14;
    else points += 16;

    // Total cholesterol (female)
    if (tc < 160) points += 0;
    else if (tc <= 199) points += 4;
    else if (tc <= 239) points += 8;
    else if (tc <= 279) points += 11;
    else points += 13;

    // HDL
    if (hdl >= 60) points += -1;
    else if (hdl >= 50) points += 0;
    else if (hdl >= 40) points += 1;
    else points += 2;

    // Systolic BP
    if (!data.isTreatedBP) {
      if (sbp < 120) points += 0;
      else if (sbp <= 129) points += 1;
      else if (sbp <= 139) points += 2;
      else if (sbp <= 159) points += 3;
      else points += 4;
    } else {
      if (sbp < 120) points += 0;
      else if (sbp <= 129) points += 3;
      else if (sbp <= 139) points += 4;
      else if (sbp <= 159) points += 5;
      else points += 6;
    }

    if (data.isSmoker) points += 9;
    if (data.hasDiabetes) points += 7;
  }

  // Simplified 10-year risk estimation
  let risk10Year: number;
  if (data.gender === "M") {
    if (points <= 0) risk10Year = 1;
    else if (points <= 4) risk10Year = 1;
    else if (points <= 6) risk10Year = 2;
    else if (points <= 8) risk10Year = 5;
    else if (points <= 10) risk10Year = 6;
    else if (points <= 12) risk10Year = 10;
    else if (points <= 14) risk10Year = 16;
    else if (points <= 16) risk10Year = 25;
    else risk10Year = 30;
  } else {
    if (points <= 8) risk10Year = 1;
    else if (points <= 12) risk10Year = 1;
    else if (points <= 14) risk10Year = 2;
    else if (points <= 16) risk10Year = 4;
    else if (points <= 18) risk10Year = 6;
    else if (points <= 20) risk10Year = 11;
    else if (points <= 22) risk10Year = 17;
    else if (points <= 24) risk10Year = 25;
    else risk10Year = 30;
  }

  return { score: points, risk10Year };
}

export default function FraminghamPage() {
  const params = useParams();
  const [data, setData] = useState<FraminghamData>(INITIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/anamnesis`);
        if (res.ok) {
          const d = await res.json();
          if (d?.framingham) setData({ ...INITIAL, ...d.framingham });
        }
      } catch {
        /* empty */
      } finally {
        setIsFetching(false);
      }
    }
    load();
  }, [params.id]);

  const result = useMemo(() => calcFraminghamScore(data), [data]);

  const riskLevel = result
    ? result.risk10Year < 10
      ? "low"
      : result.risk10Year < 20
        ? "moderate"
        : "high"
    : null;

  function update<K extends keyof FraminghamData>(
    key: K,
    value: FraminghamData[K]
  ) {
    setData((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/anamnesis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ framingham: data }),
      });
      toast.success("Framingham salvo!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Framingham" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Framingham" showBack>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Activity className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">
              Escore de Risco de Framingham
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Estimativa de risco cardiovascular em 10 anos
            </p>
          </div>
        </div>

        {/* Gender */}
        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 block">Sexo</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => update("gender", "M")}
                className={cn(
                  "flex-1 h-12 rounded-xl text-sm font-semibold transition-colors",
                  data.gender === "M"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                Masculino
              </button>
              <button
                type="button"
                onClick={() => update("gender", "F")}
                className={cn(
                  "flex-1 h-12 rounded-xl text-sm font-semibold transition-colors",
                  data.gender === "F"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                Feminino
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Numeric inputs */}
        {[
          { key: "age" as const, label: "Idade", unit: "anos", max: 120 },
          {
            key: "totalCholesterol" as const,
            label: "Colesterol Total",
            unit: "mg/dL",
            max: 500,
          },
          { key: "hdl" as const, label: "HDL", unit: "mg/dL", max: 150 },
          {
            key: "systolic" as const,
            label: "PA Sistólica",
            unit: "mmHg",
            max: 250,
          },
        ].map((field) => (
          <Card key={field.key}>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-3 block">
                {field.label}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={data[field.key]}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (
                      val === "" ||
                      (parseFloat(val) >= 0 &&
                        parseFloat(val) <= field.max)
                    ) {
                      update(field.key, val);
                    }
                  }}
                  className="flex-1 text-base"
                />
                <span className="text-sm text-muted-foreground w-14 text-center">
                  {field.unit}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Boolean toggles */}
        {[
          {
            key: "isTreatedBP" as const,
            label: "Em tratamento para pressão arterial?",
          },
          { key: "isSmoker" as const, label: "Fumante atual?" },
          { key: "hasDiabetes" as const, label: "Diabetes?" },
        ].map((field, i) => (
          <div
            key={field.key}
            className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card"
          >
            <p className="text-sm text-foreground">{field.label}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => update(field.key, true)}
                className={cn(
                  "flex-1 h-12 rounded-xl text-sm font-semibold transition-colors",
                  data[field.key] === true
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => update(field.key, false)}
                className={cn(
                  "flex-1 h-12 rounded-xl text-sm font-semibold transition-colors",
                  data[field.key] === false
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                Não
              </button>
            </div>
          </div>
        ))}

        {/* Result */}
        {result && riskLevel && (
          <RiskDashboardCard
            title="Risco Cardiovascular (10 anos)"
            score={result.risk10Year}
            maxScore={30}
            riskLevel={riskLevel}
            description={
              result.risk10Year < 10
                ? `Risco baixo (${result.risk10Year}%). Pontuação: ${result.score}. Manter hábitos saudáveis e acompanhamento regular.`
                : result.risk10Year < 20
                  ? `Risco moderado (${result.risk10Year}%). Pontuação: ${result.score}. Recomenda-se mudanças no estilo de vida e acompanhamento médico.`
                  : `Risco alto (${result.risk10Year}%). Pontuação: ${result.score}. Necessita intervenção médica e mudanças imediatas no estilo de vida.`
            }
          />
        )}

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={isLoading || !data.gender}
        >
          {isLoading ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="size-4 mr-2" />
          ) : null}
          {saved ? "Salvo" : "Salvar Framingham"}
        </Button>
      </div>
    </MobileLayout>
  );
}
