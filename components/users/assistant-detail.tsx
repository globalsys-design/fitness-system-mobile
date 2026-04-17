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
import { PermissionsToggle, PermissionsMap } from "./permissions-toggle";
import { AssistantEditSheet } from "./sheets/AssistantEditSheet";
import { cn } from "@/lib/utils";
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

  // Permissions state
  const [permissions, setPermissions] = useState<PermissionsMap>(
    (assistant.permissions as PermissionsMap) ?? {
      clients:       { read: true, write: false },
      assessments:   { read: true, write: false },
      prescriptions: { read: true, write: false },
      calendar:      { read: true, write: false },
      billing:       { read: false, write: false },
    }
  );
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

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
      setPermissions(
        (assistant.permissions as PermissionsMap) ?? {
          clients:       { read: true, write: false },
          assessments:   { read: true, write: false },
          prescriptions: { read: true, write: false },
          calendar:      { read: true, write: false },
          billing:       { read: false, write: false },
        }
      );
    } finally {
      setIsSavingPermissions(false);
    }
  }

  return (
    <>
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-5 border-b border-border bg-card">
          <Avatar className="size-16 shrink-0">
            <AvatarImage src={assistant.photo ?? undefined} />
            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
              {assistant.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground truncate">
                {assistant.name}
              </h2>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs shrink-0",
                  assistant.status === "ACTIVE"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {assistant.status === "ACTIVE" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            {(assistant.profession || assistant.role) && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {[assistant.profession, assistant.role].filter(Boolean).join(" · ")}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              Desde{" "}
              {format(new Date(assistant.createdAt), "MMM yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1">
          <div className="px-4 pt-3 border-b border-border bg-background sticky top-0 z-10">
            <TabsList className="w-full h-10 bg-transparent p-0 gap-0">
              {[
                { value: "info",        label: "Informações" },
                { value: "access",      label: "Acesso" },
                { value: "assessments", label: "Avaliações" },
                { value: "permissions", label: "Permissões" },
              ].map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="flex-1 text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none h-10"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Tab: Informações ─────────────────────────────────── */}
          <TabsContent value="info" className="mt-0 flex-1">
            <div className="p-4 flex flex-col gap-5">
              {/* Botão editar */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                >
                  <Edit2 className="size-4 mr-1.5" />
                  Editar
                </Button>
              </div>

              {/* Bloco 1 — Dados Pessoais */}
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Dados Pessoais
                </p>
                <InfoRow icon={Mail}     label="Email"             value={assistant.email} />
                <InfoRow icon={Phone}    label="Telefone"          value={assistant.phone} />
                <InfoRow icon={PhoneCall} label="Tel. emergência"  value={assistant.emergencyPhone} />
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
          <TabsContent value="access" className="mt-0 flex-1">
            <div className="p-4 flex flex-col gap-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Conta ativa</p>
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
          <TabsContent value="assessments" className="mt-0 flex-1">
            <div className="p-4">
              {assistant.assessments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="flex items-center justify-center size-16 rounded-full bg-muted">
                    <ClipboardList className="size-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Nenhuma avaliação vinculada
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
                  {assistant.assessments.map((assessment) => (
                    <Link
                      key={assessment.id}
                      href={`/app/avaliacoes/${assessment.id}`}
                      className="flex items-center gap-3 px-4 py-3.5 bg-card active:bg-muted/50 transition-colors"
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

          {/* ── Tab: Permissões ──────────────────────────────────── */}
          <TabsContent value="permissions" className="mt-0 flex-1">
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Permissões do módulo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Defina o que este assistente pode acessar
                  </p>
                </div>
                {isSavingPermissions && (
                  <Loader2 className="size-4 animate-spin text-primary" />
                )}
              </div>
              <PermissionsToggle
                permissions={permissions}
                onChange={handleSavePermissions}
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
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="flex items-center justify-center size-9 rounded-lg bg-muted text-muted-foreground shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">
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
