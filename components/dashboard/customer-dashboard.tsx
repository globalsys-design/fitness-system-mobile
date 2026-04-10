"use client";

import { Dumbbell, CalendarDays, TrendingUp, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerDashboardProps {
  clientName: string;
  professionalName: string | null;
  totalPrescriptions: number;
  totalAssessments: number;
  latestPrescription: {
    id: string;
    type: string;
    createdAt: string;
  } | null;
}

export function CustomerDashboard({
  clientName,
  professionalName,
  totalPrescriptions,
  totalAssessments,
  latestPrescription,
}: CustomerDashboardProps) {
  const firstName = clientName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* ── Greeting ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{greeting}</p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Ola, {firstName}
        </h1>
        {professionalName && (
          <p className="text-xs text-muted-foreground mt-1">
            Profissional: <span className="font-medium text-foreground">{professionalName}</span>
          </p>
        )}
      </div>

      {/* ── Hero Card: Treino do Dia ──────────────────────────────────── */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl",
          "aspect-[4/3] w-full",
          "flex flex-col justify-end p-6",
          latestPrescription
            ? "bg-gradient-to-br from-primary/90 to-primary/60"
            : "bg-gradient-to-br from-muted to-muted/80"
        )}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8">
            <Dumbbell className="size-48 rotate-12 text-foreground" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-3">
          {latestPrescription ? (
            <>
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary-foreground/70" />
                <span className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wide">
                  Treino disponivel
                </span>
              </div>
              <h2 className="text-2xl font-bold text-primary-foreground leading-tight">
                {latestPrescription.type === "TRAINING"
                  ? "Treino de Forca"
                  : "Treino Aerobico"}
              </h2>
              <button
                type="button"
                className={cn(
                  "w-full h-14 rounded-full font-bold text-lg mt-2",
                  "bg-background text-foreground",
                  "active:scale-[0.97] transition-all duration-200",
                  "shadow-lg"
                )}
              >
                Iniciar Treino
              </button>
            </>
          ) : (
            <>
              <Dumbbell className="size-10 text-muted-foreground/50" />
              <h2 className="text-xl font-bold text-muted-foreground leading-tight">
                Nenhum treino ainda
              </h2>
              <p className="text-sm text-muted-foreground/70">
                Seu profissional ainda nao criou uma prescricao
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2 p-4 rounded-2xl border border-border bg-card">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Dumbbell className="size-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{totalPrescriptions}</p>
          <p className="text-xs text-muted-foreground">Prescricoes</p>
        </div>
        <div className="flex flex-col gap-2 p-4 rounded-2xl border border-border bg-card">
          <div className="size-10 rounded-xl bg-info/10 flex items-center justify-center">
            <TrendingUp className="size-5 text-info" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{totalAssessments}</p>
          <p className="text-xs text-muted-foreground">Avaliacoes</p>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Acesso rapido
        </h3>
        {[
          { label: "Minhas Prescricoes", href: "/app/fichas", icon: Dumbbell, color: "text-primary bg-primary/10" },
          { label: "Meu Progresso", href: "/app/progresso", icon: TrendingUp, color: "text-info bg-info/10" },
        ].map((action) => (
          <a
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card active:bg-accent transition-colors"
          >
            <div className={cn("size-10 rounded-xl flex items-center justify-center", action.color)}>
              <action.icon className="size-5" />
            </div>
            <span className="flex-1 font-medium text-foreground text-sm">{action.label}</span>
            <ChevronRight className="size-5 text-muted-foreground" />
          </a>
        ))}
      </div>
    </div>
  );
}
