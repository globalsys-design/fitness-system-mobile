"use client";

import { useState, useEffect } from "react";
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
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordGeneratorBlock } from "./PasswordGeneratorBlock";
import { Skeleton } from "@/components/ui/skeleton";
import {
  WeekdayStrip,
  WEEKDAYS_MON_FIRST,
} from "@/components/ui/weekday-strip";
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

        {/* Header — spell: conic rotating ring + presence dot + stats pills */}
        <DetailHeader
          name={client.name}
          photo={client.photo}
          isActive={client.status === "ACTIVE"}
          statusLabel={client.status === "ACTIVE" ? "Ativo" : "Inativo"}
          meta={[genderLabel, age !== null ? `${age} anos` : null]
            .filter(Boolean)
            .join(" • ")}
          stats={[
            { icon: ClipboardList, label: "aval.", value: client.assessments.length },
            { icon: Dumbbell, label: "pres.", value: client.prescriptions.length },
          ]}
          statusKey={client.status}
        />

        {/* Progressive Profiling Banner — spell: single bar + shimmer sweep + count-up */}
        {!isProfileComplete && (
          <ProfileCompletionBanner
            pct={completionPct}
            completed={completedCount}
            total={profileFields.length}
          />
        )}
        {isProfileComplete && (
          <div className="relative px-4 py-3 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border-b border-primary/20 flex items-center gap-2 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <CheckCircle2 className="size-5 text-primary shrink-0 animate-in zoom-in-50 duration-500 delay-150 fill-mode-both" />
            <p className="text-sm font-semibold text-primary">Perfil completo! 🎉</p>
          </div>
        )}

        {/* Tabs — spell: growing pill underline */}
        <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1">
          <div className="px-4 pt-3 border-b border-border bg-background sticky top-0 z-10">
            <TabsList className="w-full h-11 bg-transparent p-0 gap-0 relative">
              {["info", "access", "assessments", "prescriptions"].map((t) => (
                <TabsTrigger
                  key={t}
                  value={t}
                  className={cn(
                    "flex-1 text-xs rounded-none h-11 relative bg-transparent",
                    "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                    "data-[state=active]:text-primary text-muted-foreground",
                    "transition-colors duration-200",
                    // Pill underline que cresce de 0 → 28px ao ativar.
                    "after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2",
                    "after:h-[3px] after:w-0 after:rounded-t-full after:bg-primary",
                    "after:transition-[width,box-shadow] after:duration-300 after:ease-out",
                    "data-[state=active]:after:w-7 data-[state=active]:after:shadow-[0_0_10px_oklch(from_var(--color-primary)_l_c_h/0.5)]"
                  )}
                >
                  {t === "info" ? "Informações" : t === "access" ? "Acesso" : t === "assessments" ? "Avaliações" : "Prescrições"}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Tab: Informações ─────────────────────────────────────────── */}
          <TabsContent value="info" className="mt-0 flex-1 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-1 data-[state=active]:duration-300">
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
          <TabsContent value="access" className="mt-0 flex-1 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-1 data-[state=active]:duration-300">
            <AccessTab client={client} router={router} />
          </TabsContent>

          {/* ── Tab: Avaliações ──────────────────────────────────────────── */}
          <TabsContent value="assessments" className="mt-0 flex-1 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-1 data-[state=active]:duration-300">
            <AssessmentsTab assessments={client.assessments} clientId={client.id} />
          </TabsContent>

          {/* ── Tab: Prescrições ─────────────────────────────────────────── */}
          <TabsContent value="prescriptions" className="mt-0 flex-1 data-[state=active]:animate-in data-[state=active]:fade-in data-[state=active]:slide-in-from-right-1 data-[state=active]:duration-300">
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
        <EditIconButton onClick={onEdit} size="sm" label={`Editar ${title}`} />
      )}
    </div>
  );
}

