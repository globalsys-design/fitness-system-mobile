import Image from "next/image";
import Link from "next/link";
import {
  Users,
  UserCheck,
  ClipboardList,
  Dumbbell,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WeeklyAgendaClient } from "./weekly-agenda-client";

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

/* ── Component ─────────────────────────────────────────────────────────── */

export function DashboardProfessional({
  professional,
  todayEvents,
}: DashboardProfessionalProps) {
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
      valueColor: "text-foreground",
    },
    {
      label: "Avaliações",
      value: professional._count.assessments,
      icon: ClipboardList,
      href: "/app/avaliacoes",
      valueColor: "text-foreground",
    },
    {
      label: "Prescrições",
      value: professional._count.prescriptions,
      icon: Dumbbell,
      href: "/app/prescricoes",
      valueColor: "text-foreground",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* ───────────────────────────────────────────────────────────
          WEEKLY AGENDA — Client Component (Interactive Calendar)
         ─────────────────────────────────────────────────────────── */}
      <WeeklyAgendaClient initialEvents={todayEvents} />

      {/* ═══════════════════════════════════════════════════════════════════
          MÉTRICAS DO ECOSSISTEMA — Semantic bg, adaptive cards
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-muted dark:bg-secondary px-5 pt-6 pb-6 flex flex-col gap-3">
        <h3 className="text-xl font-bold text-foreground">
          Métricas do Ecossistema
        </h3>

        {/* Large metric — Portfolio value */}
        <div className="bg-card border border-border flex items-center justify-between p-4 rounded-xl h-[108px] shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-muted-foreground">
              Valor Total do Portfólio
            </span>
            <span className="text-[30px] font-extrabold leading-9 text-foreground tabular-nums">
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
                <div className="bg-card border border-border flex flex-col gap-1.5 p-3 rounded-xl active:scale-[0.97] transition-all shadow-sm">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.5px]">
                    {kpi.label}
                  </span>
                  <div className="flex items-end justify-between pr-1">
                    <span
                      className={cn(
                        "text-[30px] font-semibold leading-9 tabular-nums",
                        kpi.valueColor
                      )}
                    >
                      {String(kpi.value).padStart(2, "0")}
                    </span>
                    <Icon className="size-5 text-muted-foreground/50" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA — Primeira Avaliação (Liquid Glass + Figma gradient overlay)
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-muted dark:bg-secondary px-5 pb-8">
        <Link href="/app/avaliacoes/nova">
          <div
            className={cn(
              "relative overflow-hidden rounded-xl h-[160px]",
              "active:scale-[0.98] transition-all",
              "bg-secondary" /* fallback while image loads */
            )}
          >
            {/* ── Athlete background image (Figma node 48:1043) ── */}
            <Image
              src="/images/cta-athletes.png"
              alt="Atletas em treino funcional"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 400px"
              priority={false}
            />

            {/* ── Figma overlay: gradient bottom→top (node 1:163) ── */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(42,52,57,0.9) 0%, rgba(42,52,57,0.3) 50%, rgba(42,52,57,0) 100%)",
              }}
            />

            {/* ── Liquid glass chip: RECOMENDADO (always on dark gradient) ── */}
            <div className="absolute top-3 right-3">
              <span className="glass-on-dark inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wide">
                <Sparkles className="size-3" />
                Recomendado
              </span>
            </div>

            {/* ── Content — pinned to bottom ── */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xl font-extrabold text-white tracking-tight leading-none">
                  1ª AVALIAÇÃO
                </h3>
                <p className="text-xs text-white/60">
                  Para situar a ordem temporal na listagem
                </p>
              </div>
              <div className="glass-on-dark rounded-xl p-2.5 shrink-0">
                <ChevronRight className="size-4 text-white" />
              </div>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
