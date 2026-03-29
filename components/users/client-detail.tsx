"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ClipboardList,
  Dumbbell,
  Edit2,
  Save,
  X,
  User,
  Shield,
  ChevronRight,
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { GENDER_OPTIONS } from "@/lib/validations/client";
import Link from "next/link";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientDetailProps {
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    cpf: string | null;
    birthDate: string | null;
    gender: string | null;
    photo: string | null;
    address: any;
    emergencyContact: any;
    status: string;
    createdAt: string;
    assessments: Array<{
      id: string;
      population: string;
      modality: string | null;
      status: string;
      createdAt: string;
    }>;
    prescriptions: Array<{
      id: string;
      type: string;
      createdAt: string;
    }>;
  };
}

export function ClientDetail({ client }: ClientDetailProps) {
  const router = useRouter();
  const [tab, setTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const age = client.birthDate
    ? differenceInYears(new Date(), new Date(client.birthDate))
    : null;

  const birthDateFormatted = client.birthDate
    ? format(new Date(client.birthDate), "dd/MM/yyyy", { locale: ptBR })
    : null;

  const genderLabel =
    client.gender === "M"
      ? "Masculino"
      : client.gender === "F"
        ? "Feminino"
        : client.gender === "OTHER"
          ? "Outro"
          : null;

  // Form state para edição
  const [formData, setFormData] = useState({
    name: client.name,
    email: client.email ?? "",
    phone: client.phone ?? "",
    cpf: client.cpf ?? "",
    birthDate: client.birthDate
      ? format(new Date(client.birthDate), "yyyy-MM-dd")
      : "",
    gender: client.gender ?? "",
    status: client.status,
  });

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
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

  return (
    <div className="flex flex-col">
      {/* Header do cliente */}
      <div className="flex items-center gap-4 px-4 py-5 border-b border-border bg-card">
        <Avatar className="size-16 shrink-0">
          <AvatarImage src={client.photo ?? undefined} />
          <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
            {client.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground truncate">
              {client.name}
            </h2>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs shrink-0",
                client.status === "ACTIVE"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {client.status === "ACTIVE" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {genderLabel && (
              <span className="text-sm text-muted-foreground">
                {genderLabel}
              </span>
            )}
            {age !== null && (
              <span className="text-sm text-muted-foreground">
                {genderLabel ? "•" : ""} {age} anos
              </span>
            )}
          </div>
          {/* Contadores */}
          <div className="flex items-center gap-4 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ClipboardList className="size-3.5" />
              {client.assessments.length} aval.
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Dumbbell className="size-3.5" />
              {client.prescriptions.length} pres.
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex flex-col flex-1"
      >
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
              value="prescriptions"
              className="flex-1 text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none h-10"
            >
              Prescrições
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: Informações */}
        <TabsContent value="info" className="mt-0 flex-1">
          <div className="p-4">
            <div className="flex justify-end mb-3">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: client.name,
                        email: client.email ?? "",
                        phone: client.phone ?? "",
                        cpf: client.cpf ?? "",
                        birthDate: client.birthDate
                          ? format(new Date(client.birthDate), "yyyy-MM-dd")
                          : "",
                        gender: client.gender ?? "",
                        status: client.status,
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
                  <Label>Data de nascimento</Label>
                  <Input
                    type="date"
                    className="mt-1.5"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Gênero</Label>
                  <Select
                    value={formData.gender || undefined}
                    onValueChange={(v) => {
                      if (v !== null)
                        setFormData({ ...formData, gender: v as string });
                    }}
                  >
                    <SelectTrigger className="h-12 mt-1.5">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <InfoRow icon={Mail} label="Email" value={client.email} />
                <InfoRow icon={Phone} label="Telefone" value={client.phone} />
                <InfoRow icon={User} label="CPF" value={client.cpf} />
                <InfoRow
                  icon={Calendar}
                  label="Nascimento"
                  value={
                    birthDateFormatted
                      ? `${birthDateFormatted} (${age} anos)`
                      : null
                  }
                />
                <InfoRow
                  icon={User}
                  label="Gênero"
                  value={genderLabel}
                />
                {client.address && (
                  <InfoRow
                    icon={MapPin}
                    label="Endereço"
                    value={formatAddress(client.address)}
                  />
                )}
                {client.emergencyContact && (
                  <>
                    <div className="border-t border-border mt-2 pt-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Contato de emergência
                      </p>
                    </div>
                    <InfoRow
                      icon={User}
                      label="Nome"
                      value={client.emergencyContact.name}
                    />
                    <InfoRow
                      icon={Phone}
                      label="Telefone"
                      value={client.emergencyContact.phone}
                    />
                    <InfoRow
                      icon={Shield}
                      label="Parentesco"
                      value={client.emergencyContact.relationship}
                    />
                  </>
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
                    Permitir que o cliente acesse o sistema
                  </p>
                </div>
                <Switch
                  checked={formData.status === "ACTIVE"}
                  onCheckedChange={async (checked) => {
                    const newStatus = checked ? "ACTIVE" : "INACTIVE";
                    setFormData({ ...formData, status: newStatus });
                    try {
                      await fetch(`/api/clients/${client.id}`, {
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
                {client.email ?? "Não configurado"}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground mb-1">
                Cadastrado em
              </p>
              <p className="text-sm text-muted-foreground">
                {format(
                  new Date(client.createdAt),
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
            {client.assessments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="flex items-center justify-center size-16 rounded-full bg-muted">
                  <ClipboardList className="size-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Nenhuma avaliação realizada
                </p>
                <Link href="/app/avaliacoes/nova">
                  <Button variant="outline" size="sm">
                    Criar avaliação
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
                {client.assessments.map((assessment, i) => (
                  <Link
                    key={assessment.id}
                    href={`/app/avaliacoes/${assessment.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 bg-card active:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {i + 1}ª
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {assessment.modality ?? assessment.population}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(assessment.createdAt),
                          "dd/MM/yyyy",
                          { locale: ptBR }
                        )}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs shrink-0",
                        assessment.status === "COMPLETE"
                          ? "bg-primary/10 text-primary"
                          : "bg-accent text-muted-foreground"
                      )}
                    >
                      {assessment.status === "COMPLETE"
                        ? "Concluída"
                        : "Pendente"}
                    </Badge>
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Prescrições */}
        <TabsContent value="prescriptions" className="mt-0 flex-1">
          <div className="p-4">
            {client.prescriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="flex items-center justify-center size-16 rounded-full bg-muted">
                  <Dumbbell className="size-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Nenhuma prescrição cadastrada
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
                {client.prescriptions.map((prescription) => (
                  <Link
                    key={prescription.id}
                    href={`/app/prescricoes/${prescription.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 bg-card active:bg-muted/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center size-10 rounded-lg shrink-0",
                        prescription.type === "TRAINING"
                          ? "bg-primary/10 text-primary"
                          : "bg-accent text-accent-foreground"
                      )}
                    >
                      <Dumbbell className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {prescription.type === "TRAINING"
                          ? "Ficha de Treino"
                          : "Prescrição Aeróbica"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(prescription.createdAt),
                          "dd/MM/yyyy",
                          { locale: ptBR }
                        )}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs shrink-0 bg-primary/10 text-primary"
                    >
                      Ativa
                    </Badge>
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            )}
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