/**
 * EditIconButton — padrão do sistema para botão de editar em telas de view.
 *
 * Spells:
 *  - Variante ghost + Pencil em primary.
 *  - Hover/active: rotate -12° + scale 1.1 ("scribble").
 *  - Fundo primary/10 no hover, scale-down no press.
 *
 * Variantes:
 *  - size="lg"  → 48x48px (header principal de entidade).
 *  - size="sm"  → 32x32px (section headers, repetição dentro da página).
 */
export function EditIconButton({
  onClick,
  label = "Editar",
  size = "lg",
  className,
}: {
  onClick: () => void;
  label?: string;
  size?: "lg" | "sm";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group/edit shrink-0 relative overflow-hidden inline-flex items-center justify-center",
        "rounded-lg border border-transparent outline-none",
        "transition-[transform,background-color] duration-200",
        "active:scale-[0.88] hover:bg-primary/10",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        size === "lg" ? "size-12" : "size-8",
        className
      )}
    >
      <Pencil
        className={cn(
          "text-primary transition-transform duration-300",
          "group-hover/edit:-rotate-12 group-active/edit:-rotate-12 group-active/edit:scale-110",
          size === "lg" ? "size-4" : "size-3.5"
        )}
      />
    </button>
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
  const filled = !!value;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
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
        <p className={cn("text-sm font-medium truncate", filled ? "text-foreground" : "text-muted-foreground/50 italic")}>
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
 * Disponibilidade do cliente usando o WeekdayStrip padrão do sistema.
 *
 * Source of truth é um objeto por dia: `{ active, start, end }`. Traduzimos
 * para a caption esperada pelo componente — mostra o horário `start–end`
 * quando informado; caso contrário o check "✓" indica que o dia está ativo.
 */
