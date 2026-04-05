"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type ClientFormData, DAYS_OF_WEEK } from "@/lib/validations/client";

/** Short labels for chips — same order as DAYS_OF_WEEK */
const DAY_SHORT: Record<string, string> = {
  monday: "Seg",
  tuesday: "Ter",
  wednesday: "Qua",
  thursday: "Qui",
  friday: "Sex",
  saturday: "Sáb",
  sunday: "Dom",
};

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

  const activeDays = DAYS_OF_WEEK.filter(
    ({ key }) => availability[key]?.active === true
  );

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        Defina os dias e horários em que o cliente está disponível para
        atendimento.
      </p>

      {/* ── Chips de dias ── */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">
          Selecione os dias disponíveis
        </Label>
        <div className="flex flex-wrap gap-2 justify-center">
          {DAYS_OF_WEEK.map(({ key }) => {
            const isActive = availability[key]?.active === true;
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleDay(key, !isActive)}
                className={cn(
                  "min-w-[56px] px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 outline-none select-none justify-center",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-transparent text-muted-foreground hover:bg-accent"
                )}
              >
                {DAY_SHORT[key]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Blocos de horário (apenas dias ativos) ── */}
      {activeDays.length > 0 && (
        <div className="flex flex-col gap-4">
          {activeDays.map(({ key, label }) => {
            const day = availability[key];
            return (
              <div
                key={key}
                className="rounded-xl border border-border bg-card px-4 pt-3 pb-4 ring-1 ring-primary/40"
              >
                <p className="text-sm font-semibold text-foreground mb-3">
                  {label}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Início
                    </Label>
                    <Input
                      type="time"
                      className="h-14"
                      value={day.start || "08:00"}
                      onChange={(e) =>
                        setDayTime(key, "start", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Fim
                    </Label>
                    <Input
                      type="time"
                      className="h-14"
                      value={day.end || "18:00"}
                      onChange={(e) =>
                        setDayTime(key, "end", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeDays.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2">
          <p className="text-sm font-medium text-muted-foreground text-center">
            Nenhum dia selecionado
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Toque nos dias acima para definir os horários.
          </p>
        </div>
      )}
    </div>
  );
}
