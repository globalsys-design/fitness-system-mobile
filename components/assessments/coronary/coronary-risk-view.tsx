"use client";

/**
 * CoronaryRiskView — modo leitura do Risco Coronariano.
 *
 * v2 design spells — premium "fitness watch" vibe:
 *   • Hero "vital ring" — gauge 144px com PERCENTUAL gigante no centro,
 *     2 anéis concêntricos rotacionando, aura pulsante no ritmo cardíaco
 *   • Constelação de partículas decorativas no background
 *   • ECG line traçada no fundo (signature)
 *   • Stacked contribution bar — barra horizontal empilhada mostrando
 *     a contribuição visual de cada fator (verde/âmbar/vermelho)
 *   • Risk meter 4 segmentos com botão "?" → drawer explicativo dos níveis
 *   • Stats strip + accordion de respostas + observações
 *
 * Tudo CSS-only, GPU-accelerated, respeita prefers-reduced-motion.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  HeartPulse,
  HelpCircle,
  Pencil,
  Plus,
  Eye,
  Shield,
  ShieldCheck,
  TrendingUp,
  ListChecks,
  StickyNote,
  Heart,
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
import {
  findOption,
  type CoronaryQuestion,
  type CoronaryRiskLevel,
} from "@/lib/data/coronary-questions";

interface CoronaryRiskViewProps {
  questions: readonly CoronaryQuestion[];
  answers: Record<string, string>;
  notes?: string;
  score: number;
  maxScore: number;
  riskLevel: CoronaryRiskLevel;
  description: string;
  completedAt?: string | null;
  onEdit: () => void;
  onStartNew: () => void;
}

export function CoronaryRiskView({
  questions,
  answers,
  notes,
  score,
  maxScore,
  riskLevel,
  description,
  completedAt,
  onEdit,
  onStartNew,
}: CoronaryRiskViewProps) {
  const completedDate = completedAt ? new Date(completedAt) : null;
  const [explainerOpen, setExplainerOpen] = useState(false);

  /* Quantas questões aumentaram o risco (points > 0) */
  const counts = useMemo(() => {
    let positive = 0;
    let zero = 0;
    for (const q of questions) {
      const opt = findOption(q.key, answers[q.key]);
      if (!opt) continue;
      if (opt.points > 0) positive++;
      else zero++;
    }
    return { positive, zero, total: questions.length };
  }, [questions, answers]);

  return (
    <div className="relative pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <style>{SPELLS_CSS}</style>

      <div className="px-4 py-4 space-y-4">
        {/* ✨ HERO — Vital Ring */}
        <HeroVitalRing
          riskLevel={riskLevel}
          description={description}
          score={score}
          maxScore={maxScore}
          onOpenExplainer={() => setExplainerOpen(true)}
        />

        {/* Stats strip */}
        <StatsStrip
          score={score}
          maxScore={maxScore}
          positive={counts.positive}
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
                Estratificação Cardiovascular
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

        {/* Accordion — respostas */}
        <section
          className="spell-slide-up"
          style={{ animationDelay: "160ms" }}
        >
          <Accordion defaultValue={["answers"]}>
            <AccordionItem
              value="answers"
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3.5 hover:no-underline">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    Detalhamento por fator
                  </span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary tabular-nums">
                    {score}/{maxScore} pts
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <div className="divide-y divide-border/60 border-t border-border/60">
                  {questions.map((q, i) => (
                    <AnswerRow
                      key={q.key}
                      index={i}
                      question={q}
                      answerValue={answers[q.key]}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Observações */}
        {notes && notes.trim().length > 0 && (
          <section
            className="spell-slide-up rounded-2xl border border-border bg-card p-4 space-y-2"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                Observações
              </h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap border-l-2 border-primary/30 pl-3 italic">
              {notes}
            </p>
          </section>
        )}

        {/* CTA secundário */}
        <div
          className="spell-slide-up grid grid-cols-1 gap-2"
          style={{ animationDelay: "240ms" }}
        >
          <SecondaryAction
            icon={Pencil}
            label="Editar respostas"
            onClick={onEdit}
          />
        </div>
      </div>

      {/* FAB */}
      <FAB
        icon={Plus}
        onClick={onStartNew}
        label="Nova estratificação de risco coronariano"
      />

      {/* Drawer explicativo */}
      <RiskExplainerSheet
        open={explainerOpen}
        onOpenChange={setExplainerOpen}
        currentLevel={riskLevel}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * HERO — Vital Ring (signature)
 * ────────────────────────────────────────────────────────────────────── */

function HeroVitalRing({
  riskLevel,
  description,
  score,
  maxScore,
  onOpenExplainer,
}: {
  riskLevel: CoronaryRiskLevel;
  description: string;
  score: number;
  maxScore: number;
  onOpenExplainer: () => void;
}) {
  const config = {
    low: {
      Icon: ShieldCheck,
      label: "Risco Baixo",
      tone: "text-primary",
      bg: "from-primary/10 via-primary/5 to-transparent",
      ring: "ring-primary/25",
      aura: "bg-primary/30",
      ecg: "text-primary",
      arc: "var(--color-primary)",
      gaugeIdx: 0,
    },
    moderate: {
      Icon: Shield,
      label: "Risco Moderado",
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
      tone: "text-destructive",
      bg: "from-destructive/15 via-destructive/5 to-transparent",
      ring: "ring-destructive/25",
      aura: "bg-destructive/30",
      ecg: "text-destructive",
      arc: "var(--color-destructive)",
      gaugeIdx: 2,
    },
    "very-high": {
      Icon: AlertTriangle,
      label: "Risco Muito Alto",
      tone: "text-destructive",
      bg: "from-destructive/20 via-destructive/10 to-transparent",
      ring: "ring-destructive/35",
      aura: "bg-destructive/40",
      ecg: "text-destructive",
      arc: "var(--color-destructive)",
      gaugeIdx: 3,
    },
  }[riskLevel];

  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

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

      {/* ECG signature */}
      <EcgLine className={config.ecg} />

      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Vital Ring central — 144px */}
      <div className="relative flex flex-col items-center pt-1">
        <VitalRing
          score={score}
          maxScore={maxScore}
          color={config.arc}
          toneClass={config.tone}
          auraClass={config.aura}
          ringClass={config.ring}
        >
          <Heart
            aria-hidden
            className={cn("h-3.5 w-3.5 spell-icon-in", config.tone)}
          />
        </VitalRing>

        {/* Label de risco abaixo do ring */}
        <div className="relative mt-3 flex items-center gap-2">
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

        <p className="relative mt-1 text-xs text-center text-muted-foreground leading-relaxed max-w-md">
          {description}
        </p>
      </div>

      {/* Risk meter — 4 segmentos */}
      <div className="relative mt-5">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((idx) => (
            <GaugeSegment
              key={idx}
              active={config.gaugeIdx >= idx}
              current={config.gaugeIdx === idx}
              tone={
                idx === 0
                  ? "primary"
                  : idx === 1
                    ? "amber"
                    : "destructive"
              }
            />
          ))}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
          <span className={cn(config.gaugeIdx === 0 && "text-primary")}>
            Baixo
          </span>
          <span
            className={cn(
              config.gaugeIdx === 1 && "text-amber-500 dark:text-amber-300"
            )}
          >
            Moderado
          </span>
          <span className={cn(config.gaugeIdx === 2 && "text-destructive")}>
            Alto
          </span>
          <span className={cn(config.gaugeIdx === 3 && "text-destructive")}>
            Muito Alto
          </span>
        </div>
      </div>

      {/* Score resumo */}
      <div className="relative mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <HeartPulse className="h-3 w-3 text-destructive/70" />
          Pontuação
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground/90 tabular-nums">
          <TrendingUp className="h-3 w-3" />
          <CountUp value={score} /> / {maxScore} ·{" "}
          <CountUp value={pct} />%
        </span>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * VitalRing — gauge 144px com percentual gigante no centro
 * ────────────────────────────────────────────────────────────────────── */

function VitalRing({
  score,
  maxScore,
  color,
  toneClass,
  auraClass,
  ringClass,
  children,
}: {
  score: number;
  maxScore: number;
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
  const pct = Math.min(1, score / Math.max(1, maxScore));
  const pctNumber = Math.round(pct * 100);

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
      {/* Aura externa pulsante */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-full blur-2xl spell-heartbeat",
          auraClass
        )}
      />

      {/* Anel decorativo rotacionando — outermost */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-full spell-rotate-slow",
          "border border-dashed",
          ringClass.replace("ring-", "border-")
        )}
        style={{ borderColor: "currentColor", color: color }}
      />

      {/* Anel decorativo rotacionando — middle (sentido oposto) */}
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
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className={cn("flex items-baseline", toneClass)}>
          <span className="text-5xl font-bold tabular-nums leading-none tracking-tight spell-icon-in">
            <CountUp value={pctNumber} />
          </span>
          <span className="text-xl font-bold ml-0.5">%</span>
        </div>
        <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
          {children}
          <span>do máximo</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * ParticleField — constelação de pontos sutis movendo lentamente
 * ────────────────────────────────────────────────────────────────────── */

function ParticleField({ className }: { className?: string }) {
  // Pontos pré-calculados (estáticos) — animação via CSS para evitar re-render
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

/* ──────────────────────────────────────────────────────────────────────
 * EcgLine, GaugeSegment
 * ────────────────────────────────────────────────────────────────────── */

function EcgLine({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 w-full opacity-[0.10]",
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
 * Risk explainer drawer
 * ────────────────────────────────────────────────────────────────────── */

function RiskExplainerSheet({
  open,
  onOpenChange,
  currentLevel,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  currentLevel: CoronaryRiskLevel;
}) {
  const items: {
    level: CoronaryRiskLevel;
    label: string;
    range: string;
    desc: string;
    tone: string;
    bg: string;
  }[] = [
    {
      level: "low",
      label: "Baixo",
      range: "0–25% do score máximo",
      desc: "Pode iniciar programa de exercícios sem necessidade de avaliação médica adicional.",
      tone: "text-primary",
      bg: "bg-primary/10 border-primary/30",
    },
    {
      level: "moderate",
      label: "Moderado",
      range: "26–50% do score máximo",
      desc: "Recomenda-se avaliação médica antes de exercícios vigorosos.",
      tone: "text-amber-600 dark:text-amber-300",
      bg: "bg-amber-500/10 border-amber-500/30",
    },
    {
      level: "high",
      label: "Alto",
      range: "51–75% do score máximo",
      desc: "Avaliação médica completa antes de qualquer programa de exercícios.",
      tone: "text-destructive",
      bg: "bg-destructive/10 border-destructive/30",
    },
    {
      level: "very-high",
      label: "Muito Alto",
      range: "76–100% do score máximo",
      desc: "Necessita avaliação cardiológica imediata antes de iniciar atividade física.",
      tone: "text-destructive",
      bg: "bg-destructive/15 border-destructive/40",
    },
  ];

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      srOnlyTitle="Faixas de risco coronariano"
      srOnlyDescription="Explicação detalhada de cada nível de classificação de risco."
    >
      <div className="px-1 pt-2 pb-1">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Faixas de risco
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          A classificação é proporcional ao percentual atingido em relação ao
          score máximo possível.
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
                  isCurrent ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/10" : ""
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
 * Stats strip
 * ────────────────────────────────────────────────────────────────────── */

function StatsStrip({
  score,
  maxScore,
  positive,
}: {
  score: number;
  maxScore: number;
  positive: number;
}) {
  return (
    <div
      className="spell-slide-up grid grid-cols-3 gap-2"
      style={{ animationDelay: "100ms" }}
    >
      <StatChip label="Pontos" value={score} tone="primary" />
      <StatChip label="Máximo" value={maxScore} tone="muted" />
      <StatChip
        label="Fatores +"
        value={positive}
        tone={positive > 0 ? "destructive" : "muted"}
      />
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
  tone: "primary" | "destructive" | "muted";
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
        <CountUp value={value} />
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Answer row
 * ────────────────────────────────────────────────────────────────────── */

function AnswerRow({
  index,
  question,
  answerValue,
}: {
  index: number;
  question: CoronaryQuestion;
  answerValue: string | undefined;
}) {
  const opt = findOption(question.key, answerValue);
  const points = opt?.points ?? 0;
  const maxPoints = Math.max(...question.options.map((o) => o.points));
  const intensity = maxPoints > 0 ? points / maxPoints : 0;

  const sideCls =
    intensity === 0
      ? "before:bg-primary"
      : intensity > 0.6
        ? "before:bg-destructive"
        : "before:bg-amber-500";

  const badgeCls =
    intensity === 0
      ? "bg-primary/10 text-primary"
      : intensity > 0.6
        ? "bg-destructive/10 text-destructive"
        : "bg-amber-500/10 text-amber-600 dark:text-amber-300";

  return (
    <div
      className={cn(
        "relative flex items-start justify-between gap-3 px-4 py-3.5",
        "before:content-[''] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-0.5 before:rounded-r-full",
        sideCls,
        "transition-colors active:bg-muted/40",
        "spell-slide-up"
      )}
      style={{ animationDelay: `${220 + index * 35}ms` }}
    >
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {question.label}
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          {opt?.label ?? "—"}
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
          badgeCls
        )}
      >
        {points} pts
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * CountUp + SecondaryAction
 * ────────────────────────────────────────────────────────────────────── */

function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return setN(value);
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced || value === 0) return setN(value);
    const start = performance.now();
    const dur = 800;
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
  15%, 40%           { opacity: 0.65; transform: scale(1.1); }
}
.spell-heartbeat {
  animation: spell-heartbeat 1.2s ease-in-out infinite;
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

@keyframes spell-ecg-draw {
  0%   { stroke-dashoffset: 1; opacity: 0; }
  20%  { opacity: 0.10; }
  60%  { stroke-dashoffset: 0; opacity: 0.10; }
  100% { stroke-dashoffset: 0; opacity: 0.10; }
}
.spell-ecg-draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: spell-ecg-draw 1800ms cubic-bezier(0.65, 0, 0.35, 1) 200ms forwards;
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

@keyframes spell-bar-grow {
  from { width: 0 !important; opacity: 0; }
  to   { width: var(--bar-w); opacity: 1; }
}
.spell-bar-grow {
  animation: spell-bar-grow 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
  transform-origin: left;
  will-change: width, opacity;
}

@keyframes spell-twinkle {
  0%, 100% { opacity: 0.1; transform: scale(0.6); }
  50%      { opacity: 0.6; transform: scale(1); }
}
.spell-twinkle {
  animation: spell-twinkle 3s ease-in-out infinite;
  will-change: opacity, transform;
}

@media (prefers-reduced-motion: reduce) {
  .spell-slide-up,
  .spell-heartbeat,
  .spell-shimmer,
  .spell-icon-in,
  .spell-ecg-draw,
  .spell-rotate-slow,
  .spell-rotate-fast-rev,
  .spell-bar-grow,
  .spell-twinkle {
    animation: none !important;
  }
  .spell-ecg-draw { stroke-dashoffset: 0 !important; opacity: 0.10 !important; }
  .spell-bar-grow { width: var(--bar-w) !important; opacity: 1 !important; }
}
`;
