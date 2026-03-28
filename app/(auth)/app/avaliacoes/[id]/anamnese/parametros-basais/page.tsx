"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Activity, Thermometer, Heart, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BasalParam {
  key: string;
  label: string;
  unit: string;
  icon: any;
  iconColor: string;
  iconBg: string;
}

const PARAMS: BasalParam[] = [
  { key: "systolic", label: "Pressão Sistólica", unit: "mmHg", icon: Activity, iconColor: "text-red-500", iconBg: "bg-red-500/10" },
  { key: "diastolic", label: "Pressão Diastólica", unit: "mmHg", icon: Activity, iconColor: "text-red-400", iconBg: "bg-red-400/10" },
  { key: "glucose", label: "Glicemia em Jejum", unit: "mg/dL", icon: Droplets, iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
  { key: "temperature", label: "Temperatura", unit: "°C", icon: Thermometer, iconColor: "text-orange-500", iconBg: "bg-orange-500/10" },
  { key: "heartRate", label: "Frequência Cardíaca", unit: "bpm", icon: Heart, iconColor: "text-pink-500", iconBg: "bg-pink-500/10" },
  { key: "saturation", label: "Saturação de O₂", unit: "%", icon: Activity, iconColor: "text-teal-500", iconBg: "bg-teal-500/10" },
];

export default function ParametrosBasaisPage() {
  const params = useParams();
  const [values, setValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/anamnesis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ basalParameters: values }),
      });
      toast.success("Parâmetros salvos!");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <MobileLayout title="Parâmetros Basais" showBack>
      <div className="p-4 flex flex-col gap-4">
        {PARAMS.map((param) => {
          const Icon = param.icon;
          return (
            <Card key={param.key}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("flex items-center justify-center w-9 h-9 rounded-xl", param.iconBg)}>
                    <Icon className={cn("w-4 h-4", param.iconColor)} />
                  </div>
                  <Label className="text-sm font-medium">{param.label}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={values[param.key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [param.key]: e.target.value }))}
                    className="flex-1 text-base"
                  />
                  <span className="text-sm text-muted-foreground w-14 text-center">{param.unit}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Button className="w-full" onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Salvar parâmetros
        </Button>
      </div>
    </MobileLayout>
  );
}
