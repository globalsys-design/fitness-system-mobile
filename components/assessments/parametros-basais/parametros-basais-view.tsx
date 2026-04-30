"use client";

/**
 * ParametrosBasaisView — modo leitura dos parâmetros basais (padrão único).
 *
 * Mantém a família visual de Coronário/Framingham/Avançado/Completo/PARQ+:
 *   • Hero "Vital Ring 144px" com % de parâmetros normais
 *   • Anéis decorativos rotacionando + aura heartbeat
 *   • ECG signature + constelação de partículas
 *   • Risk meter 3 segmentos (Normal / Atenção / Crítico)
 *   • Stats strip — contagem por zona (Normais / Alterados / Críticos)
 *   • Card combinado de pressão arterial (PAS + PAD)
 *   • Lista de cada parâmetro com valor, zona e referência
 *   • Drawer explicativo das faixas
 *   • CTA único "Editar parâmetros" + FAB "Nova medição"
 */

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Eye,
  HelpCircle,
  HeartPulse,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { FAB } from "@/components/mobile/fab";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import {
  BASAL_PARAMS,
  BASAL_TONE_CLASSES,
  classifyBloodPressure,
  parseBasalNumber,
  summarizeBasal,
  zoneFor,
  type BasalParam,
  type BasalRiskLevel,
  type BasalTone,
  type BasalValues,
} from "@/lib/data/parametros-basais";

interface ParametrosBasaisViewProps {
  values: BasalValues;
  completedAt?: string | null;
  onEdit: () => void;
  onStartNew: () => void;
}

