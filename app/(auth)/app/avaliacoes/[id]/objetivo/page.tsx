"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

const OBJECTIVES = [
  "Condicionamento físico",
  "Competições",
  "Hipertrofia",
  "Emagrecimento",
  "Estética",
  "Autoestima",
  "Orientação médica",
  "Saúde",
  "Desestresse",
  "Reabilitação",
  "Cuidado postural",
  "Recreação",
];

const WEEKDAYS = [
  { key: "sun", label: "Dom" },
  { key: "mon", label: "Seg" },
  { key: "tue", label: "Ter" },
  { key: "wed", label: "Qua" },
  { key: "thu", label: "Qui" },
  { key: "fri", label: "Sex" },
  { key: "sat", label: "Sáb" },
];

const DURATIONS = ["15min", "30min", "45min", "1h", "1h30", "2h", "Outro"];

export default function ObjetivoPage() {
  const params = useParams();
  const [goals, setGoals] = useState<Record<string, number>>({});
  const [availability, setAvailability] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/objective`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals, availability }),
      });
      toast.success("Objetivo salvo!");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <MobileLayout title="Objetivo e Disponibilidade" showBack>
      <div className="p-4 flex flex-col gap-6">
        {/* Objetivos */}
        <div>
          <h3 className="font-semibold text-foreground text-sm mb-3">Objetivos do cliente</h3>
          <div className="flex flex-col gap-3">
            {OBJECTIVES.map((obj) => (
              <div key={obj} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{obj}</Label>
                  <span className="text-sm text-primary font-semibold">{goals[obj] ?? 0}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={4}
                  step={1}
                  value={goals[obj] ?? 0}
                  onChange={(e) => setGoals((g) => ({ ...g, [obj]: Number(e.target.value) }))}
                  className="w-full accent-primary h-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Disponibilidade */}
        <div>
          <h3 className="font-semibold text-foreground text-sm mb-3">Disponibilidade semanal</h3>
          <div className="flex flex-col gap-2">
            {WEEKDAYS.map((day) => {
              const isAvailable = availability[day.key] !== undefined && availability[day.key] !== null;
              return (
                <Card key={day.key}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{day.label}</Label>
                      <Switch
                        checked={isAvailable}
                        onCheckedChange={(checked) =>
                          setAvailability((a) => ({
                            ...a,
                            [day.key]: checked ? "1h" : null,
                          }))
                        }
                      />
                    </div>
                    {isAvailable && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {DURATIONS.map((dur) => (
                          <button
                            key={dur}
                            onClick={() =>
                              setAvailability((a) => ({ ...a, [day.key]: dur }))
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              availability[day.key] === dur
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                            }`}
                          >
                            {dur}
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Button className="h-12 w-full" onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Salvar objetivo e disponibilidade
        </Button>
      </div>
    </MobileLayout>
  );
}
