"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  ClipboardList,
  Dumbbell,
  User,
  Shield,
  ChevronRight,
  CheckCircle2,
  Activity,
  Pencil,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordGeneratorBlock } from "./PasswordGeneratorBlock";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { maskPhone } from "@/components/ui/phone-input";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";

// Sheets
import { EditPersonalSheet } from "./sheets/EditPersonalSheet";
import { EditContactSheet } from "./sheets/EditContactSheet";
import { EditAddressSheet } from "./sheets/EditAddressSheet";
import { EditEmergencySheet } from "./sheets/EditEmergencySheet";
import { EditAvailabilitySheet } from "./sheets/EditAvailabilitySheet";

interface ClientDetailProps {
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    phoneDdi: string | null;
    cpf: string | null;
    birthDate: string | null;
    gender: string | null;
    ethnicity: string | null;
    maritalStatus: string | null;
    healthInsurance: string | null;
    objective: string | null;
    activityLevel: string | null;
    photo: string | null;
    address: any;
    emergencyContact: any;
    availability: any;
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

  // ── Sheet open states ────────────────────────────────────────────────────
  const [personalOpen, setPersonalOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);

  // ── Computed values ─────────────────────────────────────────────────────
  const age = client.birthDate
    ? differenceInYears(new Date(), new Date(client.birthDate))
    : null;

  const birthDateFormatted = client.birthDate
    ? format(new Date(client.birthDate), "dd/MM/yyyy", { locale: ptBR })
    : null;

  const genderLabel =
    client.gender === "M" ? "Masculino" : client.gender === "F" ? "Feminino" : null;

  const activityLevelLabel: Record<string, string> = {
    sedentary: "Sedentário",
    light: "Levemente ativo",
    moderate: "Moderadamente ativo",
    active: "Muito ativo",
    athlete: "Atleta",
  };

  const objectiveLabel: Record<string, string> = {
    emagrecimento: "Emagrecimento",
    hipertrofia: "Hipertrofia",
    condicionamento: "Condicionamento",
    saude: "Saúde & Bem-estar",
    reabilitacao: "Reabilitação",
    performance: "Performance",
  };

  // ── Progressive Profiling ────────────────────────────────────────────────
  const profileFields = [
    { key: "email",        filled: !!client.email },
    { key: "phone",        filled: !!client.phone },
    { key: "cpf",          filled: !!client.cpf },
    { key: "birthDate",    filled: !!client.birthDate },
    { key: "gender",       filled: !!client.gender },
    { key: "objective",    filled: !!client.objective },
    { key: "activityLevel",filled: !!client.activityLevel },
    { key: "address",      filled: !!client.address },
    { key: "photo",        filled: !!client.photo },
  ];

  const completedCount = profileFields.filter((f) => f.filled).length;
  const completionPct = Math.round((completedCount / profileFields.length) * 100);
  const isProfileComplete = completionPct === 100;

  return (
    <>
      {/* ── Sheets ───────────────────────────────────────────────────────── */}
      <EditPersonalSheet
        clientId={client.id}
        open={personalOpen}
        onOpenChange={setPersonalOpen}
        initialData={{
          name: client.name,
          birthDate: client.birthDate
            ? format(new Date(client.birthDate), "yyyy-MM-dd")
            : "",
          gender: client.gender ?? "",
          cpf: client.cpf ?? "",
          ethnicity: client.ethnicity ?? "",
          maritalStatus: client.maritalStatus ?? "",
          healthInsurance: client.healthInsurance ?? "",
        }}
      />
      <EditContactSheet
        clientId={client.id}
        open={contactOpen}
        onOpenChange={setContactOpen}
        initialData={{
          email: client.email ?? "",
          phone: client.phone ?? "",
          phoneDdi: client.phoneDdi ?? "+55",
        }}
      />
      <EditAddressSheet
        clientId={client.id}
        open={addressOpen}
        onOpenChange={setAddressOpen}
        initialData={client.address ?? null}
      />
      <EditEmergencySheet
        clientId={client.id}
        open={emergencyOpen}
        onOpenChange={setEmergencyOpen}
        initialData={client.emergencyContact ?? null}
      />
      <EditAvailabilitySheet
        clientId={client.id}
        open={availabilityOpen}
        onOpenChange={setAvailabilityOpen}
        initialData={client.availability ?? null}
      />

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-5 border-b border-border bg-card">
          <Avatar className="size-16 shrink-0">
            <AvatarImage src={client.photo ?? undefined} />
            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
              {client.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground truncate">{client.name}</h2>
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
                <span className="text-sm text-muted-foreground">{genderLabel}</span>
              )}
              {age !== null && (
                <span className="text-sm text-muted-foreground">
                  {genderLabel ? "•" : ""} {age} anos
                </span>
              )}
            </div>
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