export function ParametrosBasaisView({
  values,
  completedAt,
  onEdit,
  onStartNew,
}: ParametrosBasaisViewProps) {
  const [explainerOpen, setExplainerOpen] = useState(false);
  const completedDate = completedAt ? new Date(completedAt) : null;

  const summary = useMemo(() => summarizeBasal(values), [values]);

  /* Linhas para a lista de parâmetros */
  const rows = useMemo(() => {
    return BASAL_PARAMS.map((p) => {
      const numeric = parseBasalNumber(values[p.key] ?? "");
      const zone = numeric != null ? zoneFor(numeric, p.zones) : null;
      return { param: p, numeric, zone };
    });
  }, [values]);

  /* BP combinada */
  const systolic = parseBasalNumber(values.systolic ?? "");
  const diastolic = parseBasalNumber(values.diastolic ?? "");
  const bp = classifyBloodPressure(systolic, diastolic);

  return (
    <div className="relative pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <style>{SPELLS_CSS}</style>

      <div className="px-4 py-4 space-y-4">
        {/* Hero */}
        <HeroBasalCard
          riskLevel={summary.riskLevel}
          filled={summary.filled}
          total={summary.total}
          byTone={summary.byTone}
          onOpenExplainer={() => setExplainerOpen(true)}
        />

        {/* Stats strip */}
        <StatsStrip
          normal={summary.byTone.ok + summary.byTone.low}
          warn={summary.byTone.warn}
          bad={summary.byTone.bad}
        />

        {/* Timestamp */}
        {completedDate && (
          <section
            className="spell-slide-up flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5"
            style={{ animationDelay: "120ms" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Activity className="h-3.5 w-3.5 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground truncate">
                {summary.filled}/{summary.total} parâmetros medidos
              </p>
            </div>
            <p className="text-xs font-semibold text-foreground tabular-nums">
              {completedDate.toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </section>
        )}

        {/* Card combinado PA — quando ambos preenchidos */}
        {bp && systolic != null && diastolic != null && (
          <section
            className="spell-slide-up rounded-2xl border border-border bg-card p-4 space-y-2"
            style={{ animationDelay: "140ms" }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Pressão Arterial
                </h3>
              </div>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
                  BASAL_TONE_CLASSES[bp.tone].bg,
                  BASAL_TONE_CLASSES[bp.tone].text
                )}
              >
                {bp.label}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums text-foreground">
                <CountUp value={systolic} />
                <span className="text-muted-foreground/50 mx-1">/</span>
                <CountUp value={diastolic} />
              </span>
              <span className="text-xs text-muted-foreground">mmHg</span>
            </div>
          </section>
        )}

        {/* Lista de parâmetros */}
        <section
          className="spell-slide-up rounded-2xl border border-border bg-card overflow-hidden"
          style={{ animationDelay: "180ms" }}
        >
          <div className="px-4 py-3 border-b border-border/60">
            <h3 className="text-sm font-semibold text-foreground">
              Parâmetros medidos
            </h3>
          </div>
          <div className="divide-y divide-border/60">
            {rows.map((row, i) => (
              <ParamRow
                key={row.param.key}
                index={i}
                param={row.param}
                numeric={row.numeric}
                zone={row.zone}
              />
            ))}
          </div>
        </section>

        {/* CTA secundário */}
        <div
          className="spell-slide-up grid grid-cols-1 gap-2"
          style={{ animationDelay: "260ms" }}
        >
          <SecondaryAction
            icon={Pencil}
            label="Editar parâmetros"
            onClick={onEdit}
          />
        </div>
      </div>

      {/* FAB */}
      <FAB
        icon={Plus}
        onClick={onStartNew}
        label="Nova medição de parâmetros basais"
      />

      {/* Drawer */}
      <RiskExplainerSheet
        open={explainerOpen}
        onOpenChange={setExplainerOpen}
        currentLevel={summary.riskLevel}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Hero
 * ────────────────────────────────────────────────────────────────────── */

function HeroBasalCard({
  riskLevel,
  filled,
  total,
  byTone,
  onOpenExplainer,
}: {
  riskLevel: BasalRiskLevel;
  filled: number;
  total: number;
  byTone: Record<BasalTone, number>;
  onOpenExplainer: () => void;
}) {
  const config = {
    "all-pending": {
      Icon: HelpCircle,
      label: "Sem Medições",
      desc: "Nenhum parâmetro foi medido ainda. Edite para iniciar a coleta.",
      tone: "text-muted-foreground",
      bg: "from-muted/30 via-muted/10 to-transparent",
      ring: "ring-border/40",
      aura: "bg-muted-foreground/20",
      ecg: "text-muted-foreground",
      arc: "var(--color-muted-foreground)",
      gaugeIdx: -1,
    },
    "all-normal": {
      Icon: ShieldCheck,
      label: "Parâmetros Dentro do Normal",
      desc: "Todos os sinais vitais medidos estão dentro das faixas de referência.",
      tone: "text-primary",
      bg: "from-primary/10 via-primary/5 to-transparent",
      ring: "ring-primary/25",
      aura: "bg-primary/30",
      ecg: "text-primary",
      arc: "var(--color-primary)",
      gaugeIdx: 0,
    },
    warn: {
      Icon: Shield,
      label: "Atenção em Parâmetros",
      desc: "Um ou mais parâmetros estão fora da faixa ideal. Revise antes de prescrever atividade.",
      tone: "text-amber-500 dark:text-amber-300",
      bg: "from-amber-500/15 via-amber-500/5 to-transparent",
      ring: "ring-amber-500/25",
      aura: "bg-amber-500/30",
      ecg: "text-amber-500 dark:text-amber-300",
      arc: "oklch(0.75 0.15 70)",
      gaugeIdx: 1,
    },
    bad: {
      Icon: AlertTriangle,
      label: "Parâmetros Críticos",
      desc: "Há parâmetros em zona crítica. Encaminhamento médico antes de qualquer atividade física.",
      tone: "text-destructive",
      bg: "from-destructive/15 via-destructive/5 to-transparent",
      ring: "ring-destructive/25",
      aura: "bg-destructive/30",
      ecg: "text-destructive",
      arc: "var(--color-destructive)",
      gaugeIdx: 2,
    },
  }[riskLevel];

  const totalAlterados = byTone.warn + byTone.bad;

  return (
    <section
      className={cn(
        "spell-slide-up relative overflow-hidden rounded-2xl border p-5",
        "bg-gradient-to-br border-border/60",
        config.bg
      )}
      role="status"
      aria-live="polite"
      style={{ animationDelay: "0ms" }}
    >
      <ParticleField className={config.tone} />
      <EcgLine className={config.ecg} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative flex flex-col items-center gap-3 pt-1">
        <VitalRing
          filled={filled}
          total={total}
          color={config.arc}
          toneClass={config.tone}
          auraClass={config.aura}
          ringClass={config.ring}
        >
          <Activity
            aria-hidden
            className={cn("h-3.5 w-3.5 spell-icon-in", config.tone)}
          />
        </VitalRing>

        <div className="flex items-center gap-2 mt-1">
          <p
            className={cn(
              "text-[11px] font-bold uppercase tracking-widest",
              config.tone
            )}
          >
            {config.label}
          </p>
          <button
            type="button"
            onClick={onOpenExplainer}
            className={cn(
              "inline-flex items-center justify-center w-5 h-5 rounded-full",
              "bg-background/60 ring-1 ring-border/60 hover:bg-background",
              "active:scale-90 transition-transform"
            )}
            aria-label="Entender as faixas"
          >
            <HelpCircle className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>

        <p className="text-xs text-center text-muted-foreground leading-relaxed max-w-md">
          {config.desc}
        </p>
      </div>

      {/* Risk meter — 3 segmentos */}
      {riskLevel !== "all-pending" && (
        <div className="relative mt-5">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((idx) => (
              <GaugeSegment
                key={idx}
                active={config.gaugeIdx >= idx}
                current={config.gaugeIdx === idx}
                tone={
                  idx === 0 ? "primary" : idx === 1 ? "amber" : "destructive"
                }
              />
            ))}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
            <span className={cn(config.gaugeIdx === 0 && "text-primary")}>
              Normal
            </span>
            <span
              className={cn(
                config.gaugeIdx === 1 && "text-amber-500 dark:text-amber-300"
              )}
            >
              Atenção
            </span>
            <span className={cn(config.gaugeIdx === 2 && "text-destructive")}>
              Crítico
            </span>
          </div>
        </div>
      )}

      <div className="relative mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <HeartPulse className="h-3 w-3 text-destructive/70" />
          Parâmetros alterados
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground/90 tabular-nums">
          <TrendingUp className="h-3 w-3" />
          <CountUp value={totalAlterados} /> de {filled}
        </span>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * VitalRing
 * ────────────────────────────────────────────────────────────────────── */

function VitalRing({
  filled,
  total,
  color,
  toneClass,
  auraClass,
  ringClass,
  children,
}: {
  filled: number;
  total: number;
  color: string;
  toneClass: string;
  auraClass: string;
  ringClass: string;
  children?: React.ReactNode;
}) {
  const size = 144;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? filled / total : 0;

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return setProgress(pct);
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return setProgress(pct);
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased * pct);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-full blur-2xl spell-heartbeat",
          auraClass
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-full spell-rotate-slow",
          "border border-dashed",
          ringClass.replace("ring-", "border-")
        )}
        style={{ borderColor: "currentColor", color: color }}
      />
      <span
        aria-hidden
        className="absolute inset-2 rounded-full spell-rotate-fast-rev opacity-30"
        style={{
          borderTop: `1px solid ${color}`,
          borderRight: `1px solid transparent`,
          borderBottom: `1px solid transparent`,
          borderLeft: `1px solid ${color}`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 backdrop-blur ring-1 ring-border/60">
        <svg
          width={size}
          height={size}
          className="absolute inset-0 -rotate-90"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted opacity-30"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className={cn("flex items-baseline", toneClass)}>
            <span className="text-5xl font-bold tabular-nums leading-none tracking-tight spell-icon-in">
              <CountUp value={filled} />
            </span>
            <span className="text-xl font-bold ml-1 opacity-60">/{total}</span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
            {children}
            <span>parâmetros</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * StatsStrip
 * ────────────────────────────────────────────────────────────────────── */

function StatsStrip({
  normal,
  warn,
  bad,
}: {
  normal: number;
  warn: number;
  bad: number;
}) {
  return (
    <div
      className="spell-slide-up grid grid-cols-3 gap-2"
      style={{ animationDelay: "60ms" }}
    >
      <StatChip label="Normais" value={normal} tone="primary" />
      <StatChip label="Alterados" value={warn} tone="amber" />
      <StatChip label="Críticos" value={bad} tone="destructive" />
    </div>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "amber" | "destructive";
}) {
  const cls = {
    primary: "text-primary border-primary/20 bg-primary/5",
    amber:
      "text-amber-600 dark:text-amber-300 border-amber-500/20 bg-amber-500/5",
    destructive: "text-destructive border-destructive/20 bg-destructive/5",
  }[tone];
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5 flex flex-col items-start gap-0.5",
        cls
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
        {label}
      </span>
      <span className="text-xl font-bold tabular-nums leading-none">
        <CountUp value={value} />
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * ParamRow — uma linha por parâmetro com valor + zona + referência
 * ────────────────────────────────────────────────────────────────────── */

function ParamRow({
  index,
  param,
  numeric,
  zone,
}: {
  index: number;
  param: BasalParam;
  numeric: number | null;
  zone: ReturnType<typeof zoneFor>;
}) {
  const Icon = param.icon;
  const toneCls = zone ? BASAL_TONE_CLASSES[zone.tone] : null;
  const sideCls =
    zone?.tone === "bad"
      ? "before:bg-destructive"
      : zone?.tone === "warn"
        ? "before:bg-orange-500"
        : zone?.tone === "ok"
          ? "before:bg-success"
          : zone?.tone === "low"
            ? "before:bg-info"
            : "before:bg-border";

  const decimals = param.decimals ?? 0;
  const formatted =
    numeric != null
      ? decimals > 0
        ? numeric.toFixed(decimals).replace(".", ",")
        : String(numeric)
      : "—";

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 px-4 py-3.5",
        "before:content-[''] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-0.5 before:rounded-r-full",
        sideCls,
        "spell-slide-up"
      )}
      style={{ animationDelay: `${200 + index * 30}ms` }}
    >
      <div
        className={cn(
          "flex items-center justify-center size-9 rounded-xl shrink-0",
          param.iconBg
        )}
        aria-hidden
      >
        <Icon className={cn("h-4 w-4", param.iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {param.label}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {param.hint}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p
          className={cn(
            "text-base font-bold tabular-nums leading-none",
            toneCls ? toneCls.text : "text-foreground"
          )}
        >
          {formatted}
          <span className="text-xs font-medium text-muted-foreground ml-1">
            {param.unit}
          </span>
        </p>
        {zone && toneCls && (
          <span
            className={cn(
              "mt-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              toneCls.bg,
              toneCls.text
            )}
          >
            {zone.label}
          </span>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Risk explainer drawer
 * ────────────────────────────────────────────────────────────────────── */

function RiskExplainerSheet({
  open,
  onOpenChange,
  currentLevel,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  currentLevel: BasalRiskLevel;
}) {
  const items: {
    level: BasalRiskLevel;
    label: string;
    range: string;
    desc: string;
    tone: string;
    bg: string;
  }[] = [
    {
      level: "all-normal",
      label: "Normal",
      range: "Todos parâmetros nas faixas ideais",
      desc: "Cliente apto para programa de exercícios sem ressalvas adicionais.",
      tone: "text-primary",
      bg: "bg-primary/10 border-primary/30",
    },
    {
      level: "warn",
      label: "Atenção",
      range: "Pelo menos 1 parâmetro elevado/reduzido",
      desc: "Avaliar contexto e considerar ajuste de intensidade ou encaminhamento.",
      tone: "text-amber-600 dark:text-amber-300",
      bg: "bg-amber-500/10 border-amber-500/30",
    },
    {
      level: "bad",
      label: "Crítico",
      range: "Pelo menos 1 parâmetro em zona crítica",
      desc: "Encaminhamento médico imediato antes de qualquer atividade física.",
      tone: "text-destructive",
      bg: "bg-destructive/10 border-destructive/30",
    },
  ];

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      srOnlyTitle="Faixas dos parâmetros basais"
      srOnlyDescription="Explicação da classificação de cada parâmetro vital."
    >
      <div className="px-1 pt-2 pb-1">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Faixas de classificação
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          A classificação considera a pior zona presente entre os parâmetros
          medidos (PA, glicemia, temperatura, FC, SpO₂).
        </p>
        <div className="space-y-2">
          {items.map((it) => {
            const isCurrent = it.level === currentLevel;
            return (
              <div
                key={it.level}
                className={cn(
                  "rounded-xl border-2 px-3 py-3",
                  it.bg,
                  isCurrent
                    ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/10"
                    : ""
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("text-sm font-bold", it.tone)}>
                    {it.label}
                  </p>
                  {isCurrent && (
                    <span className="inline-flex items-center rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground/80">
                      Atual
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                  {it.range}
                </p>
                <p className="text-xs text-foreground/80 mt-1.5 leading-relaxed">
                  {it.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Helpers visuais (mesmo padrão das demais views)
 * ────────────────────────────────────────────────────────────────────── */

function EcgLine({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 w-full opacity-[0.08]",
        className
      )}
      viewBox="0 0 400 64"
      preserveAspectRatio="none"
    >
      <line
        x1="0"
        y1="32"
        x2="400"
        y2="32"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeDasharray="2 4"
        opacity="0.4"
      />
      <path
        d="M0 32 L70 32 L85 28 L100 32 L120 32 L130 14 L138 52 L146 8 L154 32 L175 32 L190 26 L210 32 L400 32"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="spell-ecg-draw"
        pathLength={1}
      />
    </svg>
  );
}

function ParticleField({ className }: { className?: string }) {
  const dots = useMemo(
    () => [
      { x: 12, y: 18, size: 3, delay: 0 },
      { x: 78, y: 22, size: 2, delay: 600 },
      { x: 30, y: 65, size: 2, delay: 1200 },
      { x: 88, y: 70, size: 3, delay: 200 },
      { x: 50, y: 88, size: 2, delay: 1500 },
      { x: 18, y: 92, size: 2, delay: 900 },
      { x: 65, y: 12, size: 2, delay: 1800 },
      { x: 95, y: 45, size: 2, delay: 2100 },
    ],
    []
  );

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-current opacity-30 spell-twinkle"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            animationDelay: `${d.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}

function GaugeSegment({
  active,
  current,
  tone,
}: {
  active: boolean;
  current: boolean;
  tone: "primary" | "amber" | "destructive";
}) {
  const toneCls = {
    primary: "bg-primary",
    amber: "bg-amber-500",
    destructive: "bg-destructive",
  }[tone];
  return (
    <div
      className={cn(
        "relative h-1.5 flex-1 rounded-full overflow-hidden",
        active ? toneCls : "bg-muted"
      )}
    >
      {current && (
        <span
          aria-hidden
          className="absolute inset-0 spell-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)]"
        />
      )}
    </div>
  );
}

function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return setN(value);
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced || value === 0) return setN(value);
    const start = performance.now();
    const dur = 700;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}</>;
}

function SecondaryAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden",
        "flex items-center justify-center gap-2 py-3.5 rounded-xl",
        "text-sm font-medium text-foreground/80 hover:text-foreground",
        "border border-dashed border-border hover:border-primary/50 bg-card/40",
        "transition-colors active:scale-[0.98]"
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-primary/10 to-transparent transition-all duration-700 group-hover:left-full"
      />
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * CSS — design spells (compartilhado)
 * ────────────────────────────────────────────────────────────────────── */

const SPELLS_CSS = `
@keyframes spell-slide-up {
  from { opacity: 0; transform: translate3d(0, 10px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
.spell-slide-up {
  animation: spell-slide-up 500ms cubic-bezier(0.22, 1, 0.36, 1) both;
  will-change: transform, opacity;
}

@keyframes spell-heartbeat {
  0%, 30%, 50%, 100% { opacity: 0.35; transform: scale(1); }
  15%, 40%           { opacity: 0.65; transform: scale(1.1); }
}
.spell-heartbeat {
  animation: spell-heartbeat 1.6s ease-in-out infinite;
  will-change: transform, opacity;
}

@keyframes spell-shimmer {
  0%   { transform: translate3d(-100%, 0, 0); }
  100% { transform: translate3d(100%, 0, 0); }
}
.spell-shimmer {
  animation: spell-shimmer 2s linear infinite;
  will-change: transform;
}

@keyframes spell-icon-in {
  from { opacity: 0; transform: scale(0.6) rotate(-8deg); }
  to   { opacity: 1; transform: scale(1) rotate(0deg); }
}
.spell-icon-in {
  animation: spell-icon-in 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: 120ms;
}

@keyframes spell-rotate-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.spell-rotate-slow {
  animation: spell-rotate-slow 24s linear infinite;
  will-change: transform;
}

@keyframes spell-rotate-fast-rev {
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
}
.spell-rotate-fast-rev {
  animation: spell-rotate-fast-rev 12s linear infinite;
  will-change: transform;
}

@keyframes spell-twinkle {
  0%, 100% { opacity: 0.1; transform: scale(0.6); }
  50%      { opacity: 0.6; transform: scale(1); }
}
.spell-twinkle {
  animation: spell-twinkle 3s ease-in-out infinite;
  will-change: opacity, transform;
}

@keyframes spell-ecg-draw {
  0%   { stroke-dashoffset: 1; opacity: 0; }
  20%  { opacity: 0.08; }
  60%  { stroke-dashoffset: 0; opacity: 0.08; }
  100% { stroke-dashoffset: 0; opacity: 0.08; }
}
.spell-ecg-draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: spell-ecg-draw 1800ms cubic-bezier(0.65, 0, 0.35, 1) 200ms forwards;
}

@media (prefers-reduced-motion: reduce) {
  .spell-slide-up,
  .spell-heartbeat,
  .spell-shimmer,
  .spell-icon-in,
  .spell-rotate-slow,
  .spell-rotate-fast-rev,
  .spell-twinkle,
  .spell-ecg-draw {
    animation: none !important;
  }
  .spell-ecg-draw { stroke-dashoffset: 0 !important; opacity: 0.08 !important; }
}
`;
