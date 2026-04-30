"use client";

/**
 * ParqView — modo leitura do PAR-Q+ (padrão unificado do design system).
 *
 * Mantém a família visual de Coronário/Framingham/Avançado/Completo:
 *   • Hero "Vital Ring 144px" classificando o risco (low/moderate/high)
 *   • Anéis decorativos rotacionando + aura heartbeat
 *   • ECG signature + constelação de partículas
 *   • Risk meter 3 segmentos (Liberado / Cautela / Avaliação Médica)
 *   • Stats strip — Sim / Não / Total da Etapa 1
 *   • Versão + acesso ao histórico (preserva ParqHistorySheet)
 *   • Accordion "Respostas Primárias" — Etapa 1 (7 perguntas) com badges
 *   • Accordion por seção da Etapa 2 — só as visíveis (gate respondido).
 *     Sub-perguntas Sim aparecem com observação inline (texto livre) +
 *     chips de checkboxes selecionados.
 *   • Drawer explicativo das 3 faixas
 *   • CTA único "Editar respostas" + FAB "Nova avaliação"
 *
 * Migração: removido "Ver respostas" (drawer) que existia antes —
 * agora toda a informação salva está visível inline.
 */

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ClipboardList,
  Eye,
  HelpCircle,
  HeartPulse,
  History,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  StickyNote,
  TrendingUp,
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
  PARQ_PLUS_SCREENING,
  PARQ_PLUS_SECTIONS,
  type ParqAnswer,
  type ParqPlusData,
  type ParqQuestion,
} from "@/lib/data/parq-plus";
import { renderRichText } from "./rich-text";
import { ParqHistorySheet } from "./parq-history-sheet";

interface ParqViewProps {
  data: ParqPlusData;
  onEdit: () => void;
  onStartNew: () => void;
}

type RiskLevel = "low" | "moderate" | "high";

