"use client";

/**
 * FraminghamView — modo leitura do Escore de Risco de Framingham.
 *
 * Signature spell: percentual 10-anos em GRANDE com count-up + radial gauge
 * animado + timeline de 10 anos com barras preenchendo progressivamente.
 *
 * Design spells (CSS-only, GPU-accelerated, respeita prefers-reduced-motion):
 *   • Hero com percentage hero + gauge circular SVG
 *   • Timeline de 10 anos — 10 pilares que crescem com stagger
 *   • Stats strip com pontos e gênero
 *   • Breakdown de fatores (accordion) — cada fator com +N pts colorido
 *   • Risk meter 3 segmentos (Baixo / Moderado / Alto)
 */

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  HeartPulse,
  HelpCircle,
  Pencil,
  Plus,
  Eye,
  ShieldCheck,
  TrendingUp,
  Cigarette,
  Droplet,
  Gauge,
  Venus,
  Mars,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { FAB } from "@/components/mobile/fab";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FraminghamRiskLevel = "low" | "moderate" | "high";

export interface FraminghamViewData {
  gender: "M" | "F";
  age: number;
  totalCholesterol: number;
  hdl: number;
  systolic: number;
  isTreatedBP: boolean;
  isSmoker: boolean;
  hasDiabetes: boolean;
}

export interface FraminghamBreakdown {
  label: string;
  icon: "age" | "chol" | "hdl" | "bp" | "smoker" | "diabetes";
  points: number;
}

interface FraminghamViewProps {
  data: FraminghamViewData;
  score: number;
  risk10Year: number;
  riskLevel: FraminghamRiskLevel;
  breakdown: FraminghamBreakdown[];
  completedAt?: string | null;
  onEdit: () => void;
  onStartNew: () => void;
}

