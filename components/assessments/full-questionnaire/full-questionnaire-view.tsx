"use client";

/**
 * FullQuestionnaireView — modo leitura do Questionário Completo.
 *
 * Mantém a família visual de Coronário/Framingham/Avançado:
 *   • Hero "Vital Ring 144px" com percentual de completude
 *   • Anéis decorativos rotacionando + aura heartbeat
 *   • ECG signature line + constelação de partículas
 *   • Risk meter 4 segmentos baseado no Laudo Final
 *   • Stats strip com 3 contadores chave
 *   • Cards/accordions resumindo cada uma das 9 seções
 *   • Drawer explicativo das conclusões clínicas
 *   • FAB para nova avaliação
 *
 * Filosofia: este é um "summary clínico" — não duplica todos os 100+
 * campos, apenas destaca o que importa para decisão (Sim relatados,
 * observações livres, conclusão final, parâmetros chave).
 */

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Calendar as CalendarIcon,
  ClipboardList,
  Eye,
  HelpCircle,
  HeartPulse,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  StickyNote,
  TrendingUp,
  Utensils,
  Dumbbell,
  Users,
  Moon,
  Target,
  Heart,
  Stethoscope,
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
  ALL_CURRENT_HISTORY_QUESTIONS,
  MORBID_QUESTIONS,
  FAMILY_HISTORY_QUESTIONS,
  ACTIVITY_QUESTIONS,
  EXAM_FIELDS,
  PERSONALITY_OPTIONS,
  GOAL_ACHIEVEMENT_OPTIONS,
  WEEKLY_FREQUENCY_OPTIONS,
  INTENSITY_OPTIONS,
  DIET_ASSESSMENT_OPTIONS,
  RATING_OPTIONS,
  SOMETIMES_RATING_OPTIONS,
  FINAL_REPORT_OPTIONS,
  EATING_QUALITY_OPTIONS,
  PREFERRED_TIME_OPTIONS,
  COMMUTE_OPTIONS,
  NUTRITIONIST_OPTIONS,
  MEAL_OPTIONS,
  getSportOptions,
  SPORT_FIELDS,
  type FullQuestionnaireDataV2,
  type FinalConclusion,
  type YesNoQuestion,
} from "@/lib/data/full-questionnaire";

interface FullQuestionnaireViewProps {
  data: FullQuestionnaireDataV2;
  completedAt?: string | null;
  onEdit: () => void;
  onStartNew: () => void;
}

/* Mapeia conclusão do Laudo → nível visual */
type RiskBucket = "clean" | "minor" | "major" | "critical" | "pending";

function classifyByConclusion(c: FinalConclusion | undefined): RiskBucket {
  if (!c) return "pending";
  if (c === "no-issues") return "clean";
  if (c === "minor") return "minor";
  if (c === "major-restrictions") return "major";
  return "critical";
}

/* Resolve label de uma opção a partir do value */
function labelOf<T extends string>(
  options: readonly { value: T; label: string }[],
  value: T | undefined
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? "—";
}

