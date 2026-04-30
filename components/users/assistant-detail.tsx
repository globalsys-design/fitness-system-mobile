"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Phone,
  PhoneCall,
  MapPin,
  Briefcase,
  ClipboardList,
  Dumbbell,
  ChevronRight,
  Edit2,
  User,
  Calendar,
  Building,
  Heart,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionsToggle, EMPTY_CRUD, type PermissionsMap } from "./permissions-toggle";
import { AssistantEditSheet } from "./sheets/AssistantEditSheet";
import { PasswordGeneratorBlock } from "./PasswordGeneratorBlock";
import { DetailHeader } from "./client-detail";
import { cn } from "@/lib/utils";
import { maskPhone } from "@/components/ui/phone-input";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AssistantDetailProps {
  assistant: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    emergencyPhone: string | null;
    cpf: string | null;
    birthDate: string | null;
    birthCity: string | null;
    maritalStatus: string | null;
    profession: string | null;
    role: string | null;
    photo: string | null;
    address: any;
    status: string;
    permissions: any;
    createdAt: string;
    assessments: Array<{
      id: string;
      status: string;
      modality: string | null;
      createdAt: string;
      client: { name: string };
    }>;
    prescriptions: Array<{
      id: string;
      type: string;
      title: string | null;
      createdAt: string;
    }>;
  };
}

const MARITAL_STATUS_LABELS: Record<string, string> = {
  single:   "Solteiro(a)",
  married:  "Casado(a)",
  divorced: "Divorciado(a)",
  widowed:  "Viúvo(a)",
  other:    "Outro",
};