export function FraminghamView({
  data,
  score,
  risk10Year,
  riskLevel,
  breakdown,
  completedAt,
  onEdit,
  onStartNew,
}: FraminghamViewProps) {
  const completedDate = completedAt ? new Date(completedAt) : null;
  const [explainerOpen, setExplainerOpen] = useState(false);

  return (
    <div className="relative pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <style>{SPELLS_CSS}</style>

      <div className="px-4 py-4 space-y-4">
        {/* ✨ HERO — percentual + gauge + risk meter */}
        <HeroFraminghamCard
          risk10Year={risk10Year}
          riskLevel={riskLevel}
          score={score}
          gender={data.gender}
          onOpenExplainer={() => setExplainerOpen(true)}
        />

        {/* ✨ Timeline de 10 anos */}
        <TimelineCard risk10Year={risk10Year} riskLevel={riskLevel} />

        {/* Stats */}
        <StatsStrip
          score={score}
          age={data.age}
          gender={data.gender}
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
                Framingham Risk Score
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

        {/* Parâmetros clínicos */}
        <ClinicalParams data={data} />

        {/* Breakdown de pontos por fator */}
        <section
          className="spell-slide-up"
          style={{ animationDelay: "180ms" }}
        >
          <Accordion defaultValue={["breakdown"]}>
            <AccordionItem
              value="breakdown"
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3.5 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Pontuação por Fator
                  </span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary tabular-nums">
                    {score} pts
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <div className="divide-y divide-border/60 border-t border-border/60">
                  {breakdown.map((f, i) => (
                    <BreakdownRow key={f.label} index={i} item={f} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* CTAs secundários */}
        <div
          className="spell-slide-up grid grid-cols-1 gap-2"
          style={{ animationDelay: "240ms" }}
        >
          <SecondaryAction
            icon={Pencil}
            label="Editar parâmetros"
            onClick={onEdit}
          />
        </div>
      </div>

      {/* FAB — nova avaliação */}
      <FAB
        icon={Plus}
        onClick={onStartNew}
        label="Nova avaliação de Framingham"
      />

      {/* Drawer explicativo das faixas de risco */}
      <RiskExplainerSheet
        open={explainerOpen}
        onOpenChange={setExplainerOpen}
        currentLevel={riskLevel}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * HERO — percentual hero + gauge circular + risk meter
 * ────────────────────────────────────────────────────────────────────── */

function HeroFraminghamCard({
  risk10Year,
  riskLevel,
  score,
  gender,
  onOpenExplainer,
}: {
  risk10Year: number;
  riskLevel: FraminghamRiskLevel;
  score: number;
  gender: "M" | "F";
  onOpenExplainer: () => void;
}) {
  const config = {
    low: {
      Icon: ShieldCheck,
      label: "Risco Baixo",
      sub: "< 10% em 10 anos",
      tone: "text-primary",
      bg: "from-primary/10 via-primary/5 to-transparent",
      ring: "ring-primary/25",
      aura: "bg-primary/30",
      ecg: "text-primary",
      arc: "var(--color-primary)",
      gaugeIdx: 0,
    },
    moderate: {
      Icon: Gauge,
      label: "Risco Moderado",
      sub: "10–19% em 10 anos",
      tone: "text-amber-500 dark:text-amber-300",
      bg: "from-amber-500/15 via-amber-500/5 to-transparent",
      ring: "ring-amber-500/25",
      aura: "bg-amber-500/30",
      ecg: "text-amber-500 dark:text-amber-300",
      arc: "oklch(0.75 0.15 70)",
      gaugeIdx: 1,
    },
    high: {
      Icon: AlertTriangle,
      label: "Risco Alto",
      sub: "≥ 20% em 10 anos",
      tone: "text-destructive",
      bg: "from-destructive/15 via-destructive/5 to-transparent",
      ring: "ring-destructive/25",
      aura: "bg-destructive/30",
      ecg: "text-destructive",
      arc: "var(--color-destructive)",
      gaugeIdx: 2,
    },
  }[riskLevel];

  const GenderIcon = gender === "M" ? Mars : Venus;

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
      {/* Constelação de partículas */}
      <ParticleField className={config.tone} />

      {/* ECG signature line */}
      <EcgLine className={config.ecg} />

      {/* Grain sutil */}
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
        {/* Vital ring gigante centralizado */}
        <LargeRadialGauge
          risk10Year={risk10Year}
          color={config.arc}
          toneClass={config.tone}
          auraClass={config.aura}
          ringClass={config.ring}
        />

        {/* Gender chip */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full bg-background/60 backdrop-blur ring-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              config.ring,
              config.tone
            )}
          >
            <GenderIcon className="h-3 w-3" />
            {gender === "M" ? "Masculino" : "Feminino"}
          </span>
        </div>

        {/* Label + ajuda */}
        <div className="flex items-center gap-2">
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
            aria-label="Entender as faixas de risco"
          >
            <HelpCircle className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>

        <p className="text-xs text-center text-muted-foreground leading-relaxed max-w-md">
          {config.sub} · Pontuação <CountUp value={score} /> pts
        </p>
      </div>

      {/* Risk meter — 3 segmentos */}
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
            {"<"} 10%
          </span>
          <span
            className={cn(
              config.gaugeIdx === 1 && "text-amber-500 dark:text-amber-300"
            )}
          >
            10–19%
          </span>
          <span className={cn(config.gaugeIdx === 2 && "text-destructive")}>
            ≥ 20%
          </span>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * LargeRadialGauge — 112px com percentual no centro
 * ────────────────────────────────────────────────────────────────────── */

function LargeRadialGauge({
  risk10Year,
  color,
  toneClass,
  auraClass,
  ringClass,
}: {
  risk10Year: number;
  color: string;
  toneClass: string;
  auraClass: string;
  ringClass: string;
}) {
  const size = 144;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Cap visual em 30% (matches Framingham max table)
  const pct = Math.min(1, risk10Year / 30);

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
      {/* Aura externa pulsante (heartbeat) */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-full blur-2xl spell-heartbeat",
          auraClass
        )}
      />

      {/* Anel decorativo dashed rotacionando lentamente */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-full spell-rotate-slow",
          "border border-dashed",
          ringClass.replace("ring-", "border-")
        )}
        style={{ borderColor: "currentColor", color: color }}
      />

      {/* Anel decorativo interno (sentido oposto) */}
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

      {/* Gauge SVG principal */}
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
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
              transition: "stroke-dashoffset 0.1s ease-out",
            }}
          />
        </svg>

        {/* Centro do ring — percentual gigante */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <span
            className={cn(
              "text-5xl font-bold tabular-nums leading-none tracking-tight spell-icon-in",
              toneClass
            )}
          >
            <CountUp value={risk10Year} />
            <span className="text-xl font-bold ml-0.5">%</span>
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">
            em 10 anos
          </span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * TimelineCard — 10 pilares representando os 10 anos
 * ────────────────────────────────────────────────────────────────────── */

function TimelineCard({
  risk10Year,
  riskLevel,
}: {
  risk10Year: number;
  riskLevel: FraminghamRiskLevel;
}) {
  const barCls = {
    low: "bg-gradient-to-t from-primary/60 to-primary",
    moderate: "bg-gradient-to-t from-amber-500/60 to-amber-500",
    high: "bg-gradient-to-t from-destructive/60 to-destructive",
  }[riskLevel];

  // Cada ano fica com altura proporcional ao risco acumulado (simples visual hint)
  // Usamos função exponencial suave: bars crescem do ano 1 ao 10
  const bars = Array.from({ length: 10 }).map((_, i) => {
    const yearFactor = (i + 1) / 10;
    // altura vai de 30% até 100% (pct linear)
    const h = 30 + yearFactor * 70;
    return h;
  });

  return (
    <section
      className="spell-slide-up rounded-2xl border border-border bg-card p-4"
      style={{ animationDelay: "60ms" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Projeção 10 anos
          </h3>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Ano 1 → 10
        </span>
      </div>

      <div className="flex items-end justify-between gap-1 h-20">
        {bars.map((h, i) => (
          <div
            key={i}
            className="relative flex-1 flex flex-col items-center justify-end gap-1 h-full"
          >
            <div
              className={cn(
                "w-full rounded-t-md spell-bar-rise",
                barCls
              )}
              style={
                {
                  height: `${h}%`,
                  animationDelay: `${80 + i * 40}ms`,
                  "--bar-h": `${h}%`,
                } as React.CSSProperties
              }
            />
            <span className="text-[9px] font-medium text-muted-foreground/70 tabular-nums">
              {i + 1}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">Risco acumulado projetado</span>
        <span className="inline-flex items-center gap-1 font-semibold text-foreground/90 tabular-nums">
          <TrendingUp className="h-3 w-3" />
          <CountUp value={risk10Year} />%
        </span>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Stats strip
 * ────────────────────────────────────────────────────────────────────── */

function StatsStrip({
  score,
  age,
  gender,
}: {
  score: number;
  age: number;
  gender: "M" | "F";
}) {
  return (
    <div
      className="spell-slide-up grid grid-cols-3 gap-2"
      style={{ animationDelay: "100ms" }}
    >
      <StatChip label="Pontos" value={score} tone="primary" />
      <StatChip label="Idade" value={age} tone="muted" suffix=" anos" />
      <StatChip
        label="Gênero"
        textValue={gender === "M" ? "Masc." : "Fem."}
        tone="muted"
      />
    </div>
  );
}

function StatChip({
  label,
  value,
  textValue,
  tone,
  suffix,
}: {
  label: string;
  value?: number;
  textValue?: string;
  tone: "primary" | "destructive" | "muted";
  suffix?: string;
}) {
  const cls = {
    primary: "text-primary border-primary/20 bg-primary/5",
    destructive: "text-destructive border-destructive/20 bg-destructive/5",
    muted: "text-foreground border-border bg-card",
  }[tone];
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5 flex flex-col items-start gap-0.5",
        cls
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
        {label}
      </span>
      <span className="text-xl font-bold tabular-nums leading-none">
        {typeof value === "number" ? <CountUp value={value} /> : textValue}
        {suffix && (
          <span className="text-xs font-semibold opacity-70">{suffix}</span>
        )}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Clinical params card
 * ────────────────────────────────────────────────────────────────────── */

function ClinicalParams({ data }: { data: FraminghamViewData }) {
  const items = [
    {
      icon: Droplet,
      label: "Colesterol Total",
      value: data.totalCholesterol,
      unit: "mg/dL",
      flag: data.totalCholesterol >= 240,
    },
    {
      icon: ShieldCheck,
      label: "HDL",
      value: data.hdl,
      unit: "mg/dL",
      flag: data.hdl < 40,
      protective: data.hdl >= 60,
    },
    {
      icon: HeartPulse,
      label: "PA Sistólica",
      value: data.systolic,
      unit: "mmHg",
      flag: data.systolic >= 140,
    },
  ];

  return (
    <section
      className="spell-slide-up rounded-2xl border border-border bg-card p-4 space-y-3"
      style={{ animationDelay: "140ms" }}
    >
      <h3 className="text-sm font-semibold text-foreground">
        Parâmetros Clínicos
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {items.map((it, i) => (
          <div
            key={it.label}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2.5 spell-slide-up",
              it.protective
                ? "border-primary/30 bg-primary/5"
                : it.flag
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-border/60 bg-muted/20"
            )}
            style={{ animationDelay: `${160 + i * 40}ms` }}
          >
            <it.icon
              className={cn(
                "h-4 w-4 shrink-0",
                it.protective
                  ? "text-primary"
                  : it.flag
                    ? "text-destructive"
                    : "text-muted-foreground"
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{it.label}</p>
              <p className="text-sm font-semibold text-foreground tabular-nums">
                <CountUp value={it.value} />
                <span className="text-xs text-muted-foreground font-medium ml-1">
                  {it.unit}
                </span>
              </p>
            </div>
            {it.protective && (
              <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                Protetor
              </span>
            )}
            {it.flag && !it.protective && (
              <span className="inline-flex items-center rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
                Alterado
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Booleans */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <BoolChip
          icon={HeartPulse}
          label="Trata PA"
          active={data.isTreatedBP}
        />
        <BoolChip
          icon={Cigarette}
          label="Fumante"
          active={data.isSmoker}
          danger
        />
        <BoolChip
          icon={Droplet}
          label="Diabetes"
          active={data.hasDiabetes}
          danger
        />
      </div>
    </section>
  );
}

function BoolChip({
  icon: Icon,
  label,
  active,
  danger,
}: {
  icon: typeof HeartPulse;
  label: string;
  active: boolean;
  danger?: boolean;
}) {
  const cls = !active
    ? "border-border/60 bg-muted/30 text-muted-foreground"
    : danger
      ? "border-destructive/30 bg-destructive/5 text-destructive"
      : "border-primary/30 bg-primary/5 text-primary";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl border py-2.5 px-2 text-center",
        cls
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="text-[10px] font-semibold uppercase tracking-wide">
        {label}
      </span>
      <span className="text-[10px] font-bold opacity-80">
        {active ? "Sim" : "Não"}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Breakdown row
 * ────────────────────────────────────────────────────────────────────── */

function BreakdownRow({
  index,
  item,
}: {
  index: number;
  item: FraminghamBreakdown;
}) {
  const sideCls =
    item.points > 0
      ? "before:bg-destructive"
      : item.points < 0
        ? "before:bg-primary"
        : "before:bg-border";

  const badgeCls =
    item.points > 0
      ? "bg-destructive/10 text-destructive"
      : item.points < 0
        ? "bg-primary/10 text-primary"
        : "bg-muted text-muted-foreground";

  return (
    <div
      className={cn(
        "relative flex items-center justify-between gap-3 px-4 py-3.5",
        "before:content-[''] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-0.5 before:rounded-r-full",
        sideCls,
        "transition-colors active:bg-muted/40",
        "spell-slide-up"
      )}
      style={{ animationDelay: `${220 + index * 40}ms` }}
    >
      <p className="text-sm text-foreground/90 flex-1 min-w-0">{item.label}</p>
      <span
        className={cn(
          "shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
          badgeCls
        )}
      >
        {item.points > 0 ? "+" : ""}
        {item.points} pts
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Risk meter segment + Count-up + Secondary action
 * ────────────────────────────────────────────────────────────────────── */

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

/* ──────────────────────────────────────────────────────────────────────
 * EcgLine — heartbeat signature no fundo do hero
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

/* ──────────────────────────────────────────────────────────────────────
 * ParticleField — constelação de pontos sutis
 * ────────────────────────────────────────────────────────────────────── */

function ParticleField({ className }: { className?: string }) {
  const dots = useMemo(
    () => [
      { x: 14, y: 16, size: 3, delay: 0 },
      { x: 80, y: 22, size: 2, delay: 600 },
      { x: 28, y: 70, size: 2, delay: 1200 },
      { x: 88, y: 75, size: 3, delay: 200 },
      { x: 50, y: 90, size: 2, delay: 1500 },
      { x: 18, y: 92, size: 2, delay: 900 },
      { x: 65, y: 10, size: 2, delay: 1800 },
      { x: 95, y: 50, size: 2, delay: 2100 },
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

/* ──────────────────────────────────────────────────────────────────────
 * RiskExplainerSheet — drawer com explicação das 3 faixas
 * ────────────────────────────────────────────────────────────────────── */

function RiskExplainerSheet({
  open,
  onOpenChange,
  currentLevel,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  currentLevel: FraminghamRiskLevel;
}) {
  const items: {
    level: FraminghamRiskLevel;
    label: string;
    range: string;
    desc: string;
    tone: string;
    bg: string;
  }[] = [
    {
      level: "low",
      label: "Baixo",
      range: "< 10% em 10 anos",
      desc: "Probabilidade abaixo de 1 em 10 de evento cardiovascular nos próximos 10 anos. Manter hábitos saudáveis e acompanhamento regular.",
      tone: "text-primary",
      bg: "bg-primary/10 border-primary/30",
    },
    {
      level: "moderate",
      label: "Moderado",
      range: "10–19% em 10 anos",
      desc: "Probabilidade entre 1 e 2 em 10 de evento cardiovascular. Recomenda-se mudanças no estilo de vida e acompanhamento médico.",
      tone: "text-amber-600 dark:text-amber-300",
      bg: "bg-amber-500/10 border-amber-500/30",
    },
    {
      level: "high",
      label: "Alto",
      range: "≥ 20% em 10 anos",
      desc: "Probabilidade acima de 2 em 10 de evento cardiovascular. Necessita intervenção médica e mudanças imediatas no estilo de vida.",
      tone: "text-destructive",
      bg: "bg-destructive/10 border-destructive/30",
    },
  ];

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      srOnlyTitle="Faixas de risco Framingham"
      srOnlyDescription="Explicação detalhada de cada nível de classificação cardiovascular em 10 anos."
    >
      <div className="px-1 pt-2 pb-1">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Faixas de risco em 10 anos
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          O escore Framingham estima a probabilidade de um evento
          cardiovascular (infarto, AVC) nos próximos 10 anos.
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
 * CSS — design spells
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
  15%, 40%           { opacity: 0.6;  transform: scale(1.1); }
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

@keyframes spell-bar-rise {
  from { height: 0 !important; opacity: 0; }
  to   { height: var(--bar-h); opacity: 1; }
}
.spell-bar-rise {
  animation: spell-bar-rise 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
  transform-origin: bottom;
  will-change: height, opacity;
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
  .spell-bar-rise,
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
