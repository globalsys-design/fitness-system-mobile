"use client";

import { useFormContext } from "react-hook-form";
import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { type ClientFormData, DAYS_OF_WEEK } from "@/lib/validations/client";

export function StepAvailability() {
  const { setValue, watch } = useFormContext<ClientFormData>();
  const availability = (watch("availability") as any) ?? {};

  function toggleDay(dayKey: string, active: boolean) {
    setValue("availability", {
      ...availability,
      [dayKey]: active
        ? { active: true, start: "08:00", end: "18:00" }
        : { active: false },
    });
  }

  function setDayTime(dayKey: string, field: "start" | "end", value: string) {
    setValue("availability", {
      ...availability,
      [dayKey]: {
        ...availability[dayKey],
        [field]: value,
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Defina os dias e horários em que o cliente está disponível para
        atendimento.
      </p>

      <div className="flex flex-col gap-3">
        {DAYS_OF_WEEK.map(({ key, label }) => {
          const day = availability[key] ?? { active: false };
          const isActive = day.active === true;

          return (
            <div
              key={key}
              className={cn(
                "rounded-xl border border-border bg-card overflow-hidden transition-all",
                isActive && "ring-1 ring-primary/20"
              )}
            >
              {/* Day toggle row */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Clock
                    className={cn(
                      "size-4",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {isActive ? "Sim" : "Não"}
                  </span>
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) => toggleDay(key, !!checked)}
                  />
                </div>
              </div>

              {/* Time inputs — render conditionally */}
              {isActive && (
                <div className="flex gap-3 px-4 pb-4 pt-1 border-t border-border">
                  <div className="flex-1">
                    <Label className="text-xs">Horário inicial</Label>
                    <Input
                      type="time"
                      className="mt-1"
                      value={day.start || "08:00"}
                      onChange={(e) => setDayTime(key, "start", e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Horário final</Label>
                    <Input
                      type="time"
                      className="mt-1"
                      value={day.end || "18:00"}
                      onChange={(e) => setDayTime(key, "end", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
