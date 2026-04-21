"use client";

/**
 * ParqView — modo leitura do PAR-Q+ (mobile-first, com "design spells").
 *
 * Micro-interações (CSS-only, GPU-accelerated, respeita prefers-reduced-motion):
 *   • Hero risk card com gradient mesh + aura pulsante por trás do ícone
 *   • Risk gauge (3 segmentos) com bolinha que desliza até a posição correta
 *   • Stats strip com count-up animado
 *   • Declaração com assinatura em SVG "desenhada à mão" (stroke draw-in)
 *   • Version badge com ícone micro-animado
 *   • Primary rows com borda colorida + tap spring
 *   • Bottom bar elevada com borda-gradient + botões com ripple suave
 *
 * Design spells-safe: nenhuma animação bloqueia leitura, tudo < 60fps target,
 * tudo pode ser desativado via prefers-reduced-motion.
 */

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Pencil,
  Plus,
  History,
  ClipboardCheck,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAB } from "@/components/mobile/fab";
import { cn } from "@/lib/utils";
import {
  PARQ_PLUS_SCREENING,
  type ParqAnswer,
  type ParqPlusData,
} from "@/lib/data/parq-plus";
import { renderRichText } from "./rich-text";
import { ParqAnswersSheet } from "./parq-answers-sheet";
import { ParqHistorySheet } from "./parq-history-sheet";

type Risk = "low" | "moderate" | "high";

interface ParqViewProps {
  data: ParqPlusData;
  onEdit: () => void;
  onStartNew: () => void;
}

