"use client";

import { Info, ShieldCheck, Users, ClipboardList, Dumbbell, Calendar, CreditCard } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { CrudPermission } from "@/lib/validations";

// ── Tipos ────────────────────────────────────────────────────────────────────
export type ModuleKey = "clients" | "assessments" | "prescriptions" | "calendar" | "billing";
export type CrudAction = keyof CrudPermission; // "view" | "create" | "edit" | "delete"

export type PermissionsState = {
  isAdmin: boolean;
} & Record<ModuleKey, CrudPermission>;

// ── Defaults usados pelo fluxo de onboarding ─────────────────────────────────
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

// ── Config dos módulos ───────────────────────────────────────────────────────
const MODULES: Array<{
  key: ModuleKey;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "clients",       label: "Clientes",     desc: "Lista e perfis de alunos",        icon: Users },
  { key: "assessments",   label: "Avaliações",   desc: "Avaliações físicas e protocolos", icon: ClipboardList },
  { key: "prescriptions", label: "Prescrições",  desc: "Treinos e planos de exercício",   icon: Dumbbell },
  { key: "calendar",      label: "Agenda",       desc: "Compromissos e eventos",          icon: Calendar },
  { key: "billing",       label: "Financeiro",   desc: "Faturação e plano da conta",      icon: CreditCard },
];

const CRUD_ACTIONS: Array<{ key: CrudAction; label: string }> = [
  { key: "view",   label: "Visualizar" },
  { key: "create", label: "Criar" },
  { key: "edit",   label: "Editar" },
  { key: "delete", label: "Excluir" },
];

// ── Props ────────────────────────────────────────────────────────────────────
interface AssistantPermissionsStepProps {
  permissions: PermissionsState;
  onToggleAdmin: (isAdmin: boolean) => void;
  /** Chamado pelo Switch com o NOVO valor. Use sempre o value recebido (idempotente). */
  onChangeAction: (module: ModuleKey, action: CrudAction, value: boolean) => void;
}

// ── Component ────────────────────────────────────────────────────────────────
export function AssistantPermissionsStep({
  permissions,
  onToggleAdmin,
  onChangeAction,
}: AssistantPermissionsStepProps) {
  const isAdmin = permissions.isAdmin;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          O que pode<br />fazer?
        </h1>
        <p className="text-base text-muted-foreground">
          Defina o acesso do assistente ao sistema
        </p>
      </div>

      {/* ── Banner informativo ──────────────────────────────────────────── */}
      <Alert variant="info">
        <Info />
        <AlertTitle>Sobre as permissões</AlertTitle>
        <AlertDescription>
          Defina o tipo de acesso que seu assistente terá na plataforma. Você pode
          conceder permissões para ver, editar, criar ou excluir informações específicas.
        </AlertDescription>
      </Alert>

      {/* ── Master toggle: Administrador ────────────────────────────────── */}
      {/* <label> permite clicar em qualquer parte para togglear o Switch interno */}
      <label
        className={cn(
          "w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 cursor-pointer select-none transition-all duration-200",
          isAdmin
            ? "border-primary bg-primary/8"
            : "border-border bg-muted/30 hover:bg-muted/60"
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
          checked={isAdmin ?? false}
          onCheckedChange={onToggleAdmin}
          aria-label="Ativar assistente administrador"
          className="shrink-0"
        />
      </label>

      {/* ── Grid de módulos CRUD ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {MODULES.map((mod) => (
          <ModuleCard
            key={mod.key}
            module={mod}
            permission={permissions[mod.key]}
            disabled={isAdmin}
            onChangeAction={(action, value) => onChangeAction(mod.key, action, value)}
          />
        ))}
      </div>

      {/* ── Resumo ──────────────────────────────────────────────────────── */}
      <PermissionsSummary permissions={permissions} />
    </div>
  );
}

// ── ModuleCard ───────────────────────────────────────────────────────────────
function ModuleCard({
  module,
  permission,
  disabled,
  onChangeAction,
}: {
  module: typeof MODULES[number];
  permission: CrudPermission;
  disabled: boolean;
  onChangeAction: (action: CrudAction, value: boolean) => void;
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
      {/* Header do módulo */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "size-10 rounded-xl flex items-center justify-center shrink-0",
            anyActive && !disabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
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

      {/* Matriz CRUD */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {CRUD_ACTIONS.map(({ key, label }) => (
          <ActionToggle
            key={key}
            label={label}
            checked={permission[key] ?? false}
            disabled={disabled}
            onChange={(value) => onChangeAction(key, value)}
          />
        ))}
      </div>
    </div>
  );
}

// ── ActionToggle ─────────────────────────────────────────────────────────────
// Usa <label> no lugar de <button> para evitar nesting inválido do base-ui Switch
// (que internamente renderiza um <input type="checkbox">). Assim o clique no
// label dispara nativamente o onCheckedChange do Switch, mantendo sync de estado.
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
        checked={checked ?? false}
        onCheckedChange={onChange}
        disabled={disabled}
        size="sm"
        aria-label={label}
        className="shrink-0"
      />
    </label>
  );
}

// ── Resumo ──────────────────────────────────────────────────────────────────
function PermissionsSummary({ permissions }: { permissions: PermissionsState }) {
  if (permissions.isAdmin) {
    return (
      <p className="text-sm text-primary text-center font-medium">
        Administrador — acesso total a todos os módulos
      </p>
    );
  }
  const activeModules = (Object.keys(permissions) as Array<keyof PermissionsState>)
    .filter((k): k is ModuleKey => k !== "isAdmin")
    .filter((k) => {
      const p = permissions[k];
      return p.view || p.create || p.edit || p.delete;
    }).length;

  return (
    <p className="text-sm text-muted-foreground text-center">
      {activeModules === 0
        ? "Nenhum módulo ativo — o assistente não terá acesso"
        : `${activeModules} de ${MODULES.length} módulos com permissões`}
    </p>
  );
}
