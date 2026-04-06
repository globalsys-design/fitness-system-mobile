"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DAYS_OF_WEEK } from "@/lib/validations/client";
import { cn } from "@/lib/utils";

type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

interface DayAvailability {
  active: boolean;
  start: string;
  end: string;
}

type AvailabilityData = Record<DayKey, DayAvailability>;

const DEFAULT_DAY: DayAvailability = { active: false, start: "06:00", end: "22:00" };

const DEFAULT_AVAILABILITY: AvailabilityData = {
  monday: { ...DEFAULT_DAY },
  tuesday: { ...DEFAULT_DAY },
  wednesday: { ...DEFAULT_DAY },
  thursday: { ...DEFAULT_DAY },
  friday: { ...DEFAULT_DAY },
  saturday: { ...DEFAULT_DAY },
  sunday: { ...DEFAULT_DAY },
};

interface EditAvailabilitySheetProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AvailabilityData | null;
}

export function EditAvailabilitySheet({
  clientId,
  open,
  onOpenChange,
  initialData,
}: EditAvailabilitySheetProps) {
  const router = useRouter();
  const [form, setForm] = useState<AvailabilityData>(
    initialData ?? DEFAULT_AVAILABILITY
  );
  const [saving, setSaving] = useState(false);

  function toggleDay(key: DayKey) {
    setForm((prev) => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active },
    }));
  }

  function setTime(key: DayKey, field: "start" | "end", value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: form }),
      });
      if (!res.ok) throw new Error();
      toast.success("Disponibilidade atualizada!");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const activeDays = DAYS_OF_WEEK.filter((d) => form[d.key].active).length;

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Disponibilidade">
      <div className="flex flex-col gap-1 pb-4">
        <p className="text-sm text-muted-foreground mb-3">
          {activeDays > 0
            ? `${activeDays} dia${activeDays > 1 ? "s" : ""} selecionado${activeDays > 1 ? "s" : ""}`
            : "Selecione os dias disponíveis"}
        </p>

        {DAYS_OF_WEEK.map(({ key, label }) => {
          const day = form[key];
          return (
            <div
              key={key}
              className={cn(
                "rounded-xl border-2 transition-all duration-200 overflow-hidden",
                day.active
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-muted/20"
              )}
            >
              {/* Row com toggle */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    day.active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
                <Switch
                  checked={day.active}
                  onCheckedChange={() => toggleDay(key)}
                />
              </div>

              {/* Horários — expandem apenas quando ativo */}
              {day.active && (
                <div className="flex items-center gap-3 px-4 pb-3.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Início</Label>
                    <Input
                      type="time"
                      className="mt-1 h-10"
                      value={day.start}
                      onChange={(e) => setTime(key, "start", e.target.value)}
                    />
                  </div>
                  <span className="text-muted-foreground mt-5">–</span>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Fim</Label>
                    <Input
                      type="time"
                      className="mt-1 h-10"
                      value={day.end}
                      onChange={(e) => setTime(key, "end", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <Button className="w-full h-13 mt-4" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
          Salvar disponibilidade
        </Button>
      </div>
    </BottomSheet>
  );
}
