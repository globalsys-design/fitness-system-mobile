"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  ClipboardList,
  Edit2,
  Save,
  X,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionsToggle, PermissionsMap } from "./permissions-toggle";
import { cn } from "@/lib/utils";
import { PROFESSIONS } from "@/lib/constants/professions";
import { USER_STATUS_OPTIONS } from "@/lib/constants/user";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AssistantDetailProps {
  assistant: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    cpf: string | null;
    birthCity: string | null;
    maritalStatus: string | null;
    profession: string | null;
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

export function AssistantDetail({ assistant }: AssistantDetailProps) {
  const router = useRouter();
  const [tab, setTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: assistant.name,
    email: assistant.email,
    phone: assistant.phone ?? "",
    cpf: assistant.cpf ?? "",
    profession: assistant.profession ?? "",
    birthCity: assistant.birthCity ?? "",
    status: assistant.status,
  });

  // Permissions state
  const [permissions, setPermissions] = useState<PermissionsMap>(
    (assistant.permissions as PermissionsMap) ?? {
      clients: { read: true, write: false },
      assessments: { read: true, write: false },
      prescriptions: { read: true, write: false },
      calendar: { read: true, write: false },
      billing: { read: false, write: false },
    }
  );
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/assistants/${assistant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      toast.success("Dados atualizados com sucesso!");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
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
      // Reverte optimistic update
      setPermissions(
        (assistant.permissions as PermissionsMap) ?? {
          clients: { read: true, write: false },
          assessments: { read: true, write: false },
          prescriptions: { read: true, write: false },
          calendar: { read: true, write: false },
          billing: { read: false, write: false },
        }
      );
    } finally {
      setIsSavingPermissions(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Header do assistente */}
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
          <p className="text-sm text-muted-foreground mt-0.5">
            {assistant.profession ?? "Profissão não definida"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Desde{" "}
            {format(new Date(assistant.createdAt), "MMM yyyy", {
              locale: ptBR,
            })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1">
        <div className="px-4 pt-3 border-b border-border bg-background sticky top-0 z-10">
          <TabsList className="w-full h-10 bg-transparent p-0 gap-0">
            <TabsTrigger
              value="info"
              className="flex-1 text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none h-10"
            >
              Informações
            </TabsTrigger>
            <TabsTrigger
              value="access"
              className="flex-1 text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none h-10"
            >
              Acesso
            </TabsTrigger>
            <TabsTrigger
              value="assessments"
              className="flex-1 text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none h-10"
            >
              Avaliações
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="flex-1 text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none h-10"
            >
              Permissões
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: Informações */}
        <TabsContent value="info" className="mt-0 flex-1">
          <div className="p-4">
            {/* Botão editar */}
            <div className="flex justify-end mb-3">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: assistant.name,
                        email: assistant.email,
                        phone: assistant.phone ?? "",
                        cpf: assistant.cpf ?? "",
                        profession: assistant.profession ?? "",
                        birthCity: assistant.birthCity ?? "",
                        status: assistant.status,
                      });
                    }}
                  >
                    <X className="size-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="size-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="size-4 mr-1" />
                    )}
                    Salvar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="size-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>

            {isEditing ? (
              /* Modo edição */
              <div className="flex flex-col gap-4">
                <div>
                  <Label>Nome completo</Label>
                  <Input
                    className="mt-1.5"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    inputMode="email"
                    className="mt-1.5"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    type="tel"
                    inputMode="tel"
                    className="mt-1.5"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>CPF</Label>
                  <Input
                    inputMode="numeric"
                    className="mt-1.5"
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({ ...formData, cpf: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Profissão</Label>
                  <Select
                    value={formData.profession || undefined}
                    onValueChange={(v) => {
                      if (v !== null) setFormData({ ...formData, profession: v as string });
                    }}
                  >
                    <SelectTrigger className="h-12 mt-1.5">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => {
                      if (v !== null) setFormData({ ...formData, status: v as string });
                    }}
                  >
                    <SelectTrigger className="h-12 mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              /* Modo visualização */
              <div className="flex flex-col gap-1">
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={assistant.email}
                />
                <InfoRow
                  icon={Phone}
                  label="Telefone"
                  value={assistant.phone}
                />
                <InfoRow
                  icon={User}
                  label="CPF"
                  value={assistant.cpf}
                />
                <InfoRow
                  icon={Briefcase}
                  label="Profissão"
                  value={assistant.profession}
                />
                <InfoRow
                  icon={MapPin}
                  label="Cidade natal"
                  value={assistant.birthCity}
                />
                {assistant.address && (
                  <InfoRow
                    icon={MapPin}
                    label="Endereço"
                    value={formatAddress(assistant.address)}
                  />
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Acesso */}
        <TabsContent value="access" className="mt-0 flex-1">
          <div className="p-4 flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Conta ativa
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Permitir que o assistente acesse o sistema
                  </p>
                </div>
                <Switch
                  checked={formData.status === "ACTIVE"}
                  onCheckedChange={async (checked) => {
                    const newStatus = checked ? "ACTIVE" : "INACTIVE";
                    setFormData({ ...formData, status: newStatus });
                    try {
                      await fetch(`/api/assistants/${assistant.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: newStatus }),
                      });
                      toast.success(
                        checked ? "Acesso ativado" : "Acesso desativado"
                      );
                      router.refresh();
                    } catch {
                      toast.error("Erro ao alterar status.");
                    }
                  }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground mb-1">
                Email de acesso
              </p>
              <p className="text-sm text-muted-foreground">
                {assistant.email}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground mb-1">
                Último acesso
              </p>
              <p className="text-sm text-muted-foreground">
                Informação indisponível
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground mb-1">
                Cadastrado em
              </p>
              <p className="text-sm text-muted-foreground">
                {format(
                  new Date(assistant.createdAt),
                  "dd/MM/yyyy 'às' HH:mm",
                  { locale: ptBR }
                )}
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Avaliações */}
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
                        {format(new Date(assessment.createdAt), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
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
                      {assessment.status === "COMPLETE"
                        ? "Completa"
                        : "Rascunho"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Permissões */}
        <TabsContent value="permissions" className="mt-0 flex-1">
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Permissões do módulo
                </p>
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
  );
}

/* Componentes auxiliares */
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
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