export function FullQuestionnaireView({
  data,
  completedAt,
  onEdit,
  onStartNew,
}: FullQuestionnaireViewProps) {
  const completedDate = completedAt ? new Date(completedAt) : null;
  const [explainerOpen, setExplainerOpen] = useState(false);

  /* ── derivações ─────────────────────────────────────────────── */
  const riskBucket = classifyByConclusion(data.finalReport?.conclusion);

  const currentYes = useMemo(
    () =>
      ALL_CURRENT_HISTORY_QUESTIONS.filter(
        (q) => data.currentHistory?.answers?.[q.id] === "yes"
      ),
    [data.currentHistory?.answers]
  );

  const morbidYes = useMemo(
    () =>
      MORBID_QUESTIONS.filter(
        (q) => data.morbidHistory?.answers?.[q.id] === "yes"
      ),
    [data.morbidHistory?.answers]
  );

  const familyYes = useMemo(
    () =>
      FAMILY_HISTORY_QUESTIONS.filter(
        (q) => data.familyHistory?.answers?.[q.id] === "yes"
      ),
    [data.familyHistory?.answers]
  );

  const totalYes = currentYes.length + morbidYes.length + familyYes.length;

  /* % de completude (campos chave preenchidos) */
  const completion = useMemo(() => {
    let filled = 0;
    let total = 0;
    // currentHistory: 19 perguntas
    for (const q of ALL_CURRENT_HISTORY_QUESTIONS) {
      total++;
      if (data.currentHistory?.answers?.[q.id]) filled++;
    }
    // morbid: 18
    for (const q of MORBID_QUESTIONS) {
      total++;
      if (data.morbidHistory?.answers?.[q.id]) filled++;
    }
    // family: 11
    for (const q of FAMILY_HISTORY_QUESTIONS) {
      total++;
      if (data.familyHistory?.answers?.[q.id]) filled++;
    }
    // activity: 6
    for (const q of ACTIVITY_QUESTIONS) {
      total++;
      if (data.physicalActivity?.answers?.[q.id]) filled++;
    }
    // Final report
    total++;
    if (data.finalReport?.conclusion) filled++;
    return { filled, total, pct: total > 0 ? filled / total : 0 };
  }, [data]);

  return (
    <div className="relative pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <style>{SPELLS_CSS}</style>

      <div className="px-4 py-4 space-y-4">
        {/* ✨ HERO — Vital Ring + Laudo Final */}
        <HeroFullCard
          riskBucket={riskBucket}
          conclusion={data.finalReport?.conclusion}
          observations={data.finalReport?.observations}
          completionPct={completion.pct}
          totalYes={totalYes}
          onOpenExplainer={() => setExplainerOpen(true)}
        />

        {/* Stats strip — 3 contadores principais */}
        <StatsStrip
          currentYes={currentYes.length}
          morbidYes={morbidYes.length}
          familyYes={familyYes.length}
        />

        {/* Timestamp + completude */}
        {completedDate && (
          <section
            className="spell-slide-up flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5"
            style={{ animationDelay: "120ms" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Activity className="h-3.5 w-3.5 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground truncate">
                {completion.filled}/{completion.total} campos preenchidos
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

        {/* 1. Últimos Exames */}
        <ExamsCard exams={data.exams} index={0} />

        {/* 2. Histórico Atual */}
        <SimAccordion
          title="Histórico Atual"
          icon={Heart}
          items={ALL_CURRENT_HISTORY_QUESTIONS}
          answers={data.currentHistory?.answers ?? {}}
          observations={data.currentHistory?.observations ?? {}}
          extra={
            data.currentHistory?.personality ? (
              <ExtraInfo
                label="Personalidade"
                value={labelOf(PERSONALITY_OPTIONS, data.currentHistory.personality)}
              />
            ) : null
          }
          index={1}
        />

        {/* 3. Antecedentes Mórbidos */}
        <SimAccordion
          title="Antecedentes Mórbidos"
          icon={Stethoscope}
          items={MORBID_QUESTIONS}
          answers={data.morbidHistory?.answers ?? {}}
          observations={data.morbidHistory?.observations ?? {}}
          index={2}
        />

        {/* 4. Atividade Física */}
        <ActivityCard data={data.physicalActivity} index={3} />

        {/* 5. Dieta */}
        <DietCard data={data.diet} index={4} />

        {/* 6. Histórico Familiar */}
        <SimAccordion
          title="Histórico Familiar"
          icon={Users}
          items={FAMILY_HISTORY_QUESTIONS}
          answers={data.familyHistory?.answers ?? {}}
          observations={data.familyHistory?.observations ?? {}}
          index={5}
        />

        {/* 7. Reavaliação Física */}
        <ReassessmentCard data={data.reassessment} index={6} />

        {/* 8. Autopercepção */}
        <SelfPerceptionCard data={data.selfPerception} index={7} />

        {/* 9. Observações do Laudo (já mostra a conclusão no hero) */}
        {data.finalReport?.observations &&
          data.finalReport.observations.trim().length > 0 && (
            <section
              className="spell-slide-up rounded-2xl border border-border bg-card p-4 space-y-2"
              style={{ animationDelay: "320ms" }}
            >
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  Observações do Laudo Final
                </h3>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap border-l-2 border-primary/30 pl-3 italic">
                {data.finalReport.observations}
              </p>
            </section>
          )}

        {/* CTA secundário */}
        <div
          className="spell-slide-up grid grid-cols-1 gap-2"
          style={{ animationDelay: "360ms" }}
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
        label="Novo questionário completo"
      />

      {/* Drawer */}
      <RiskExplainerSheet
        open={explainerOpen}
        onOpenChange={setExplainerOpen}
        currentLevel={riskBucket}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * HERO — Vital Ring com Laudo Final
 * ────────────────────────────────────────────────────────────────────── */

function HeroFullCard({
  riskBucket,
  conclusion,
  observations,
  completionPct,
  totalYes,
  onOpenExplainer,
}: {
  riskBucket: RiskBucket;
  conclusion: FinalConclusion | undefined;
  observations: string | undefined;
  completionPct: number;
  totalYes: number;
  onOpenExplainer: () => void;
}) {
  const config = {
    clean: {
      Icon: ShieldCheck,
      label: "Liberação Total",
      desc: "Anamnese sem destaques. Cliente apto para programa de exercícios sem restrições adicionais.",
      tone: "text-primary",
      bg: "from-primary/10 via-primary/5 to-transparent",
      ring: "ring-primary/25",
      aura: "bg-primary/30",
      ecg: "text-primary",
      arc: "var(--color-primary)",
      gaugeIdx: 0,
    },
    minor: {
      Icon: Shield,
      label: "Atenção Pontual",
      desc: "Pequenas observações importantes que requerem atenção na prescrição.",
      tone: "text-amber-500 dark:text-amber-300",
      bg: "from-amber-500/15 via-amber-500/5 to-transparent",
      ring: "ring-amber-500/25",
      aura: "bg-amber-500/30",
      ecg: "text-amber-500 dark:text-amber-300",
      arc: "oklch(0.75 0.15 70)",
      gaugeIdx: 1,
    },
    major: {
      Icon: AlertTriangle,
      label: "Restrições Elevadas",
      desc: "Observações importantes que requerem prescrição com nível elevado de restrições.",
      tone: "text-destructive",
      bg: "from-destructive/15 via-destructive/5 to-transparent",
      ring: "ring-destructive/25",
      aura: "bg-destructive/30",
      ecg: "text-destructive",
      arc: "var(--color-destructive)",
      gaugeIdx: 2,
    },
    critical: {
      Icon: AlertTriangle,
      label: "Avaliação Médica Necessária",
      desc: "Recomenda-se levantamento minucioso por médico antes de estabelecer níveis de restrição física.",
      tone: "text-destructive",
      bg: "from-destructive/20 via-destructive/10 to-transparent",
      ring: "ring-destructive/35",
      aura: "bg-destructive/40",
      ecg: "text-destructive",
      arc: "var(--color-destructive)",
      gaugeIdx: 3,
    },
    pending: {
      Icon: HelpCircle,
      label: "Laudo Pendente",
      desc: "A conclusão do laudo final ainda não foi registrada. Edite o questionário para concluir.",
      tone: "text-muted-foreground",
      bg: "from-muted/30 via-muted/10 to-transparent",
      ring: "ring-border/40",
      aura: "bg-muted-foreground/20",
      ecg: "text-muted-foreground",
      arc: "var(--color-muted-foreground)",
      gaugeIdx: -1,
    },
  }[riskBucket];

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
        {/* Vital Ring com % de completude no centro */}
        <VitalRing
          completionPct={completionPct}
          color={config.arc}
          toneClass={config.tone}
          auraClass={config.aura}
          ringClass={config.ring}
        >
          <ClipboardList
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
            aria-label="Entender as conclusões"
          >
            <HelpCircle className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>

        <p className="text-xs text-center text-muted-foreground leading-relaxed max-w-md">
          {config.desc}
        </p>

        {observations && observations.trim().length > 0 && (
          <p className="text-xs text-center italic text-foreground/70 leading-relaxed max-w-md border-t border-border/40 pt-2 mt-1 w-full">
            &ldquo;{observations}&rdquo;
          </p>
        )}
      </div>

      {/* Risk meter — 4 segmentos */}
      {riskBucket !== "pending" && (
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
              Liberado
            </span>
            <span
              className={cn(
                config.gaugeIdx === 1 && "text-amber-500 dark:text-amber-300"
              )}
            >
              Atenção
            </span>
            <span className={cn(config.gaugeIdx === 2 && "text-destructive")}>
              Restritivo
            </span>
            <span className={cn(config.gaugeIdx === 3 && "text-destructive")}>
              Médico
            </span>
          </div>
        </div>
      )}

      <div className="relative mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <HeartPulse className="h-3 w-3 text-destructive/70" />
          Total de fatores Sim
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground/90 tabular-nums">
          <TrendingUp className="h-3 w-3" />
          <CountUp value={totalYes} />
        </span>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * VitalRing
 * ────────────────────────────────────────────────────────────────────── */

function VitalRing({
  completionPct,
  color,
  toneClass,
  auraClass,
  ringClass,
  children,
}: {
  completionPct: number;
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
  const pct = Math.min(1, Math.max(0, completionPct));
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
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />
        </svg>
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className={cn("flex items-baseline", toneClass)}>
            <span className="text-5xl font-bold tabular-nums leading-none tracking-tight spell-icon-in">
              <CountUp value={pctNumber} />
            </span>
            <span className="text-xl font-bold ml-0.5">%</span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
            {children}
            <span>preenchido</span>
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
  currentYes,
  morbidYes,
  familyYes,
}: {
  currentYes: number;
  morbidYes: number;
  familyYes: number;
}) {
  return (
    <div
      className="spell-slide-up grid grid-cols-3 gap-2"
      style={{ animationDelay: "60ms" }}
    >
      <StatChip label="Atual" value={currentYes} icon={Heart} />
      <StatChip label="Mórbidos" value={morbidYes} icon={Stethoscope} />
      <StatChip label="Familiar" value={familyYes} icon={Users} />
    </div>
  );
}

function StatChip({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Heart;
}) {
  const tone = value === 0 ? "primary" : value <= 2 ? "amber" : "destructive";
  const cls = {
    primary: "border-primary/20 bg-primary/5 text-primary",
    amber:
      "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-300",
    destructive: "border-destructive/20 bg-destructive/5 text-destructive",
  }[tone];

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5 flex flex-col items-start gap-1",
        cls
      )}
    >
      <div className="flex items-center gap-1.5 w-full">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80 truncate">
          {label}
        </span>
      </div>
      <span className="text-xl font-bold tabular-nums leading-none">
        <CountUp value={value} />
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * ExamsCard — datas dos últimos exames
 * ────────────────────────────────────────────────────────────────────── */

function ExamsCard({
  exams,
  index,
}: {
  exams: FullQuestionnaireDataV2["exams"];
  index: number;
}) {
  const items = EXAM_FIELDS.map((f) => ({
    label: f.label,
    date: exams?.[f.id],
  })).filter((it) => it.date);

  if (items.length === 0) return null;

  return (
    <section
      className="spell-slide-up rounded-2xl border border-border bg-card p-4 space-y-3"
      style={{ animationDelay: `${140 + index * 40}ms` }}
    >
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Últimos Exames
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
          >
            <span className="text-xs text-muted-foreground truncate">
              {it.label}
            </span>
            <span className="text-xs font-semibold text-foreground tabular-nums shrink-0">
              {formatDate(it.date)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * SimAccordion — accordion mostrando só os "Sim" de uma seção
 * ────────────────────────────────────────────────────────────────────── */

function SimAccordion({
  title,
  icon: Icon,
  items,
  answers,
  observations,
  extra,
  index,
}: {
  title: string;
  icon: typeof Heart;
  items: readonly YesNoQuestion[];
  answers: Record<string, "yes" | "no">;
  observations: Record<string, string>;
  extra?: React.ReactNode;
  index: number;
}) {
  const yesItems = items.filter((q) => answers[q.id] === "yes");
  const totalAnswered = items.filter(
    (q) => answers[q.id] !== undefined
  ).length;

  return (
    <section
      className="spell-slide-up"
      style={{ animationDelay: `${160 + index * 40}ms` }}
    >
      <Accordion defaultValue={[title]}>
        <AccordionItem
          value={title}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3.5 hover:no-underline">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Icon className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-semibold text-foreground truncate">
                {title}
              </span>
              <span
                className={cn(
                  "ml-auto inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                  yesItems.length > 0
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                )}
              >
                {yesItems.length}/{totalAnswered}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0">
            <div className="border-t border-border/60">
              {extra && (
                <div className="px-4 py-3 border-b border-border/40">
                  {extra}
                </div>
              )}
              {yesItems.length === 0 ? (
                <div className="px-4 py-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum fator relatado nesta seção.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {yesItems.map((q, i) => (
                    <YesItem
                      key={q.id}
                      index={i}
                      text={q.text}
                      observation={observations[q.id]}
                    />
                  ))}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

function YesItem({
  index,
  text,
  observation,
}: {
  index: number;
  text: string;
  observation?: string;
}) {
  const hasObs = observation && observation.trim().length > 0;
  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 px-4 py-3.5",
        "before:content-[''] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-0.5 before:rounded-r-full before:bg-destructive",
        "spell-slide-up"
      )}
      style={{ animationDelay: `${200 + index * 30}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-foreground/90 leading-relaxed flex-1 min-w-0">
          {text}
        </p>
        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
          Sim
        </span>
      </div>
      {hasObs && (
        <div className="mt-1 flex gap-2 items-start">
          <StickyNote
            aria-hidden
            className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0 mt-0.5"
          />
          <p className="text-xs text-muted-foreground italic leading-relaxed border-l-2 border-destructive/30 pl-2 flex-1 min-w-0">
            {observation}
          </p>
        </div>
      )}
    </div>
  );
}

function ExtraInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * ActivityCard
 * ────────────────────────────────────────────────────────────────────── */

function ActivityCard({
  data,
  index,
}: {
  data: FullQuestionnaireDataV2["physicalActivity"];
  index: number;
}) {
  const habituallyPracticed = SPORT_FIELDS.filter(
    (sport) => data?.sports?.[sport] === "habitualmente"
  );
  const liked = SPORT_FIELDS.filter(
    (sport) => data?.sports?.[sport] === "gosto"
  );
  const wantsTo = SPORT_FIELDS.filter(
    (sport) => data?.sports?.[sport] === "gostaria-de-fazer"
  );
  const yesActivity = ACTIVITY_QUESTIONS.filter(
    (q) => data?.answers?.[q.id] === "yes"
  );

  const preferredTime = labelOf(PREFERRED_TIME_OPTIONS, data?.preferredTime);
  const commute = labelOf(COMMUTE_OPTIONS, data?.commute);

  return (
    <section
      className="spell-slide-up rounded-2xl border border-border bg-card p-4 space-y-3"
      style={{ animationDelay: `${200 + index * 40}ms` }}
    >
      <div className="flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Atividade Física
        </h3>
      </div>

      {/* Resumo Sim/Não */}
      {yesActivity.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pratica
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {yesActivity.map((q) => {
              // pega a primeira frase relevante curta da pergunta
              return (
                <li
                  key={q.id}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                >
                  {shortLabel(q.text)}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {habituallyPracticed.length > 0 && (
        <SportPills
          label="Habitualmente"
          sports={habituallyPracticed}
          tone="destructive"
        />
      )}
      {liked.length > 0 && (
        <SportPills label="Gosta" sports={liked} tone="amber" />
      )}
      {wantsTo.length > 0 && (
        <SportPills label="Gostaria de fazer" sports={wantsTo} tone="primary" />
      )}

      {/* Horário e deslocamento */}
      {(data?.preferredTime || data?.commute) && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          {data?.preferredTime && (
            <InfoBox label="Horário preferido" value={preferredTime} />
          )}
          {data?.commute && (
            <InfoBox label="Deslocamento" value={commute} />
          )}
        </div>
      )}
    </section>
  );
}

function SportPills({
  label,
  sports,
  tone,
}: {
  label: string;
  sports: string[];
  tone: "primary" | "amber" | "destructive";
}) {
  const cls = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {sports.map((s) => (
          <span
            key={s}
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
              cls
            )}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground truncate">{value}</p>
    </div>
  );
}

/** Extrai um label curto de uma pergunta (primeiras 3 palavras). */
function shortLabel(text: string): string {
  const cleaned = text.replace(/\?$/, "").trim();
  const words = cleaned.split(/\s+/);
  return words.slice(0, 4).join(" ");
}

/* ──────────────────────────────────────────────────────────────────────
 * DietCard
 * ────────────────────────────────────────────────────────────────────── */

function DietCard({
  data,
  index,
}: {
  data: FullQuestionnaireDataV2["diet"];
  index: number;
}) {
  if (!data) return null;
  const eatingQuality = labelOf(EATING_QUALITY_OPTIONS, data.eatingQuality);
  const nutritionist = labelOf(NUTRITIONIST_OPTIONS, data.nutritionist);
  const meals = MEAL_OPTIONS.filter((m) =>
    data.mealsTaken?.includes(m.id)
  ).map((m) => m.label);

  return (
    <section
      className="spell-slide-up rounded-2xl border border-border bg-card p-4 space-y-3"
      style={{ animationDelay: `${240 + index * 40}ms` }}
    >
      <div className="flex items-center gap-2">
        <Utensils className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Dieta</h3>
      </div>

      {/* Pesos */}
      <div className="grid grid-cols-2 gap-2">
        {data.idealWeight != null && (
          <InfoBox label="Bom peso" value={`${data.idealWeight} kg`} />
        )}
        {data.currentWeight != null && (
          <InfoBox label="Atual" value={`${data.currentWeight} kg`} />
        )}
        {data.maxWeight != null && (
          <InfoBox
            label="Máximo já pesou"
            value={`${data.maxWeight} kg${
              data.maxWeightAge ? ` · ${data.maxWeightAge} anos` : ""
            }`}
          />
        )}
        {data.mealsPerDay != null && (
          <InfoBox label="Refeições/dia" value={String(data.mealsPerDay)} />
        )}
      </div>

      {/* Qualidade */}
      {data.eatingQuality && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Considera a alimentação
          </p>
          <p className="text-sm font-medium text-foreground">{eatingQuality}</p>
        </div>
      )}

      {/* Refeições realizadas */}
      {meals.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Refeições realizadas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {meals.map((m) => (
              <span
                key={m}
                className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bebida + nutricionista */}
      {(data.drinksAlcohol || data.nutritionist) && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          {data.drinksAlcohol && (
            <InfoBox
              label="Bebida alcoólica"
              value={data.drinksAlcohol === "yes" ? "Sim" : "Não"}
            />
          )}
          {data.nutritionist && (
            <InfoBox label="Acompanhamento" value={nutritionist} />
          )}
        </div>
      )}

      {/* Suplementos */}
      {data.supplements && data.supplements.trim().length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Suplementos
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {data.supplements}
          </p>
        </div>
      )}
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * ReassessmentCard
 * ────────────────────────────────────────────────────────────────────── */

function ReassessmentCard({
  data,
  index,
}: {
  data: FullQuestionnaireDataV2["reassessment"];
  index: number;
}) {
  if (!data) return null;
  const goalAchievement = labelOf(
    GOAL_ACHIEVEMENT_OPTIONS,
    data.goalAchievement
  );
  const dietAssessment = labelOf(DIET_ASSESSMENT_OPTIONS, data.dietAssessment);
  const recentFreq = labelOf(
    WEEKLY_FREQUENCY_OPTIONS,
    data.recentActivity?.weeklyFrequency
  );
  const recentIntensity = labelOf(
    INTENSITY_OPTIONS,
    data.recentActivity?.intensity
  );
  const intendedFreq = labelOf(
    WEEKLY_FREQUENCY_OPTIONS,
    data.intendedActivity?.weeklyFrequency
  );

  const hasAny =
    data.goalAchievement ||
    data.currentGoal ||
    data.recentActivity?.activity ||
    data.intendedActivity?.activity ||
    data.dietAssessment;

  if (!hasAny) return null;

  return (
    <section
      className="spell-slide-up rounded-2xl border border-border bg-card p-4 space-y-3"
      style={{ animationDelay: `${280 + index * 40}ms` }}
    >
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Reavaliação Física
        </h3>
      </div>

      {data.goalAchievement && (
        <InfoBox label="Alcance do objetivo" value={goalAchievement} />
      )}

      {data.currentGoal && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Objetivo atual
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {data.currentGoal}
          </p>
        </div>
      )}

      {(data.recentActivity?.activity ||
        data.recentActivity?.weeklyFrequency) && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Frequência recente
          </p>
          <div className="grid grid-cols-2 gap-2">
            {data.recentActivity?.activity && (
              <InfoBox
                label="Atividade"
                value={data.recentActivity.activity}
              />
            )}
            {data.recentActivity?.weeklyFrequency && (
              <InfoBox label="Frequência" value={recentFreq} />
            )}
            {data.recentActivity?.timeSpent && (
              <InfoBox
                label="Tempo gasto"
                value={data.recentActivity.timeSpent}
              />
            )}
            {data.recentActivity?.intensity && (
              <InfoBox label="Intensidade" value={recentIntensity} />
            )}
            {data.recentActivity?.duration && (
              <InfoBox
                label="Pratica há"
                value={data.recentActivity.duration}
              />
            )}
          </div>
        </div>
      )}

      {(data.intendedActivity?.activity ||
        data.intendedActivity?.weeklyFrequency) && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pretendida
          </p>
          <div className="grid grid-cols-2 gap-2">
            {data.intendedActivity?.activity && (
              <InfoBox
                label="Atividade"
                value={data.intendedActivity.activity}
              />
            )}
            {data.intendedActivity?.weeklyFrequency && (
              <InfoBox label="Frequência" value={intendedFreq} />
            )}
          </div>
        </div>
      )}

      {data.dietAssessment && (
        <InfoBox label="Alimentação no período" value={dietAssessment} />
      )}
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * SelfPerceptionCard
 * ────────────────────────────────────────────────────────────────────── */

function SelfPerceptionCard({
  data,
  index,
}: {
  data: FullQuestionnaireDataV2["selfPerception"];
  index: number;
}) {
  if (!data) return null;

  const ratings: { label: string; value: string | undefined }[] = [
    { label: "Qualidade de vida", value: data.qualityOfLife },
    { label: "Condicionamento", value: data.fitnessCondition },
    { label: "Aparência física", value: data.appearance },
    { label: "Humor", value: data.mood },
    { label: "Qualidade do sono", value: data.sleepQuality },
  ].filter((r) => r.value);

  const sleepiness = labelOf(SOMETIMES_RATING_OPTIONS, data.daytimeSleepiness);
  const rested = labelOf(SOMETIMES_RATING_OPTIONS, data.restedAfterSleep);

  const hasSleep =
    data.sleepHours != null || data.bedTime || data.wakeTime;

  if (
    ratings.length === 0 &&
    !hasSleep &&
    !data.daytimeSleepiness &&
    !data.restedAfterSleep
  )
    return null;

  return (
    <section
      className="spell-slide-up rounded-2xl border border-border bg-card p-4 space-y-3"
      style={{ animationDelay: `${320 + index * 40}ms` }}
    >
      <div className="flex items-center gap-2">
        <Moon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Autopercepção</h3>
      </div>

      {/* Ratings */}
      {ratings.length > 0 && (
        <div className="grid grid-cols-1 gap-1.5">
          {ratings.map((r) => (
            <RatingChip
              key={r.label}
              label={r.label}
              value={labelOf(RATING_OPTIONS, r.value)}
              tone={ratingTone(r.value)}
            />
          ))}
        </div>
      )}

      {/* Sono */}
      {hasSleep && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          {data.sleepHours != null && (
            <InfoBox label="Dorme" value={`${data.sleepHours} h`} />
          )}
          {data.bedTime && <InfoBox label="Dorme às" value={data.bedTime} />}
          {data.wakeTime && (
            <InfoBox label="Acorda às" value={data.wakeTime} />
          )}
        </div>
      )}

      {(data.daytimeSleepiness || data.restedAfterSleep) && (
        <div className="grid grid-cols-2 gap-2">
          {data.daytimeSleepiness && (
            <InfoBox label="Sonolência diurna" value={sleepiness} />
          )}
          {data.restedAfterSleep && (
            <InfoBox label="Descansado ao acordar" value={rested} />
          )}
        </div>
      )}
    </section>
  );
}

function RatingChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "amber" | "destructive" | "muted";
}) {
  const cls = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    destructive: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/10 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
          cls
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ratingTone(
  value: string | undefined
): "primary" | "amber" | "destructive" | "muted" {
  if (!value) return "muted";
  if (value === "excelente" || value === "bom") return "primary";
  if (value === "regular") return "amber";
  if (value === "ruim") return "destructive";
  return "muted";
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
  currentLevel: RiskBucket;
}) {
  const items: {
    level: RiskBucket;
    label: string;
    desc: string;
    tone: string;
    bg: string;
  }[] = FINAL_REPORT_OPTIONS.map((opt) => {
    const bucket = classifyByConclusion(opt.value);
    const cfg = {
      clean: {
        label: "Liberação Total",
        tone: "text-primary",
        bg: "bg-primary/10 border-primary/30",
      },
      minor: {
        label: "Atenção Pontual",
        tone: "text-amber-600 dark:text-amber-300",
        bg: "bg-amber-500/10 border-amber-500/30",
      },
      major: {
        label: "Restrições Elevadas",
        tone: "text-destructive",
        bg: "bg-destructive/10 border-destructive/30",
      },
      critical: {
        label: "Avaliação Médica",
        tone: "text-destructive",
        bg: "bg-destructive/15 border-destructive/40",
      },
      pending: {
        label: "Pendente",
        tone: "text-muted-foreground",
        bg: "bg-muted/30 border-border/40",
      },
    }[bucket];
    return {
      level: bucket,
      label: cfg.label,
      desc: opt.label,
      tone: cfg.tone,
      bg: cfg.bg,
    };
  });

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      srOnlyTitle="Conclusões clínicas do questionário completo"
      srOnlyDescription="Explicação detalhada de cada nível de classificação."
    >
      <div className="px-1 pt-2 pb-1">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Conclusões do Laudo Final
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          A classificação é baseada na conclusão registrada pelo profissional
          ao revisar todas as respostas do questionário.
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
 * Helpers visuais compartilhados
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

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}

/* ──────────────────────────────────────────────────────────────────────
 * CSS — design spells (compartilhado com as demais views)
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
