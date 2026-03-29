"use client";

import { Switch } from "@/components/ui/switch";
import { Users, ClipboardList, Dumbbell, Calendar, CreditCard, Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PermissionsMap {
  clients?: { read: boolean; write: boolean };
  assessments?: { read: boolean; write: boolean };
  prescriptions?: { read: boolean; write: boolean };
  calendar?: { read: boolean; write: boolean };
  billing?: { read: boolean; write: boolean };
}

const PERMISSION_MODULES = [
  {
    key: "clients" as const,
    label: "Clientes",
    description: "Visualizar e gerenciar clientes",
    icon: Users,
  },
  {
    key: "assessments" as const,
    label: "Avaliações",
    description: "Visualizar e criar avaliações",
    icon: ClipboardList,
  },
  {
    key: "prescriptions" as const,
    label: "Prescrições",
    description: "Visualizar e criar prescrições",
    icon: Dumbbell,
  },
  {
    key: "calendar" as const,
    label: "Calendário",
    description: "Visualizar e criar eventos",
    icon: Calendar,
  },
  {
    key: "billing" as const,
    label: "Faturamento",
    description: "Visualizar informações de plano",
    icon: CreditCard,
  },
];

interface PermissionsToggleProps {
  permissions: PermissionsMap;
  onChange: (permissions: PermissionsMap) => void;
  disabled?: boolean;
}

export function PermissionsToggle({
  permissions,
  onChange,
  disabled = false,
}: PermissionsToggleProps) {
  function togglePermission(
    module: keyof PermissionsMap,
    type: "read" | "write"
  ) {
    const current = permissions[module] ?? { read: false, write: false };
    const updated = { ...current };

    if (type === "read") {
      updated.read = !updated.read;
      // Se desativa leitura, desativa escrita também
      if (!updated.read) updated.write = false;
    } else {
      updated.write = !updated.write;
      // Se ativa escrita, ativa leitura também
      if (updated.write) updated.read = true;
    }

    onChange({ ...permissions, [module]: updated });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header das colunas */}
      <div className="flex items-center justify-end gap-6 pr-1 pb-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="size-3.5" />
          <span>Leitura</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Pencil className="size-3.5" />
          <span>Escrita</span>
        </div>
      </div>

      {/* Módulos */}
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
        {PERMISSION_MODULES.map((mod) => {
          const Icon = mod.icon;
          const perm = permissions[mod.key] ?? { read: false, write: false };

          return (
            <div
              key={mod.key}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 bg-card",
                disabled && "opacity-60"
              )}
            >
              <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary shrink-0">
                <Icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {mod.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {mod.description}
                </p>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <Switch
                  checked={perm.read}
                  onCheckedChange={() => togglePermission(mod.key, "read")}
                  disabled={disabled}
                  aria-label={`Leitura de ${mod.label}`}
                />
                <Switch
                  checked={perm.write}
                  onCheckedChange={() => togglePermission(mod.key, "write")}
                  disabled={disabled}
                  aria-label={`Escrita de ${mod.label}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
