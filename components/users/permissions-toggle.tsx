"use client";

import {
  Info,
  ShieldCheck,
  Users,
  ClipboardList,
  Dumbbell,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { CrudPermission, PermissionsMap } from "@/lib/validations";

export type { PermissionsMap } from "@/lib/validations";
export type ModuleKey = "clients" | "assessments" | "prescriptions" | "calendar" | "billing";
export type CrudAction = keyof CrudPermission;

// ── Defaults ────────────────────────────────────────────────────────────────
export const EMPTY_CRUD: CrudPermission = {
  view: false,
  create: false,
  edit: false,
  delete: false,
};

export const FULL_CRUD: CrudPermission = {
  view: true,
  create: true,
  edit: true,
  delete: true,
};

// ── Config ──────────────────────────────────────────────────────────────────
const MODULES: Array<{
  key: ModuleKey;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "clients",       label: "Clientes",    desc: "Lista e perfis de alunos",        icon: Users },
  { key: "assessments",   label: "Avaliações",  desc: "Avaliações físicas e protocolos", icon: ClipboardList },
  { key: "prescriptions", label: "Prescrições", desc: "Treinos e planos de exercício",   icon: Dumbbell },
  { key: "calendar",      label: "Agenda",      desc: "Compromissos e eventos",          icon: Calendar },
  { key: "billing",       label: "Financeiro",  desc: "Faturação e plano da conta",      icon: CreditCard },
];

const CRUD_ACTIONS: Array<{ key: CrudAction; label: string }> = [
  { key: "view",   label: "Visualizar" },
  { key: "create", label: "Criar" },
  { key: "edit",   label: "Editar" },
  { key: "delete", label: "Excluir" },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function normalize(p: PermissionsMap | undefined | null): Required<PermissionsMap> {
  return {
    isAdmin: p?.isAdmin ?? false,
    clients:       p?.clients       ?? { ...EMPTY_CRUD },
    assessments:   p?.assessments   ?? { ...EMPTY_CRUD },
    prescriptions: p?.prescriptions ?? { ...EMPTY_CRUD },
    calendar:      p?.calendar      ?? { ...EMPTY_CRUD },
    billing:       p?.billing       ?? { ...EMPTY_CRUD },
  };
}

// ── Props ───────────────────────────────────────────────────────────────────
interface PermissionsToggleProps {
  permissions: PermissionsMap;
  onChange: (permissions: PermissionsMap) => void;
  disabled?: boolean;
}

// ── Component ───────────────────────────────────────────────────────────────
export function PermissionsToggle({
  permissions,
  onChange,
  disabled = false,
}: PermissionsToggleProps) {
  const state = normalize(permissions);
  const isAdmin = state.isAdmin;

  function setAdmin(value: boolean) {
    onChange({ ...state, isAdmin: value });
  }

  function setAction(module: ModuleKey, action: CrudAction, value: boolean) {
    const current = state[module];
    onChange({
      ...state,
      [module]: { ...current, [action]: value },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Banner informativo */}
      <Alert variant="info">
        <Info />
        <AlertTitle>Sobre as permissões</AlertTitle>
        <AlertDescription>
          Defina o tipo de acesso que seu assistente terá na plataforma. Você pode
          conceder permissões para ver, editar, criar ou excluir informações específicas.
        </AlertDescription>
      </Alert>

      {/* Master toggle: Administrador — <label> permite clique na área toda */}
      <label
        className={cn(
          "flex items-center gap-4 px-4 py-4 rounded-2xl border-2 cursor-pointer select-none transition-all duration-200",
          isAdmin
            ? "border-primary bg-primary/8"
            : "border-border bg-muted/30",
          disabled && "opacity-60 pointer-events-none cursor-not-allowed",
        )}
      >
        <div
          className={cn(
            "size-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200",
            isAdmin ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          <ShieldCheck className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-base font-semibold leading-tight transition-colors duration-200",
            isAdmin ? "text-primary" : "text-foreground",
          )}>
            Assistente Administrador
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            Acesso total a todos os módulos do sistema
          </p>
        </div>
        <Switch
          checked={isAdmin}
          onCheckedChange={setAdmin}
          disabled={disabled}
          aria-label="Ativar assistente administrador"
          className="shrink-0"
        />
      </label>

      {/* Grid de módulos */}
      <div className="flex flex-col gap-3">
        {MODULES.map((mod) => (
          <ModuleCard
            key={mod.key}
            module={mod}
            permission={state[mod.key]}
            disabled={disabled || isAdmin}
            onChange={(action, value) => setAction(mod.key, action, value)}
          />
        ))}
      </div>
    </div>
  );
}

// ── ModuleCard ──────────────────────────────────────────────────────────────
function ModuleCard({
  module,
  permission,
  disabled,
  onChange,
}: {
  module: typeof MODULES[number];
  permission: CrudPermission;
  disabled: boolean;
  onChange: (action: CrudAction, value: boolean) => void;
}) {
  const Icon = module.icon;
  const anyActive =
    permission.view || permission.create || permission.edit || permission.delete;

  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-4 transition-all duration-200",
        disabled && "opacity-50 pointer-events-none",
        !disabled && anyActive
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "size-10 rounded-xl flex items-center justify-center shrink-0",
            anyActive && !disabled
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">
            {module.label}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug truncate">
            {module.desc}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {CRUD_ACTIONS.map(({ key, label }) => (
          <ActionToggle
            key={key}
            label={label}
            checked={permission[key]}
            disabled={disabled}
            onChange={(value) => onChange(key, value)}
          />
        ))}
      </div>
    </div>
  );
}

// ── ActionToggle ────────────────────────────────────────────────────────────
// Usa <label> (não <button>) pois o base-ui Switch renderiza internamente um
// <input type="checkbox">; aninhar um controle interativo dentro de <button> é
// HTML inválido e quebra a sincronização de estado checked/unchecked.
function ActionToggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-2 rounded-xl border px-3 h-11",
        "text-sm font-medium cursor-pointer select-none transition-colors duration-200",
        disabled && "opacity-60 cursor-not-allowed",
        checked
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted/40"
      )}
    >
      <span className="truncate">{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        size="sm"
        aria-label={label}
        className="shrink-0"
      />
    </label>
  );
}
