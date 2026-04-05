"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type PermissionsState = Record<
  "clients" | "assessments" | "prescriptions" | "calendar" | "billing",
  boolean
>;

const MODULES = [
  {
    key: "clients" as const,
    label: "Clientes",
    desc: "Visualizar e gerir a lista de clientes",
    emoji: "👥",
  },
  {
    key: "assessments" as const,
    label: "Avaliações",
    desc: "Criar, editar e ver avaliações físicas",
    emoji: "📋",
  },
  {
    key: "prescriptions" as const,
    label: "Prescrições",
    desc: "Gerir treinos e planos de exercício",
    emoji: "🏋️",
  },
  {
    key: "calendar" as const,
    label: "Agenda",
    desc: "Agendar e visualizar compromissos",
    emoji: "📅",
  },
  {
    key: "billing" as const,
    label: "Financeiro",
    desc: "Aceder a dados de faturação e planos",
    emoji: "💰",
  },
] as const;

interface AssistantPermissionsStepProps {
  permissions: PermissionsState;
  onToggle: (key: keyof PermissionsState) => void;
}

export function AssistantPermissionsStep({
  permissions,
  onToggle,
}: AssistantPermissionsStepProps) {
  const activeCount = Object.values(permissions).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          O que pode<br />fazer?
        </h1>
        <p className="text-base text-muted-foreground">
          Defina o acesso do assistente ao sistema
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {MODULES.map((mod) => {
          const isOn = permissions[mod.key];

          return (
            <button
              key={mod.key}
              type="button"
              onClick={() => onToggle(mod.key)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl",
                "border-2 text-left transition-all duration-200 active:scale-[0.98]",
                isOn
                  ? "border-primary bg-primary/8"
                  : "border-border bg-muted/40 hover:bg-muted/70 hover:border-muted-foreground/30"
              )}
            >
              {/* Emoji icon */}
              <div
                className={cn(
                  "size-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-colors duration-200",
                  isOn ? "bg-primary/15" : "bg-muted"
                )}
              >
                {mod.emoji}
              </div>

              {/* Text */}
              <div className="flex flex-col flex-1 min-w-0">
                <span
                  className={cn(
                    "font-semibold text-base leading-tight transition-colors duration-200",
                    isOn ? "text-primary" : "text-foreground"
                  )}
                >
                  {mod.label}
                </span>
                <span className="text-sm text-muted-foreground mt-0.5 leading-snug">
                  {mod.desc}
                </span>
              </div>

              {/* Toggle indicator */}
              <div
                className={cn(
                  "size-6 rounded-full flex items-center justify-center shrink-0",
                  "border-2 transition-all duration-200",
                  isOn ? "border-primary bg-primary" : "border-border bg-transparent"
                )}
              >
                {isOn && (
                  <Check className="size-3.5 text-primary-foreground" strokeWidth={3} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground text-center">
        {activeCount === 0
          ? "Nenhum módulo activo — o assistente não terá acesso"
          : `${activeCount} de ${MODULES.length} módulos activos`}
      </p>
    </div>
  );
}
