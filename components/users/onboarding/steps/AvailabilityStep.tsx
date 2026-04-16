"use client";

import { useFormContext } from "react-hook-form";
import type { ClientFormData } from "@/lib/validations/client";
import { DAYS_OF_WEEK } from "@/lib/validations/client";
import { cn } from "@/lib/utils";

const TIME_SLOTS = [
  { value: "06:00", label: "Manhã cedo", sub: "06h–09h" },
  { value: "09:00", label: "Manhã", sub: "09h–12h" },
  { value: "12:00", label: "Tarde", sub: "12h–17h" },
  { value: "17:00", label: "Final de tarde", sub: "17h–19h" },
  { value: "19:00", label: "Noite", sub: "19h–22h" },
];

export function AvailabilityStep() {
  const { watch, setValue } = useFormContext<ClientFormData>();

  const availability = watch("availability");

  function toggleDay(key: typeof DAYS_OF_WEEK[number]["key"]) {
    const current = availability?.[key];
    setValue(`availability.${key}.active`, !current?.active, { shouldDirty: true });
    if (!current?.active && !current?.start) {
      setValue(`availability.${key}.start`, "09:00");
      setValue(`availability.${key}.end`, "");
    }
  }

  function setTime(key: typeof DAYS_OF_WEEK[number]["key"], value: string) {
    setValue(`availability.${key}.start`, value, { shouldDirty: true });
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Quando o cliente<br />pode treinar?
        </h1>
        <p className="text-base text-muted-foreground">
          Disponibilidade semanal — opcional
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {DAYS_OF_WEEK.map(({ key, label }) => {
          const day = availability?.[key];
          const isActive = day?.active ?? false;

          return (
            <div
              key={key}
              className={cn(
                "rounded-2xl border-2 transition-all duration-200 overflow-hidden",
                isActive ? "border-primary bg-primary/5" : "border-border bg-muted/30"
              )}
            >
              {/* Day toggle row */}
              <button
                type="button"
                onClick={() => toggleDay(key)}
                className="w-full flex items-center justify-between px-5 py-4 text-left active:scale-[0.99]"
              >
                <span
                  className={cn(
                    "font-semibold text-base transition-colors duration-200",
                    isActive ? "text-primary" : "text-foreground"
                  )}
                >
                  {label}
                </span>

                {/* Toggle pill */}
                <div
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors duration-300",
                    isActive ? "bg-primary" : "bg-border"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-300",
                      isActive ? "translate-x-6" : "translate-x-0.5"
                    )}
                  />
                </div>
              </button>

              {/* Time slot selector — visible when active */}
              {isActive && (
                <div className="px-5 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Horário preferido
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = day?.start === slot.value;
                      return (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => setTime(key, slot.value)}
                          className={cn(
                            "flex flex-col items-center px-3 py-2 rounded-xl border-2 transition-all duration-200",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40"
                          )}
                        >
                          <span className="text-xs font-bold">{slot.label}</span>
                          <span className="text-[10px] opacity-70">{slot.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-3 bg-muted/40 rounded-2xl px-4 py-3.5">
        <span className="text-lg mt-0.5 shrink-0">📅</span>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ative os dias disponíveis e escolha o período preferido. Pode ajustar depois.
        </p>
      </div>
    </div>
  );
}