export function AssistantDetail({ assistant }: AssistantDetailProps) {
  const router = useRouter();
  const [tab, setTab] = useState("info");
  const [editOpen, setEditOpen] = useState(false);
  const [statusActive, setStatusActive] = useState(assistant.status === "ACTIVE");
  const [accessPassword, setAccessPassword] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  // Permissions state (modelo CRUD + isAdmin)
  const DEFAULT_PERMISSIONS: PermissionsMap = {
    isAdmin: false,
    clients:       { ...EMPTY_CRUD, view: true },
    assessments:   { ...EMPTY_CRUD, view: true },
    prescriptions: { ...EMPTY_CRUD, view: true },
    calendar:      { ...EMPTY_CRUD, view: true },
    billing:       { ...EMPTY_CRUD },
  };
  const [permissions, setPermissions] = useState<PermissionsMap>(
    (assistant.permissions as PermissionsMap) ?? DEFAULT_PERMISSIONS
  );
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  async function handleSavePassword() {
    if (accessPassword.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    setSavingPwd(true);
    try {
      const res = await fetch(`/api/assistants/${assistant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: accessPassword }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error ?? `HTTP ${res.status}`);
      }
      toast.success("Senha definida com sucesso!");
      setAccessPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar senha.");
    } finally {
      setSavingPwd(false);
    }
  }

  async function handleToggleStatus(checked: boolean) {
    const newStatus = checked ? "ACTIVE" : "INACTIVE";
    setStatusActive(checked);
    try {
      await fetch(`/api/assistants/${assistant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(checked ? "Acesso ativado" : "Acesso desativado");
      router.refresh();
    } catch {
      toast.error("Erro ao alterar status.");
      setStatusActive(!checked);
    }
  }

  async function handleSavePermissions(newPermissions: PermissionsMap) {
    setPermissions(newPermissions);
    setIsSavingPermissions(true);
    try {
      const res = await fetch(`/api/assistants/${assistant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: newPermissions }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      toast.success("Permissões atualizadas!");
    } catch {
      toast.error("Erro ao salvar permissões.");
      setPermissions((assistant.permissions as PermissionsMap) ?? DEFAULT_PERMISSIONS);
    } finally {
      setIsSavingPermissions(false);
    }
  }

  return (
    <>
      <div className="flex flex-col">
        {/* Header — spell reutilizado do ClientDetail, com edit button padrão */}
        <DetailHeader
          name={assistant.name}
          photo={assistant.photo}
          isActive={statusActive}
          statusLabel={statusActive ? "Ativo" : "Inativo"}
          statusKey={String(statusActive)}
          meta={
            [
              [assistant.profession, assistant.role].filter(Boolean).join(" · "),
              `Desde ${format(new Date(assistant.createdAt), "MMM yyyy", { locale: ptBR })}`,
            ]
              .filter(Boolean)
              .join(" • ") || undefined
          }
          stats={[
            { icon: ClipboardList, label: "aval.", value: assistant.assessments.length },
            { icon: Dumbbell, label: "pres.", value: assistant.prescriptions.length },
          ]}
          onEdit={() => setEditOpen(true)}
          editLabel="Editar assistente"
        />

        {/* Tabs — spell: growing pill underline */}
        <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1">
          <div className="px-4 pt-3 border-b border-border bg-background sticky top-0 z-10">
            <TabsList className="w-full h-11 bg-transparent p-0 gap-0 relative">
              {[
                { value: "info",          label: "Informações" },
                { value: "access",        label: "Acesso" },
                { value: "assessments",   label: "Avaliações" },
                { value: "prescriptions", label: "Prescrições" },
                { value: "permissions",   label: "Permissões" },
              ].map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className={cn(
                    "flex-1 text-[11px] px-1 h-11 rounded-none relative bg-transparent",
                    "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                    "data-[state=active]:text-primary text-muted-foreground",
                    "transition-colors duration-200",
                    "after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2",
                    "after:h-[3px] after:w-0 after:rounded-t-full after:bg-primary",
                    "after:transition-[width,box-shadow] after:duration-300 after:ease-out",
                    "data-[state=active]:after:w-6 data-[state=active]:after:shadow-[0_0_10px_oklch(from_var(--color-primary)_l_c_h/0.5)]"
                  )}
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Tab: Informações ─────────────────────────────────── */}
          <TabsContent value="info" className="mt-0 flex-1 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-1 data-[state=active]:duration-300">
            <div className="p-4 flex flex-col gap-5">
              {/* Bloco 1 — Dados Pessoais */}
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Dados Pessoais
                </p>
                <InfoRow icon={Mail}     label="Email"             value={assistant.email} />
                <InfoRow icon={Phone}    label="Telefone"          value={assistant.phone ? maskPhone(assistant.phone) : null} />
                <InfoRow icon={PhoneCall} label="Tel. emergência"  value={assistant.emergencyPhone ? maskPhone(assistant.emergencyPhone) : null} />
                <InfoRow icon={User}     label="CPF"               value={assistant.cpf} />
                <InfoRow
                  icon={Calendar}
                  label="Data de nascimento"
                  value={
                    assistant.birthDate
                      ? format(new Date(assistant.birthDate), "dd/MM/yyyy", { locale: ptBR })
                      : null
                  }
                />
                <InfoRow icon={MapPin}   label="Cidade natal"      value={assistant.birthCity} />
                <InfoRow
                  icon={Heart}
                  label="Estado civil"
                  value={
                    assistant.maritalStatus
                      ? (MARITAL_STATUS_LABELS[assistant.maritalStatus] ?? assistant.maritalStatus)
                      : null
                  }
                />
              </div>

              <Separator />

              {/* Bloco 2 — Endereço */}
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Endereço
                </p>
                <InfoRow
                  icon={MapPin}
                  label="Endereço"
                  value={formatAddress(assistant.address)}
                />
              </div>

              <Separator />

              {/* Bloco 3 — Dados Profissionais */}
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Dados Profissionais
                </p>
                <InfoRow icon={Briefcase} label="Profissão"    value={assistant.profession} />
                <InfoRow icon={Building}  label="Cargo / Função" value={assistant.role} />
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: Acesso ──────────────────────────────────────── */}
          <TabsContent value="access" className="mt-0 flex-1 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-1 data-[state=active]:duration-300">
            <div className="p-4 flex flex-col gap-4">
              <div
                className={cn(
                  "rounded-xl border p-4 transition-[background-color,border-color] duration-300",
                  statusActive
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors",
                        statusActive ? "text-primary" : "text-foreground"
                      )}
                    >
                      Conta ativa
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Permitir que o assistente acesse o sistema
                    </p>
                  </div>
                  <Switch
                    checked={statusActive}
                    onCheckedChange={handleToggleStatus}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground mb-1">Email de acesso</p>
                <p className="text-sm text-muted-foreground">{assistant.email}</p>
              </div>

              {/* Gerador de senha */}
              <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4">
                <p className="text-sm font-medium text-foreground">Senha de acesso</p>
                <PasswordGeneratorBlock
                  value={accessPassword}
                  onChange={setAccessPassword}
                />
                {accessPassword.length >= 8 && (
                  <Button
                    size="sm"
                    className="w-full h-11 mt-1 transition-transform duration-150 active:scale-[0.98] animate-in fade-in slide-in-from-bottom-1 duration-200"
                    onClick={handleSavePassword}
                    disabled={savingPwd}
                  >
                    {savingPwd ? "Salvando…" : "Salvar nova senha"}
                  </Button>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground mb-1">Último acesso</p>
                <p className="text-sm text-muted-foreground">Informação indisponível</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground mb-1">Cadastrado em</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(assistant.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: Avaliações ──────────────────────────────────── */}
          <TabsContent value="assessments" className="mt-0 flex-1 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-1 data-[state=active]:duration-300">
            <div className="p-4">
              {assistant.assessments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 animate-in fade-in duration-500">
                  <div className="flex items-center justify-center size-16 rounded-full bg-muted animate-in zoom-in-50 duration-500 fill-mode-both">
                    <ClipboardList className="size-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Nenhuma avaliação vinculada
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
                  {assistant.assessments.map((assessment, i) => (
                    <Link
                      key={assessment.id}
                      href={`/app/avaliacoes/${assessment.id}`}
                      style={{ animationDelay: `${i * 50}ms` }}
                      className="flex items-center gap-3 px-4 py-3.5 bg-card active:bg-muted/50 transition-colors animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both"
                    >
                      <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary shrink-0">
                        <ClipboardList className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {assessment.client.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {assessment.modality ?? "Avaliação"} •{" "}
                          {format(new Date(assessment.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs shrink-0",
                          assessment.status === "COMPLETE"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {assessment.status === "COMPLETE" ? "Completa" : "Rascunho"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Tab: Prescrições ─────────────────────────────────── */}
          <TabsContent value="prescriptions" className="mt-0 flex-1 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-1 data-[state=active]:duration-300">
            <div className="p-4">
              {assistant.prescriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 animate-in fade-in duration-500">
                  <div className="flex items-center justify-center size-16 rounded-full bg-muted animate-in zoom-in-50 duration-500 fill-mode-both">
                    <Dumbbell className="size-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Nenhuma prescrição vinculada
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
                  {assistant.prescriptions.map((p, i) => (
                    <Link
                      key={p.id}
                      href={`/app/prescricoes/${p.id}`}
                      style={{ animationDelay: `${i * 50}ms` }}
                      className="flex items-center gap-3 px-4 py-3.5 bg-card active:bg-muted/50 transition-colors animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both"
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center size-10 rounded-lg shrink-0",
                          p.type === "TRAINING"
                            ? "bg-primary/10 text-primary"
                            : "bg-accent text-accent-foreground",
                        )}
                      >
                        <Dumbbell className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {p.title ?? (p.type === "TRAINING" ? "Ficha de Treino" : "Prescrição Aeróbica")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(p.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0 bg-primary/10 text-primary">
                        Ativa
                      </Badge>
                      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Tab: Permissões ──────────────────────────────────── */}
          <TabsContent value="permissions" className="mt-0 flex-1 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-1 data-[state=active]:duration-300">
            <div className="p-4 flex flex-col gap-4">
              {isSavingPermissions && (
                <div className="flex items-center justify-end gap-2 text-xs text-primary">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Salvando…</span>
                </div>
              )}
              <PermissionsToggle
                permissions={permissions}
                onChange={handleSavePermissions}
                disabled={isSavingPermissions}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Sheet */}
      <AssistantEditSheet
        assistant={{
          ...assistant,
          birthDate: assistant.birthDate,
          emergencyPhone: assistant.emergencyPhone,
          role: assistant.role,
        }}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}

/* ── Componentes auxiliares ──────────────────────────────────────────── */
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  const filled = !!value;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div
        className={cn(
          "flex items-center justify-center size-9 rounded-lg shrink-0 transition-colors duration-300",
          filled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            "text-sm font-medium truncate",
            filled ? "text-foreground" : "text-muted-foreground/50 italic"
          )}
        >
          {value || "Não informado"}
        </p>
      </div>
    </div>
  );
}

function formatAddress(address: any): string {
  if (!address) return "";
  const parts = [
    address.street,
    address.number,
    address.complement,
    address.neighborhood,
    address.city,
    address.state,
  ].filter(Boolean);
  return parts.join(", ") || "Não informado";
}