export function ParqView({ data, onEdit, onStartNew }: ParqViewProps) {
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const risk: RiskLevel = data.riskLevel ?? "low";
  const completedAt = data.completedAt ? new Date(data.completedAt) : null;

  const history = data.history ?? [];
  const historyCount = history.length;
  const versionNumber = historyCount + 1;

  const screeningQs = useMemo(
    () => PARQ_PLUS_SCREENING.flatMap((s) => s.questions),
    []
  );

  /* Stats da Etapa 1 */
  const stats = useMemo(() => {
    let yes = 0;
    let no = 0;
    for (const q of screeningQs) {
      const a = data.answers?.[q.id];
      if (a === "yes") yes++;
      else if (a === "no") no++;
    }
    return { yes, no, total: screeningQs.length };
  }, [data.answers, screeningQs]);

  /* Seções da Etapa 2 com gate respondido */
  const visibleSections = useMemo(
    () =>
      PARQ_PLUS_SECTIONS.filter(
        (s) => data.answers?.[s.gate.id] !== undefined
      ),
    [data.answers]
  );

  const totalSubYes = useMemo(() => {
    let count = 0;
    for (const sec of PARQ_PLUS_SECTIONS) {
      if (data.answers?.[sec.gate.id] !== "yes") continue;
      for (const q of sec.subQuestions) {
        if (data.answers?.[q.id] === "yes") count++;
      }
    }
    return count;
  }, [data.answers]);

  return (
    <div className="relative pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <style>{SPELLS_CSS}</style>

      <div className="px-4 py-4 space-y-4">
        {/* Hero VitalRing */}
        <HeroParqCard
          risk={risk}
          stats={stats}
          totalSubYes={totalSubYes}
          onOpenExplainer={() => setExplainerOpen(true)}
        />

        {/* Stats strip */}
        <StatsStrip yes={stats.yes} no={stats.no} total={stats.total} />

        {/* Timestamp + versão */}
        <section
          className="spell-slide-up flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 gap-2"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
              v{versionNumber}
            </span>
            <p className="text-xs text-muted-foreground truncate">
              {historyCount === 0
                ? "Primeira avaliação registrada"
                : `${historyCount} ${historyCount === 1 ? "avaliação anterior" : "avaliações anteriores"}`}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {historyCount > 0 && (
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <History className="h-3.5 w-3.5" />
                Histórico
              </button>
            )}
            {completedAt && (
              <p className="text-xs font-semibold text-foreground tabular-nums">
                {completedAt.toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </section>

        {/* Accordion Etapa 1 — Respostas Primárias */}
        <section
          className="spell-slide-up"
          style={{ animationDelay: "160ms" }}
        >
          <Accordion defaultValue={["primary"]}>
            <AccordionItem
              value="primary"
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3.5 hover:no-underline">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <ClipboardList className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-semibold text-foreground truncate">
                    Respostas Primárias
                  </span>
                  <span
                    className={cn(
                      "ml-auto inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                      stats.yes > 0
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {stats.yes}/{stats.total}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <div className="divide-y divide-border/60 border-t border-border/60">
                  {screeningQs.map((q, i) => (
                    <ScreeningRow
                      key={q.id}
                      index={i}
                      question={q}
                      answer={data.answers?.[q.id] ?? null}
                      checkboxes={data.followUpOptions?.[q.id] ?? []}
                      observation={data.followUpText?.[q.id] ?? ""}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Accordions Etapa 2 — uma por seção respondida */}
        {visibleSections.map((section, i) => (
          <SectionAccordion
            key={section.id}
            section={section}
            answers={data.answers ?? {}}
            followUpText={data.followUpText ?? {}}
            index={i}
          />
        ))}

        {/* CTA secundário único */}
        <div
          className="spell-slide-up grid grid-cols-1 gap-2"
          style={{ animationDelay: "260ms" }}
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
        label="Nova avaliação PAR-Q+"
      />

      {/* Drawer explicativo */}
      <RiskExplainerSheet
        open={explainerOpen}
        onOpenChange={setExplainerOpen}
        currentLevel={risk}
      />

      {/* Drawer histórico (preservado) */}
      {historyCount > 0 && (
        <ParqHistorySheet
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          entries={history}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Hero VitalRing
 * ────────────────────────────────────────────────────────────────────── */

function HeroParqCard({
  risk,
  stats,
  totalSubYes,
  onOpenExplainer,
}: {
  risk: RiskLevel;
  stats: { yes: number; no: number; total: number };
  totalSubYes: number;
  onOpenExplainer: () => void;
}) {
  const config = {
    low: {
      Icon: ShieldCheck,
      label: "Liberado para Atividade Física",
      desc: "Com base nas respostas, o aluno está apto a iniciar ou manter um programa de exercícios sem necessidade de avaliação médica prévia.",
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
      label: "Cautela Recomendada",
      desc: "Algumas condições foram relatadas. Recomenda-se avaliação adicional antes de atividades de alta intensidade.",
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
      label: "Avaliação Médica Necessária",
      desc: "É fortemente recomendável que o aluno consulte um médico antes de iniciar ou aumentar significativamente sua atividade física.",
      tone: "text-destructive",
      bg: "from-destructive/15 via-destructive/5 to-transparent",
      ring: "ring-destructive/25",
      aura: "bg-destructive/30",
      ecg: "text-destructive",
      arc: "var(--color-destructive)",
      gaugeIdx: 2,
    },
  }[risk];

  const totalYesAll = stats.yes + totalSubYes;

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
          yes={stats.yes}
          total={stats.total}
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
            Liberado
          </span>
          <span
            className={cn(
              config.gaugeIdx === 1 && "text-amber-500 dark:text-amber-300"
            )}
          >
            Cautela
          </span>
          <span className={cn(config.gaugeIdx === 2 && "text-destructive")}>
            Médico
          </span>
        </div>
      </div>

      {/* Score resumo */}
      <div className="relative mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <HeartPulse className="h-3 w-3 text-destructive/70" />
          Total de respostas Sim
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground/90 tabular-nums">
          <TrendingUp className="h-3 w-3" />
          <CountUp value={totalYesAll} />
        </span>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * VitalRing 144px
 * ────────────────────────────────────────────────────────────────────── */

function VitalRing({
  yes,
  total,
  color,
  toneClass,
  auraClass,
  ringClass,
  children,
}: {
  yes: number;
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
  const pct = total > 0 ? yes / total : 0;

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
              <CountUp value={yes} />
            </span>
            <span className="text-xl font-bold ml-1 opacity-60">
              /{total}
            </span>
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
            {children}
            <span>respostas Sim</span>
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
  yes,
  no,
  total,
}: {
  yes: number;
  no: number;
  total: number;
}) {
  return (
    <div
      className="spell-slide-up grid grid-cols-3 gap-2"
      style={{ animationDelay: "60ms" }}
    >
      <StatChip label="Sim" value={yes} tone="destructive" />
      <StatChip label="Não" value={no} tone="primary" />
      <StatChip label="Total" value={total} tone="muted" />
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
 * ScreeningRow — pergunta da Etapa 1 com badge + follow-ups inline
 * ────────────────────────────────────────────────────────────────────── */

function ScreeningRow({
  index,
  question,
  answer,
  checkboxes,
  observation,
}: {
  index: number;
  question: ParqQuestion;
  answer: ParqAnswer;
  checkboxes: string[];
  observation: string;
}) {
  const sideCls =
    answer === "yes"
      ? "before:bg-destructive"
      : answer === "no"
        ? "before:bg-primary"
        : "before:bg-border";

  const hasChips = checkboxes && checkboxes.length > 0;
  const hasObs = observation && observation.trim().length > 0;
  const hasFollowUps = answer === "yes" && (hasChips || hasObs);

  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 px-4 py-3.5",
        "before:content-[''] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-0.5 before:rounded-r-full",
        sideCls,
        "transition-colors active:bg-muted/40",
        "spell-slide-up"
      )}
      style={{ animationDelay: `${200 + index * 30}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-foreground/90 leading-relaxed flex-1 min-w-0">
          {renderRichText(question.text)}
        </p>
        <AnswerBadge answer={answer} />
      </div>
      {hasFollowUps && (
        <div className="flex flex-col gap-1.5 pt-1">
          {hasChips && (
            <div className="flex flex-wrap gap-1.5">
              {checkboxes.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
          {hasObs && (
            <div className="flex gap-2 items-start">
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
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * SectionAccordion — uma seção da Etapa 2
 * ────────────────────────────────────────────────────────────────────── */

function SectionAccordion({
  section,
  answers,
  followUpText,
  index,
}: {
  section: (typeof PARQ_PLUS_SECTIONS)[number];
  answers: Record<string, ParqAnswer>;
  followUpText: Record<string, string>;
  index: number;
}) {
  const gateAnswer = answers[section.gate.id];
  const isOpen = gateAnswer === "yes";
  const yesCount = isOpen
    ? section.subQuestions.filter((q) => answers[q.id] === "yes").length
    : 0;
  const totalSubs = section.subQuestions.length;

  return (
    <section
      className="spell-slide-up"
      style={{ animationDelay: `${220 + index * 40}ms` }}
    >
      <Accordion defaultValue={isOpen ? [section.id] : []}>
        <AccordionItem
          value={section.id}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3.5 hover:no-underline">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">
                {section.title}
              </span>
              <span
                className={cn(
                  "ml-auto inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                  isOpen
                    ? yesCount > 0
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isOpen ? `${yesCount}/${totalSubs}` : "Não"}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0">
            <div className="border-t border-border/60">
              {/* Gate */}
              <div className="px-4 py-3 border-b border-border/40">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-foreground/90 leading-relaxed flex-1 min-w-0">
                    {renderRichText(section.gate.text)}
                  </p>
                  <AnswerBadge answer={gateAnswer ?? null} />
                </div>
              </div>

              {/* Sub-perguntas (só quando gate = Sim) */}
              {isOpen ? (
                <div className="divide-y divide-border/60">
                  {section.subQuestions.map((q, i) => (
                    <SubQuestionRow
                      key={q.id}
                      index={i}
                      question={q}
                      answer={answers[q.id] ?? null}
                      observation={followUpText[q.id] ?? ""}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Sem desdobramentos para esta seção.
                  </p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

function SubQuestionRow({
  index,
  question,
  answer,
  observation,
}: {
  index: number;
  question: ParqQuestion;
  answer: ParqAnswer;
  observation: string;
}) {
  const sideCls =
    answer === "yes"
      ? "before:bg-destructive"
      : answer === "no"
        ? "before:bg-primary"
        : "before:bg-border";
  const hasObs =
    answer === "yes" && observation && observation.trim().length > 0;

  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 px-4 py-3",
        "before:content-[''] before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-0.5 before:rounded-r-full",
        sideCls,
        "spell-slide-up"
      )}
      style={{ animationDelay: `${260 + index * 25}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-foreground/90 leading-relaxed flex-1 min-w-0">
          {renderRichText(question.text)}
        </p>
        <AnswerBadge answer={answer} />
      </div>
      {hasObs && (
        <div className="flex gap-2 items-start mt-0.5">
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

function AnswerBadge({ answer }: { answer: ParqAnswer }) {
  if (answer === "yes") {
    return (
      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
        Sim
      </span>
    );
  }
  if (answer === "no") {
    return (
      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
        Não
      </span>
    );
  }
  return <span className="shrink-0 text-xs text-muted-foreground/60">—</span>;
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
  currentLevel: RiskLevel;
}) {
  const items: {
    level: RiskLevel;
    label: string;
    range: string;
    desc: string;
    tone: string;
    bg: string;
  }[] = [
    {
      level: "low",
      label: "Liberado",
      range: "0 respostas Sim na Etapa 1",
      desc: "Cliente apto para programa de exercícios sem necessidade de avaliação médica adicional.",
      tone: "text-primary",
      bg: "bg-primary/10 border-primary/30",
    },
    {
      level: "moderate",
      label: "Cautela",
      range: "Sim na Etapa 1 sem desdobramentos críticos",
      desc: "Recomenda-se avaliação adicional antes de atividades de alta intensidade.",
      tone: "text-amber-600 dark:text-amber-300",
      bg: "bg-amber-500/10 border-amber-500/30",
    },
    {
      level: "high",
      label: "Avaliação Médica",
      range: "Sub-questões da Etapa 2 com Sim",
      desc: "Encaminhamento médico antes de iniciar ou alterar significativamente o programa de exercícios.",
      tone: "text-destructive",
      bg: "bg-destructive/10 border-destructive/30",
    },
  ];

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      srOnlyTitle="Faixas de risco PAR-Q+"
      srOnlyDescription="Explicação detalhada de cada classificação."
    >
      <div className="px-1 pt-2 pb-1">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Faixas de classificação
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Classificação oficial do PAR-Q+ baseada na presença de respostas
          Sim na triagem (Etapa 1) e nos desdobramentos (Etapa 2).
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
 * Helpers visuais compartilhados (mesmo padrão das demais views)
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