function AvailabilityDisplay({ availability }: { availability: any }) {
  const activeDays = getActiveDays(availability);

  if (activeDays.size === 0) {
    return (
      <div className="py-3">
        <p className="text-xs text-muted-foreground">Nenhum dia disponível configurado</p>
      </div>
    );
  }

  const days = WEEKDAYS_MON_FIRST.map((d) => {
    if (!activeDays.has(d.key)) {
      return { key: d.key, label: d.label, caption: null };
    }
    const dayData = availability?.[d.key];
    const start: string | undefined = dayData?.start;
    const end: string | undefined = dayData?.end;
    // Formata "HH:mm" para "HHh" quando minutos == 00, senão "HH:mm".
    const fmt = (t?: string) => {
      if (!t) return null;
      const [h, m] = t.split(":");
      return m === "00" ? `${parseInt(h, 10)}h` : t;
    };
    const a = fmt(start);
    const b = fmt(end);
    const caption = a && b ? `${a}-${b}` : a ?? b ?? "✓";
    return { key: d.key, label: d.label, caption };
  });

  return (
    <div className="py-3">
      <WeekdayStrip days={days} />
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
      <div
        className={cn(
          "rounded-xl border p-4 transition-[background-color,border-color] duration-300",
          client.status === "ACTIVE"
            ? "bg-primary/5 border-primary/30"
            : "bg-card border-border"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={cn(
                "text-sm font-medium transition-colors",
                client.status === "ACTIVE" && "text-primary"
              )}
            >
              Conta ativa
            </p>
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
            className="w-full h-11 mt-1 transition-transform duration-150 active:scale-[0.98] animate-in fade-in slide-in-from-bottom-1 duration-200"
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
      <div className="flex flex-col items-center justify-center py-12 gap-3 p-4 animate-in fade-in duration-500">
        <div className="flex items-center justify-center size-16 rounded-full bg-muted animate-in zoom-in-50 duration-500 fill-mode-both">
          <ClipboardList className="size-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground text-center">Nenhuma avaliação realizada</p>
        <Link href={`/app/avaliacoes/nova?clientId=${clientId}`}>
          <Button variant="outline" size="sm" className="transition-transform active:scale-[0.97]">Criar avaliação</Button>
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
            style={{ animationDelay: `${i * 50}ms` }}
            className="flex items-center gap-3 px-4 py-3.5 bg-card active:bg-muted/50 transition-colors animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both"
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
      <div className="flex flex-col items-center justify-center py-12 gap-3 animate-in fade-in duration-500">
        <div className="flex items-center justify-center size-16 rounded-full bg-muted animate-in zoom-in-50 duration-500 fill-mode-both">
          <Dumbbell className="size-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground text-center">Nenhuma prescrição cadastrada</p>
      </div>
    );
  }
  return (
    <div className="p-4">
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
        {prescriptions.map((p, i) => (
          <Link
            key={p.id}
            href={`/app/prescricoes/${p.id}`}
            style={{ animationDelay: `${i * 50}ms` }}
            className="flex items-center gap-3 px-4 py-3.5 bg-card active:bg-muted/50 transition-colors animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both"
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

/**
 * DetailHeader — hero compartilhado entre ClientDetail e AssistantDetail.
 *
 * Spells:
 *  - Conic rotating ring atrás do avatar quando ativo (24s, ease).
 *  - Presence dot pulsante dentro do badge Ativo (status "vivo").
 *  - Stats em pílulas soft com icon chip primary.
 *  - Nome + meta com slide-in em cascata.
 */
export function DetailHeader({
  name,
  photo,
  isActive,
  statusLabel,
  meta,
  stats,
  statusKey,
  onEdit,
  editLabel = "Editar",
}: {
  name: string;
  photo: string | null;
  isActive: boolean;
  statusLabel: string;
  meta?: string;
  stats?: Array<{ icon: React.ElementType; label: string; value: number | string }>;
  statusKey: string;
  onEdit?: () => void;
  editLabel?: string;
}) {
  return (
    <div className="relative flex items-center gap-4 px-4 py-5 border-b border-border bg-card overflow-hidden">
      {/* Aurora radial sutilíssima no canto do avatar quando ativo */}
      {isActive && (
        <div
          aria-hidden
          className="pointer-events-none absolute -left-8 -top-8 size-40 opacity-40"
          style={{
            background:
              "radial-gradient(circle, oklch(from var(--color-primary) l c h / 0.18) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Avatar com conic rotating ring quando ativo */}
      <div className="relative shrink-0">
        {isActive && (
          <div
            aria-hidden
            className="absolute inset-0 -m-1 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, oklch(from var(--color-primary) l c h / 0.7), oklch(from var(--color-primary) l c h / 0.1), oklch(from var(--color-primary) l c h / 0.7))",
              animation: "detail-avatar-ring 6s linear infinite",
              padding: "2px",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
        )}
        <Avatar
          className={cn(
            "size-16 relative transition-shadow duration-500",
            isActive && "ring-offset-2 ring-offset-background"
          )}
        >
          <AvatarImage src={photo ?? undefined} />
          <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
            {name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 min-w-0 relative">
        <div className="flex items-center gap-2">
          <h2
            className="text-lg font-bold text-foreground truncate animate-in fade-in slide-in-from-left-2 duration-500"
            style={{ animationFillMode: "both" }}
          >
            {name}
          </h2>
          <Badge
            key={statusKey}
            variant="secondary"
            className={cn(
              "text-xs shrink-0 pl-1.5 gap-1 animate-in zoom-in-95 fade-in duration-300",
              isActive
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted text-muted-foreground"
            )}
          >
            {/* Presence dot — pulsa quando ativo */}
            <span
              aria-hidden
              className={cn(
                "relative size-1.5 rounded-full",
                isActive ? "bg-primary" : "bg-muted-foreground/40"
              )}
            >
              {isActive && (
                <span
                  className="absolute inset-0 rounded-full bg-primary"
                  style={{
                    animation: "presence-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite",
                  }}
                />
              )}
            </span>
            {statusLabel}
          </Badge>
        </div>

        {meta && (
          <p
            className="text-sm text-muted-foreground mt-0.5 animate-in fade-in slide-in-from-left-2 duration-500 fill-mode-both"
            style={{ animationDelay: "60ms" }}
          >
            {meta}
          </p>
        )}

        {stats && stats.length > 0 && (
          <div
            className="flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-left-2 duration-500 fill-mode-both"
            style={{ animationDelay: "120ms" }}
          >
            {stats.map((s, i) => (
              <span
                key={i}
                className={cn(
                  "inline-flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full",
                  "bg-muted/60 border border-border text-[11px] font-semibold text-foreground"
                )}
              >
                <span className="flex items-center justify-center size-5 rounded-full bg-primary/15 text-primary">
                  <s.icon className="size-3" />
                </span>
                <span className="tabular-nums">{s.value}</span>
                <span className="text-muted-foreground">{s.label}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Edit button — padrão do sistema (pencil ghost + scribble spell) */}
      {onEdit && <EditIconButton onClick={onEdit} label={editLabel} />}

      <style>{`
        @keyframes detail-avatar-ring {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes presence-ping {
          0% { transform: scale(1); opacity: 0.8; }
          80%, 100% { transform: scale(2.4); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="detail-avatar-ring"], [style*="presence-ping"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * ProfileCompletionBanner — barra de progresso de perfil.
 *
 * Spells:
 *  - Barra única (fix do bug de duplicação — não usa o wrapper Progress).
 *  - Fill animado 0 → pct no mount.
 *  - Shimmer sweep atravessando a barra em loop.
 *  - Contador animado count-up sincronizado com o fill.
 *  - Sparkle twinkle quando pct >= 80.
 *  - Ring circular mini ao lado do número.
 */
function ProfileCompletionBanner({
  pct,
  completed,
  total,
}: {
  pct: number;
  completed: number;
  total: number;
}) {
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    // Defer por 1 tick para o transition-[width] pegar a mudança.
    const t = setTimeout(() => setAnimatedPct(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);

  const almostThere = pct >= 80;

  // Ring circular: circunferência para um círculo r=10.
  const R = 10;
  const C = 2 * Math.PI * R;
  const dash = (animatedPct / 100) * C;

  return (
    <div className="relative px-4 py-3 bg-primary/10 border-b border-primary/20 animate-in fade-in slide-in-from-top-2 duration-500 overflow-hidden">
      <div className="flex items-center gap-3">
        {/* Mini circular ring */}
        <div className="relative shrink-0 size-7">
          <svg viewBox="0 0 24 24" className="absolute inset-0 -rotate-90">
            <circle
              cx="12"
              cy="12"
              r={R}
              className="fill-none stroke-primary/20"
              strokeWidth="3"
            />
            <circle
              cx="12"
              cy="12"
              r={R}
              className="fill-none stroke-primary"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C - dash}
              style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)" }}
            />
          </svg>
          {almostThere && (
            <Sparkles
              className="absolute -top-1 -right-1 size-3 text-primary"
              style={{ animation: "twinkle 2.4s ease-in-out infinite" }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-foreground">Completar perfil</p>
            <CountUp target={pct} className="text-xs font-semibold text-primary tabular-nums" suffix="%" />
          </div>

          {/* Barra única com shimmer sweep */}
          <div
            className="relative mt-2 h-1.5 rounded-full bg-primary/15 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label={`Perfil ${pct}% completo`}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${animatedPct}%`,
                background:
                  "linear-gradient(90deg, oklch(from var(--color-primary) l c h / 0.85), var(--color-primary))",
                transition: "width 900ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {/* Shimmer sweep — loop subtil */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                  animation: "shimmer-sweep 2.4s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        {completed} de {total} informações preenchidas — toque em Editar para completar
      </p>

      <style>{`
        @keyframes shimmer-sweep {
          0% { transform: translateX(-100%); }
          60%, 100% { transform: translateX(250%); }
        }
        @keyframes twinkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
          50% { transform: scale(1.25) rotate(18deg); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="shimmer-sweep"], [style*="twinkle"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/** Count-up simples (setState em rAF) — evita lib. */
function CountUp({
  target,
  className,
  suffix = "",
  duration = 900,
}: {
  target: number;
  className?: string;
  suffix?: string;
  duration?: number;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min(1, (ts - start) / duration);
      // ease-out-quint
      const eased = 1 - Math.pow(1 - progress, 5);
      setV(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return (
    <span className={className}>
      {v}
      {suffix}
    </span>
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