        {/* Progressive Profiling Banner */}
        {!isProfileComplete && (
          <div className="px-4 py-3 bg-primary/10 border-b border-primary/20">
            <Progress value={completionPct}>
              <ProgressLabel className="text-xs font-semibold text-foreground">
                Completar perfil
              </ProgressLabel>
              <ProgressValue className="text-xs font-semibold text-primary">
                {completionPct}%
              </ProgressValue>
              <ProgressTrack className="w-full">
                <ProgressIndicator />
              </ProgressTrack>
            </Progress>
            <p className="text-xs text-muted-foreground mt-2">
              {completedCount} de {profileFields.length} informações preenchidas — toque em Editar para completar
            </p>
          </div>
        )}
        {isProfileComplete && (
          <div className="px-4 py-3 bg-primary/10 border-b border-primary/20 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary shrink-0" />
            <p className="text-sm font-medium text-primary">Perfil completo! 🎉</p>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1">
          <div className="px-4 pt-3 border-b border-border bg-background sticky top-0 z-10">
            <TabsList className="w-full h-10 bg-transparent p-0 gap-0">
              {["info", "access", "assessments", "prescriptions"].map((t) => (
                <TabsTrigger
                  key={t}
                  value={t}
                  className="flex-1 text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none h-10"
                >
                  {t === "info" ? "Informações" : t === "access" ? "Acesso" : t === "assessments" ? "Avaliações" : "Prescrições"}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Tab: Informações ─────────────────────────────────────────── */}
          <TabsContent value="info" className="mt-0 flex-1">
            <div className="flex flex-col gap-0 p-4">

              {/* SECÇÃO: Dados Pessoais */}
              <SectionHeader
                title="Dados Pessoais"
                onEdit={() => setPersonalOpen(true)}
              />
              <InfoRow icon={User} label="CPF" value={client.cpf} />
              <InfoRow
                icon={Calendar}
                label="Nascimento"
                value={birthDateFormatted ? `${birthDateFormatted} (${age} anos)` : null}
              />
              <InfoRow icon={User} label="Gênero" value={genderLabel} />
              <InfoRow
                icon={User}
                label="Estado Civil"
                value={client.maritalStatus ?? null}
              />
              <InfoRow
                icon={Shield}
                label="Plano de Saúde"
                value={client.healthInsurance ?? null}
              />

              {/* SECÇÃO: Contato */}
              <SectionHeader
                title="Contato"
                onEdit={() => setContactOpen(true)}
                className="mt-5"
              />
              <InfoRow icon={Mail} label="Email" value={client.email} />
              <InfoRow icon={Phone} label="Telefone" value={client.phone ? maskPhone(client.phone) : null} />

              {/* SECÇÃO: Metas */}
              <SectionHeader title="Metas & Rotina" className="mt-5" />
              <InfoRow
                icon={Dumbbell}
                label="Objetivo"
                value={client.objective ? objectiveLabel[client.objective] ?? client.objective : null}
              />
              <InfoRow
                icon={Activity}
                label="Nível de Atividade"
                value={client.activityLevel ? activityLevelLabel[client.activityLevel] ?? client.activityLevel : null}
              />

              {/* SECÇÃO: Disponibilidade */}
              <SectionHeader
                title="Disponibilidade"
                onEdit={() => setAvailabilityOpen(true)}
                className="mt-5"
              />
              {client.availability ? (
                <AvailabilityDisplay availability={client.availability} />
              ) : (
                <button
                  onClick={() => setAvailabilityOpen(true)}
                  className="flex items-center gap-2 py-3 text-sm text-primary font-medium"
                >
                  <Clock className="size-4" />
                  Adicionar disponibilidade
                </button>
              )}

              {/* SECÇÃO: Endereço */}
              <SectionHeader
                title="Endereço"
                onEdit={() => setAddressOpen(true)}
                className="mt-5"
              />
              {client.address ? (
                <InfoRow icon={MapPin} label="Endereço" value={formatAddress(client.address)} />
              ) : (
                <button
                  onClick={() => setAddressOpen(true)}
                  className="flex items-center gap-2 py-3 text-sm text-primary font-medium"
                >
                  <MapPin className="size-4" />
                  Adicionar endereço
                </button>
              )}

              {/* SECÇÃO: Emergência */}
              <SectionHeader
                title="Contato de Emergência"
                onEdit={() => setEmergencyOpen(true)}
                className="mt-5"
              />
              {client.emergencyContact ? (
                <>
                  <InfoRow icon={User} label="Nome" value={client.emergencyContact.name} />
                  <InfoRow icon={Phone} label="Telefone" value={client.emergencyContact.phone} />
                  <InfoRow icon={Shield} label="Parentesco" value={client.emergencyContact.notes ?? client.emergencyContact.relationship} />
                </>
              ) : (
                <button
                  onClick={() => setEmergencyOpen(true)}
                  className="flex items-center gap-2 py-3 text-sm text-primary font-medium"
                >
                  <Shield className="size-4" />
                  Adicionar contato de emergência
                </button>
              )}
            </div>
          </TabsContent>

          {/* ── Tab: Acesso ──────────────────────────────────────────────── */}
          <TabsContent value="access" className="mt-0 flex-1">
            <AccessTab client={client} router={router} />
          </TabsContent>

          {/* ── Tab: Avaliações ──────────────────────────────────────────── */}
          <TabsContent value="assessments" className="mt-0 flex-1">
            <AssessmentsTab assessments={client.assessments} clientId={client.id} />
          </TabsContent>

          {/* ── Tab: Prescrições ─────────────────────────────────────────── */}
          <TabsContent value="prescriptions" className="mt-0 flex-1">
            <PrescriptionsTab prescriptions={client.prescriptions} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionHeader({
  title,
  onEdit,
  className,
}: {
  title: string;
  onEdit?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between pt-1 pb-1 border-b border-border mb-1", className)}>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </p>
      {onEdit && (
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-primary font-medium py-1 px-2 rounded-lg hover:bg-primary/10 transition-colors active:scale-95"
        >
          <Pencil className="size-3" />
          Editar
        </button>
      )}
    </div>
  );
}

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
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center justify-center size-9 rounded-lg bg-muted text-muted-foreground shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium truncate", value ? "text-foreground" : "text-muted-foreground/50 italic")}>
          {value || "Não informado"}
        </p>
      </div>
    </div>
  );
}

/**
 * Função auxiliar robusta para ler disponibilidade
 * Formatos suportados:
 * 1. Record<DayKey, { active: boolean, start: string, end: string }>
 * 2. null/undefined (sem disponibilidade configurada)
 *
 * Retorna um Set com os dias ativos
 */
function getActiveDays(availability: any): Set<string> {
  console.log("🔍 DEBUG DISPONIBILIDADE - Dados brutos:", availability);
  console.log("🔍 DEBUG DISPONIBILIDADE - Tipo:", typeof availability);

  if (!availability) {
    console.log("⚠️  Disponibilidade é null/undefined");
    return new Set();
  }

  const activeDays = new Set<string>();

  // ╔══════════════════════════════════════════════════════════════════╗
  // ║ FORMATO PADRÃO: Objeto { monday: { active: true, ... }, ... }  ║
  // ║ Lê cada dia e verifica se active === true                       ║
  // ╚══════════════════════════════════════════════════════════════════╝
  if (typeof availability === "object" && !Array.isArray(availability)) {
    const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    dayKeys.forEach((key) => {
      try {
        const dayData = availability[key];
        if (dayData && typeof dayData === "object" && dayData.active === true) {
          activeDays.add(key);
          console.log(`✅ Dia ${key} ATIVO (from active: true)`);
        } else {
          console.log(`❌ Dia ${key} inativo`);
        }
      } catch (e) {
        console.warn(`⚠️  Erro ao ler ${key}:`, e);
      }
    });
  }

  console.log("📊 RESULTADO FINAL - Dias ativos:", Array.from(activeDays));
  return activeDays;
}

/**
 * Renderização Dinâmica de Tags de Disponibilidade
 * À prova de balas com classes Tailwind LITERAIS (sem interpolação)
 * Source of Truth: availability
 */
function AvailabilityDisplay({ availability }: { availability: any }) {
  const DAYS = [
    { key: "monday", short: "Seg" },
    { key: "tuesday", short: "Ter" },
    { key: "wednesday", short: "Qua" },
    { key: "thursday", short: "Qui" },
    { key: "friday", short: "Sex" },
    { key: "saturday", short: "Sáb" },
    { key: "sunday", short: "Dom" },
  ];

  const activeDays = getActiveDays(availability);

  if (activeDays.size === 0) {
    return (
      <div className="py-3">
        <p className="text-xs text-muted-foreground">Nenhum dia disponível configurado</p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 py-3 flex-wrap">
      {DAYS.map(({ key, short }) => {
        const isActive = activeDays.has(key);

        // ╔════════════════════════════════════════════════════════════════╗
        // ║ Classes Tailwind LITERAIS (não interpoladas)                   ║
        // ║ Verifica em tempo de build (sem risco de perder classes)       ║
        // ╚════════════════════════════════════════════════════════════════╝
        if (isActive) {
          return (
            <span
              key={key}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground border border-primary/50 shadow-sm"
            >
              {short}
            </span>
          );
        } else {
          return (
            <span
              key={key}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground opacity-40 border border-border"
            >
              {short}
            </span>
          );
        }
      })}
    </div>
  );
}

function AccessTab({ client, router }: { client: any; router: any }) {
  const [password, setPassword] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  async function handleSavePassword() {
    if (password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    setSavingPwd(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error ?? `HTTP ${res.status}`);
      }
      toast.success("Senha definida com sucesso!");
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar senha.");
    } finally {
      setSavingPwd(false);
    }
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Toggle de conta */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Conta ativa</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permitir acesso ao sistema
            </p>
          </div>
          <Switch
            checked={client.status === "ACTIVE"}
            onCheckedChange={async (checked) => {
              const newStatus = checked ? "ACTIVE" : "INACTIVE";
              try {
                await fetch(`/api/clients/${client.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: newStatus }),
                });
                toast.success(checked ? "Acesso ativado" : "Acesso desativado");
                router.refresh();
              } catch {
                toast.error("Erro ao alterar status.");
              }
            }}
          />
        </div>
      </div>

      {/* Email de acesso */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium mb-1">Email de acesso</p>
        <p className="text-sm text-muted-foreground">{client.email ?? "Não configurado"}</p>
      </div>

      {/* Gerador de senha */}
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4">
        <p className="text-sm font-medium text-foreground">Senha de acesso</p>
        <PasswordGeneratorBlock value={password} onChange={setPassword} />
        {password.length >= 8 && (
          <Button
            size="sm"
            className="w-full h-11 mt-1"
            onClick={handleSavePassword}
            disabled={savingPwd}
          >
            {savingPwd ? "Salvando…" : "Salvar nova senha"}
          </Button>
        )}
      </div>

      {/* Cadastrado em */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium mb-1">Cadastrado em</p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(client.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </p>
      </div>
    </div>
  );
}

function AssessmentsTab({ assessments, clientId }: { assessments: any[]; clientId: string }) {
  if (assessments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 p-4">
        <div className="flex items-center justify-center size-16 rounded-full bg-muted">
          <ClipboardList className="size-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground text-center">Nenhuma avaliação realizada</p>
        <Link href={`/app/avaliacoes/nova?clientId=${clientId}`}>
          <Button variant="outline" size="sm">Criar avaliação</Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="p-4">
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
        {assessments.map((a, i) => (
          <Link
            key={a.id}
            href={`/app/avaliacoes/${a.id}`}
            className="flex items-center gap-3 px-4 py-3.5 bg-card active:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
              <span className="text-xs font-bold text-primary">{i + 1}ª</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{a.modality ?? a.population}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(a.createdAt), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs shrink-0",
                a.status === "COMPLETE" ? "bg-primary/10 text-primary" : "bg-accent text-muted-foreground"
              )}
            >
              {a.status === "COMPLETE" ? "Concluída" : "Pendente"}
            </Badge>
            <ChevronRight className="size-4 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function PrescriptionsTab({ prescriptions }: { prescriptions: any[] }) {
  if (prescriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="flex items-center justify-center size-16 rounded-full bg-muted">
          <Dumbbell className="size-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground text-center">Nenhuma prescrição cadastrada</p>
      </div>
    );
  }
  return (
    <div className="p-4">
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
        {prescriptions.map((p) => (
          <Link
            key={p.id}
            href={`/app/prescricoes/${p.id}`}
            className="flex items-center gap-3 px-4 py-3.5 bg-card active:bg-muted/50 transition-colors"
          >
            <div
              className={cn(
                "flex items-center justify-center size-10 rounded-lg shrink-0",
                p.type === "TRAINING" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"
              )}
            >
              <Dumbbell className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {p.type === "TRAINING" ? "Ficha de Treino" : "Prescrição Aeróbica"}
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
