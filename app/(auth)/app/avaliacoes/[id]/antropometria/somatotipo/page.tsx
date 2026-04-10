"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Target, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SomatotypeData {
  endomorphy: string;
  mesomorphy: string;
  ectomorphy: string;
}

const INITIAL: SomatotypeData = {
  endomorphy: "",
  mesomorphy: "",
  ectomorphy: "",
};

function getDominantType(endo: number, meso: number, ecto: number) {
  const max = Math.max(endo, meso, ecto);
  if (max === endo) return { label: "Endomorfo", description: "Tendência ao acúmulo de gordura corporal", color: "text-warning", bg: "bg-warning/10" };
  if (max === meso) return { label: "Mesomorfo", description: "Tendência ao desenvolvimento muscular", color: "text-primary", bg: "bg-primary/10" };
  return { label: "Ectomorfo", description: "Tendência à linearidade e menor massa corporal", color: "text-info", bg: "bg-info/10" };
}

export default function SomatotipoPage() {
  const params = useParams();
  const [data, setData] = useState<SomatotypeData>(INITIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/anthropometry`);
        if (res.ok) {
          const d = await res.json();
          if (d?.somatotype) setData({ ...INITIAL, ...(d.somatotype as SomatotypeData) });
        }
      } catch {
        /* empty */
      } finally {
        setIsFetching(false);
      }
    }
    load();
  }, [params.id]);

  const endo = parseFloat(data.endomorphy);
  const meso = parseFloat(data.mesomorphy);
  const ecto = parseFloat(data.ectomorphy);
  const allValid = !isNaN(endo) && !isNaN(meso) && !isNaN(ecto);

  const dominant = useMemo(() => {
    if (!allValid) return null;
    return getDominantType(endo, meso, ecto);
  }, [endo, meso, ecto, allValid]);

  function update(key: keyof SomatotypeData, value: string) {
    setData((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/anthropometry`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ somatotype: data }),
      });
      toast.success("Somatotipo salvo!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Somatotipo" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Somatotipo" showBack>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Target className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">
              Classificação Somatotípica
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Heath-Carter: Endomorfia, Mesomorfia, Ectomorfia
            </p>
          </div>
        </div>

        {/* Component inputs */}
        {[
          { key: "endomorphy" as const, label: "Endomorfia", desc: "Gordura relativa", color: "text-warning", bg: "bg-warning/10" },
          { key: "mesomorphy" as const, label: "Mesomorfia", desc: "Desenvolvimento muscular", color: "text-primary", bg: "bg-primary/10" },
          { key: "ectomorphy" as const, label: "Ectomorfia", desc: "Linearidade corporal", color: "text-info", bg: "bg-info/10" },
        ].map((comp) => (
          <Card key={comp.key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="text-sm font-medium">{comp.label}</Label>
                  <p className="text-xs text-muted-foreground">{comp.desc}</p>
                </div>
                {data[comp.key] && (
                  <span className={cn("text-lg font-bold", comp.color)}>
                    {data[comp.key]}
                  </span>
                )}
              </div>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0.0"
                value={data[comp.key]}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 9.9)) {
                    update(comp.key, val);
                  }
                }}
                className="text-base"
                step="0.1"
              />
              {/* Visual bar */}
              {data[comp.key] && (
                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", comp.bg.replace("/10", ""))}
                    style={{ width: `${(parseFloat(data[comp.key]) / 9) * 100}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Dominant type result */}
        {dominant && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Tipo Dominante</Label>
                <Badge
                  variant="secondary"
                  className={cn("text-xs", dominant.bg, dominant.color)}
                >
                  {dominant.label}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {endo.toFixed(1)} – {meso.toFixed(1)} – {ecto.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {dominant.description}
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
          {saved ? "Salvo" : "Salvar somatotipo"}
        </Button>
      </div>
    </MobileLayout>
  );
}
