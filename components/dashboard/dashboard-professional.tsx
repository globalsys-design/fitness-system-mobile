"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  ClipboardList,
  Dumbbell,
  CalendarClock,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────────────────────── */

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  startAt: string;
  endAt: string;
  client: { name: string } | null;
}

interface DashboardProfessionalProps {
  professional: {
    id: string;
    name: string | null;
    photo: string | null;
    specialty: string | null;
    _count: {
      clients: number;
      assistants: number;
      assessments: number;
      prescriptions: number;
    };
  };
  todayEvents: CalendarEvent[];
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

function formatDateLong(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

/** Build 7-day window centered on today */
function buildWeekDays(): { date: Date; label: string; dayNum: number; isToday: boolean }[] {
  const today = new Date();
  const days: { date: Date; label: string; dayNum: number; isToday: boolean }[] = [];
  const weekdayShort = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    days.push({
      date: d,
      label: weekdayShort[d.getDay()],
      dayNum: d.getDate(),
      isToday: offset === 0,
    });
  }
  return days;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Component ─────────────────────────────────────────────────────────── */

export function DashboardProfessional({
  professional,
  todayEvents,
}: DashboardProfessionalProps) {
  const firstName = professional.name?.split(" ")[0] ?? "Profissional";
  const greeting = getGreeting();
  const dateLabel = formatDateLong();
  const weekDays = useMemo(() => buildWeekDays(), []);

  const kpis = [
    {
      label: "Clientes",
      value: professional._count.clients,
      icon: Users,
      href: "/app/usuarios?tab=clientes",
      valueColor: "text-primary",
    },
    {
      label: "Assistentes",
      value: professional._count.assistants,
      icon: UserCheck,
      href: "/app/usuarios?tab=assistentes",
      valueColor: "text-primary-foreground",
    },
    {
      label: "Avaliações",
      value: professional._count.assessments,
      icon: ClipboardList,
      href: "/app/avaliacoes",
      valueColor: "text-primary-foreground",
    },
    {
      label: "Prescrições",
      value: professional._count.prescriptions,
      icon: Dumbbell,
      href: "/app/prescricoes",
      valueColor: "text-primary-foreground",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION — Gradient + Calendar Strip + Agenda
         ═══════════════════════════════════════════════════════════════════ */}
      <section
        className={cn(
          "relative overflow-hidden rounded-b-[1.5rem]",
          "bg-gradient-to-br from-secondary via-primary/80 to-primary",
          "px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-6"
        )}
      >
        {/* ── Header: Brand + Status ─────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xs font-bold tracking-[0.2em] uppercase text-white/60">
            FITNESS SYSTEM
          </h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-success/20 text-success uppercase tracking-wide">
            <span className="size-1.5 rounded-full bg-success" />
            Ativo
          </span>
        </div>

        {/* ── Greeting ───────────────────────────────────────────────── */}
        <div className="mb-5">
          <p className="text-sm text-white/60">{greeting}</p>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {firstName} <span className="inline-block">👋</span>
          </h2>
          <p className="text-xs text-white/50 mt-0.5 capitalize">{dateLabel}</p>
        </div>

        {/* ── Weekly Calendar Strip ──────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto mb-5" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
          {weekDays.map((day) => (
            <button
              key={day.dayNum}
              type="button"
              className={cn(
                "flex flex-col items-center gap-0.5 min-w-[3rem] py-2 px-1 rounded-2xl transition-all",
                day.isToday
                  ? "bg-white text-secondary shadow-lg border border-info/30"
                  : "text-white/60"
              )}
            >
              <span className="text-[10px] font-semibold uppercase">{day.label}</span>
              <span className={cn(
                "text-lg font-bold leading-none",
                day.isToday ? "text-secondary" : "text-white"
              )}>
                {day.dayNum}
              </span>
            </button>
          ))}
        </div>

        {/* ── Agenda do Dia ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide">
            Agenda de hoje
          </h3>

          {todayEvents.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <CalendarClock className="size-5 text-white/40 shrink-0" />
              <p className="text-sm text-white/50">Nenhum compromisso hoje</p>
            </div>
          ) : (
            todayEvents.slice(0, 3).map((event, idx) => (
              <div
                key={event.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all",
                  idx === 0
                    ? "bg-white/90 text-secondary border-white/20 shadow-sm"
                    : "bg-white/10 text-white backdrop-blur-sm border-white/10"
                )}
              >
                {/* Time */}
                <div className="flex flex-col items-center shrink-0 min-w-[2.5rem]">
                  <span className={cn(
                    "text-xs font-bold",
                    idx === 0 ? "text-secondary" : "text-white/80"
                  )}>
                    {formatTime(event.startAt)}
                  </span>
                </div>

                {/* Divider */}
                <div className={cn(
                  "w-px h-8 rounded-full",
                  idx === 0 ? "bg-primary/30" : "bg-white/20"
                )} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-semibold truncate",
                    idx === 0 ? "text-secondary" : "text-white"
                  )}>
                    {event.title}
                  </p>
                  {event.client && (
                    <p className={cn(
                      "text-xs truncate",
                      idx === 0 ? "text-secondary/60" : "text-white/50"
                    )}>
                      {event.client.name}
                    </p>
                  )}
                </div>

                {/* Type badge */}
                <span className={cn(
                  "shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase",
                  event.type === "ASSESSMENT"
                    ? idx === 0 ? "bg-primary/10 text-primary" : "bg-primary/20 text-primary-foreground"
                    : idx === 0 ? "bg-warning/10 text-warning" : "bg-warning/20 text-primary-foreground"
                )}>
                  {event.type === "ASSESSMENT" ? "Aval." : "Treino"}
                </span>
              </div>
            ))
          )}

          {todayEvents.length > 3 && (
            <Link
              href="/app/mais/agenda"
              className="text-xs text-white/50 text-center py-1 hover:text-white/70 transition-colors"
            >
              +{todayEvents.length - 3} compromissos • Ver agenda completa
            </Link>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MÉTRICAS DO ECOSSISTEMA — Dark section, glass cards
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-secondary px-5 pt-6 pb-6 flex flex-col gap-3">
        <h3 className="text-xl font-bold text-primary-foreground">
          Métricas do Ecossistema
        </h3>

        {/* Large metric — Portfolio value */}
        <div className="glass-effect flex items-center justify-between p-4 rounded-xl h-[108px]">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-primary-foreground">
              Valor Total do Portfólio
            </span>
            <span className="text-[30px] font-extrabold leading-9 text-primary-foreground tabular-nums">
              —
            </span>
          </div>
          <div className="size-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
            <TrendingUp className="size-5 text-success" />
          </div>
        </div>

        {/* 2×2 KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Link key={kpi.label} href={kpi.href}>
                <div className="glass-effect flex flex-col gap-1.5 p-3 rounded-xl active:scale-[0.97] transition-all shadow-[0_8px_24px_-10px_rgba(42,52,57,0.06)]">
                  <span className="text-[10px] font-semibold text-primary-foreground uppercase tracking-[0.5px]">
                    {kpi.label}
                  </span>
                  <div className="flex items-end justify-between pr-1">
                    <span className={cn(
                      "text-[30px] font-semibold leading-9 tabular-nums",
                      kpi.valueColor
                    )}>
                      {String(kpi.value).padStart(2, "0")}
                    </span>
                    <Icon className="size-5 text-primary-foreground/40" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA — Primeira Avaliação
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-secondary px-5 pb-8">
        <Link href="/app/avaliacoes/nova">
          <div className={cn(
            "relative overflow-hidden rounded-2xl p-5",
            "bg-gradient-to-br from-primary/90 to-primary",
            "active:scale-[0.98] transition-all"
          )}>
            {/* Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wide mb-3">
              <Sparkles className="size-3" />
              Recomendado
            </span>

            <h3 className="text-lg font-bold text-white mb-1">1ª Avaliação</h3>
            <p className="text-sm text-white/70 mb-3">
              Inicie uma avaliação completa para seu cliente
            </p>

            <div className="flex items-center gap-1 text-sm font-semibold text-white">
              Começar agora
              <ChevronRight className="size-4" />
            </div>

            {/* Decorative icon */}
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <ClipboardList className="size-32 rotate-12" />
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