export function ParqView({ data, onEdit, onStartNew }: ParqViewProps) {
  const [answersOpen, setAnswersOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const risk: Risk = data.riskLevel ?? "low";
  const completedAt = data.completedAt ? new Date(data.completedAt) : null;

  const history = data.history ?? [];
  const historyCount = history.length;
  const versionNumber = historyCount + 1;

  const screeningQs = useMemo(
    () => PARQ_PLUS_SCREENING.flatMap((s) => s.questions),
    []
  );

  /* Stats — conta respostas da triagem */
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

  return (
    <div className="relative pb-[calc(7rem+env(safe-area-inset-bottom))]">
      {/* Keyframes locais — design spells */}
      <style>{SPELLS_CSS}</style>

      <div className="px-4 py-4 space-y-4">
        {/* ✨ HERO — Risk card */}
        <HeroRiskCard risk={risk} stats={stats} />

        {/* ✨ Stats strip */}
        <StatsStrip yes={stats.yes} no={stats.no} total={stats.total} />

        {/* Declaração do Aluno — com assinatura animada */}
        <DeclarationCard completedAt={completedAt} />

        {/* Version + histórico */}
        <VersionCard
          versionNumber={versionNumber}
          historyCount={historyCount}
          onOpenHistory={() => setHistoryOpen(true)}
        />

        {/* Respostas primárias */}
        <section className="spell-slide-up" style={{ animationDelay: "160ms" }}>
          <Accordion defaultValue={["primary"]}>
            <AccordionItem
              value="primary"
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3.5 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Respostas Primárias
                  </span>
                  <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {stats.total}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <div className="divide-y divide-border/60 border-t border-border/60">
                  {screeningQs.map((q, i) => (
                    <PrimaryRow
                      key={q.id}
                      index={i}
                      questionText={q.text}
                      answer={data.answers?.[q.id] ?? null}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* CTAs secundários — grid lado a lado */}
        <div
          className="spell-slide-up grid grid-cols-2 gap-2"
          style={{ animationDelay: "200ms" }}
        >
          <SecondaryAction
            icon={Eye}
            label="Ver respostas"
            onClick={() => setAnswersOpen(true)}
          />
          <SecondaryAction
            icon={Pencil}
            label="Editar respostas"
            onClick={onEdit}
          />
        </div>
      </div>

      {/* ✨ FAB — ação primária: gerar nova avaliação PAR-Q+ */}
      <FAB
        icon={Plus}
        onClick={onStartNew}
        label="Nova avaliação PAR-Q+"
      />

      {/* Sheets */}
      <ParqAnswersSheet
        open={answersOpen}
        onOpenChange={setAnswersOpen}
        answers={data.answers ?? {}}
        followUpOptions={data.followUpOptions ?? {}}
        followUpText={data.followUpText ?? {}}
      />
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
 * HERO — Risk card com aura pulsante e gauge deslizante
 * ────────────────────────────────────────────────────────────────────── */

function HeroRiskCard({ risk, stats }: { risk: Risk; stats: { yes: number; no: number; total: number } }) {
  const config = {
    low: {
      Icon: ShieldCheck,
      title: "Liberado para Atividade Física",
      desc: "Com base nas respostas, o aluno está apto a iniciar ou manter um programa de exercícios físicos sem necessidade de avaliação médica prévia.",
      tone: "text-primary",
      bg: "from-primary/10 via-primary/5 to-transparent",
      ring: "ring-primary/25",
      aura: "bg-primary/30",
      label: "Risco Baixo",
      gaugeIdx: 0,
    },
    moderate: {
      Icon: AlertTriangle,
      title: "Cautela Recomendada",
      desc: "Algumas condições foram relatadas. Recomenda-se avaliação adicional antes de atividades de alta intensidade.",
      tone: "text-amber-500 dark:text-amber-300",
      bg: "from-amber-500/15 via-amber-500/5 to-transparent",
      ring: "ring-amber-500/25",
      aura: "bg-amber-500/30",
      label: "Risco Moderado",
      gaugeIdx: 1,
    },
    high: {
      Icon: AlertTriangle,
      title: "Avaliação Médica Necessária",
      desc: "É fortemente recomendável que o aluno consulte um médico antes de iniciar ou aumentar significativamente sua atividade física.",
      tone: "text-destructive",
      bg: "from-destructive/15 via-destructive/5 to-transparent",
      ring: "ring-destructive/25",
      aura: "bg-destructive/30",
      label: "Risco Alto",
      gaugeIdx: 2,
    },
  }[risk];

  return (
    <section
      className={cn(
        "spell-slide-up relative overflow-hidden rounded-2xl border p-5",
        "bg-gradient-to-br",
        config.bg,
        "border-border/60"
      )}
      role="status"
      aria-live="polite"
      style={{ animationDelay: "0ms" }}
    >
      {/* Grain/mesh sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, currentColor 1px, transparent 1px), radial-gradient(circle at 80% 60%, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px, 32px 32px",
        }}
      />

      <div className="relative flex items-start gap-4">
        {/* Ícone com aura pulsante */}
        <div className="relative shrink-0">
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-2xl blur-xl spell-pulse",
              config.aura
            )}
          />
          <div
            className={cn(
              "relative flex h-12 w-12 items-center justify-center rounded-2xl",
              "bg-background/60 backdrop-blur ring-1",
              config.ring
            )}
          >
            <config.Icon className={cn("h-6 w-6 spell-icon-in", config.tone)} />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <p className={cn("text-[11px] font-bold uppercase tracking-widest", config.tone)}>
            {config.label}
          </p>
          <h2 className="text-[15px] font-semibold text-foreground leading-tight">
            {config.title}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
            {config.desc}
          </p>
        </div>
      </div>

      {/* Gauge de 3 segmentos */}
      <div className="relative mt-5">
        <div className="flex items-center gap-1.5">
          <GaugeSegment active={config.gaugeIdx >= 0} activeTone="primary" current={config.gaugeIdx === 0} />
          <GaugeSegment active={config.gaugeIdx >= 1} activeTone="amber" current={config.gaugeIdx === 1} />
          <GaugeSegment active={config.gaugeIdx >= 2} activeTone="destructive" current={config.gaugeIdx === 2} />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
          <span className={cn(config.gaugeIdx === 0 && "text-primary")}>Baixo</span>
          <span className={cn(config.gaugeIdx === 1 && "text-amber-500 dark:text-amber-300")}>
            Moderado
          </span>
          <span className={cn(config.gaugeIdx === 2 && "text-destructive")}>Alto</span>
        </div>
      </div>

      {/* TrendingUp decorativo mini */}
      <div className="relative mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Triagem inicial</span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground/80">
          <TrendingUp className="h-3 w-3" />
          <CountUp value={stats.yes} /> Sim · <CountUp value={stats.no} /> Não
        </span>
      </div>
    </section>
  );
}

function GaugeSegment({
  active,
  activeTone,
  current,
}: {
  active: boolean;
  activeTone: "primary" | "amber" | "destructive";
  current: boolean;
}) {
  const toneCls = {
    primary: "bg-primary",
    amber: "bg-amber-500",
    destructive: "bg-destructive",
  }[activeTone];

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
 * Stats strip com count-up
 * ────────────────────────────────────────────────────────────────────── */

function StatsStrip({ yes, no, total }: { yes: number; no: number; total: number }) {
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
    muted: "text-muted-foreground border-border bg-card",
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

/* Count-up: mini animação numérica (400ms) sem dependências */
function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return setN(value);
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || value === 0) return setN(value);
    const start = performance.now();
    const duration = 500;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}</>;
}

/* ──────────────────────────────────────────────────────────────────────
 * Declaração — com assinatura desenhada
 * ────────────────────────────────────────────────────────────────────── */

function DeclarationCard({ completedAt }: { completedAt: Date | null }) {
  return (
    <section
      className="spell-slide-up rounded-2xl border border-border bg-card p-4 space-y-3"
      style={{ animationDelay: "100ms" }}
    >
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Declaração do Aluno
        </h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Declaro que li e compreendi o questionário e que as informações
        prestadas são verdadeiras e completas. Estou ciente das recomendações
        de saúde.
      </p>

      {/* Assinatura SVG animada */}
      <div className="flex items-end justify-between gap-3 pt-2 border-t border-border/50">
        <div className="flex flex-col gap-0.5">
          <svg
            width="140"
            height="32"
            viewBox="0 0 140 32"
            fill="none"
            className="text-primary"
            aria-hidden
          >
            <path
              d="M4 22 Q 14 4, 28 18 T 52 20 Q 66 6, 80 22 T 110 18 L 130 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              className="spell-signature"
              pathLength={1}
            />
          </svg>
          <span className="text-[10px] text-muted-foreground/70 uppercase tracking-widest">
            Assinatura digital
          </span>
        </div>
        {completedAt && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              Registrado em
            </p>
            <p className="text-xs font-semibold text-foreground tabular-nums">
              {completedAt.toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Version card
 * ────────────────────────────────────────────────────────────────────── */

function VersionCard({
  versionNumber,
  historyCount,
  onOpenHistory,
}: {
  versionNumber: number;
  historyCount: number;
  onOpenHistory: () => void;
}) {
  const hasHistory = historyCount > 0;
  return (
    <section
      className={cn(
        "spell-slide-up flex items-center justify-between gap-3 rounded-xl px-3 py-2.5",
        "border border-border/60",
        hasHistory
          ? "bg-gradient-to-r from-primary/5 to-transparent"
          : "bg-muted/30"
      )}
      style={{ animationDelay: "120ms" }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="relative inline-flex shrink-0 items-center">
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-full blur-sm",
              hasHistory ? "bg-primary/30 spell-pulse" : "bg-transparent"
            )}
          />
          <span className="relative inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
            v{versionNumber}
          </span>
        </span>
        <p className="text-xs text-muted-foreground truncate">
          {hasHistory
            ? `${historyCount} ${historyCount === 1 ? "versão anterior" : "versões anteriores"}`
            : "Primeira avaliação registrada"}
        </p>
      </div>
      {hasHistory && (
        <button
          type="button"
          onClick={onOpenHistory}
          className={cn(
            "group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5",
            "text-xs font-semibold text-primary",
            "bg-primary/10 hover:bg-primary/15 active:scale-[0.97] transition"
          )}
        >
          <History className="h-3.5 w-3.5 transition-transform group-hover:-rotate-12" />
          Histórico
        </button>
      )}
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Primary row — com borda colorida lateral + spring no tap
 * ────────────────────────────────────────────────────────────────────── */

function PrimaryRow({
  questionText,
  answer,
  index,
}: {
  questionText: string;
  answer: ParqAnswer;
  index: number;
}) {
  const sideCls =
    answer === "yes"
      ? "before:bg-destructive"
      : answer === "no"
      ? "before:bg-primary"
      : "before:bg-border";

  return (
    <div
      className={cn(
        "relative flex items-start justify-between gap-3 px-4 py-3.5",
        "before:content-[''] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-0.5 before:rounded-r-full",
        sideCls,
        "transition-colors active:bg-muted/40",
        "spell-slide-up"
      )}
      style={{ animationDelay: `${200 + index * 40}ms` }}
    >
      <p className="text-sm text-foreground/90 leading-relaxed flex-1 min-w-0">
        {renderRichText(questionText)}
      </p>
      {answer === "yes" && (
        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
          Sim
        </span>
      )}
      {answer === "no" && (
        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
          <CheckCircle2 className="h-3 w-3" />
          Não
        </span>
      )}
      {answer == null && (
        <span className="shrink-0 text-xs text-muted-foreground/60">—</span>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Secondary action — botão ghost com shimmer sweep, usado em grid 2-col
 * ────────────────────────────────────────────────────────────────────── */

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
 * CSS — design spells (keyframes locais)
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

@keyframes spell-pulse {
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50%      { opacity: 0.6;  transform: scale(1.08); }
}
.spell-pulse {
  animation: spell-pulse 2.8s ease-in-out infinite;
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

@keyframes spell-sig-draw {
  from { stroke-dashoffset: 1; }
  to   { stroke-dashoffset: 0; }
}
.spell-signature {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: spell-sig-draw 1400ms cubic-bezier(0.65, 0, 0.35, 1) 300ms forwards;
}

@media (prefers-reduced-motion: reduce) {
  .spell-slide-up,
  .spell-pulse,
  .spell-shimmer,
  .spell-icon-in,
  .spell-signature {
    animation: none !important;
  }
  .spell-signature { stroke-dashoffset: 0 !important; }
}
`;
