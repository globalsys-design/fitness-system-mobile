"use client";

/**
 * ObjectiveView — Visualização read-only dos objetivos preenchidos.
 *
 * Design Spells aplicados (tudo CSS/GPU, zero libs):
 *
 *  ✦ Aurora behind radar
 *     Um conic-gradient sutil girando ~24s atrás do radar. Dá sensação
 *     de "vida" no hero sem distrair. GPU-only (transform: rotate).
 *
 *  ✦ Top objective crown
 *     Se existe um objetivo com rating=4, ele vira hero acima do radar
 *     com pill "Prioridade máxima" + pulse animado. O resto do radar
 *     serve de contexto.
 *
 *  ✦ Progress bars com fill 0→target no mount
 *     useState inicializa em 0 e useEffect seta o valor real, usando
 *     `transition-all` do Progress pra animar. Stagger de 60ms entre
 *     barras cria o efeito de "abrir em cascata".
 *
 *  ✦ Intensity chip com 4 dots
 *     Troca o texto puro por 4 bolinhas preenchidas proporcionais +
 *     label. Mais tátil, mais scan-able, vira "assinatura visual" da
 *     escala 0-4 em todo sistema.
 *
 *  ✦ Edit pencil com scribble
 *     Rotaciona -12deg + shadow glow no active. Sensação de "rabiscar".
 *
 *  ✦ Sparkle twinkle
 *     Animação infinita sutil (scale 1→1.15) no ícone do contador.
 *
 *  ✦ Weekday strip compacto
 *     Em vez de lista vertical, mostra os 7 dias lado-a-lado. Dias
 *     ativos ganham fill primary + duração abaixo em caption.
 *
 *  ✦ Category "fire" quando todos 4/4
 *     Header da categoria ganha glow ring quando todos os objetivos
 *     estão em 4. Pequeno reward pelo preenchimento máximo.
 */

import { useEffect, useState } from "react";
import { Sparkles, Crown, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ObjectiveRadar } from "./objective-radar";
import { EditIconButton } from "@/components/users/client-detail";
import {
  WeekdayStrip,
  WEEKDAYS_MON_FIRST_SHORT,
} from "@/components/ui/weekday-strip";
import { cn } from "@/lib/utils";

export interface ObjectiveCategory {
  title: string;
  items: string[];
}

interface ObjectiveViewProps {
  categories: ObjectiveCategory[];
  goals: Record<string, number>; // rating 0..4
  availability: Record<string, string | null>;
  onEdit: () => void;
}

const INTENSITY_LABEL: Record<number, string> = {
  1: "Baixo",
  2: "Moderado",
  3: "Alto",
  4: "Muito alto",
};

// Label curto pra ponta do radar (categoria extensa não cabe).
const CATEGORY_SHORT: Record<string, string> = {
  "Performance e Condicionamento": "Performance",
  "Estética e Composição Corporal": "Estética",
  "Saúde e Bem-estar": "Saúde",
  "Reabilitação e Prevenção": "Reabilitação",
  "Lazer e Social": "Lazer",
};

/**
 * Spell: 4-dot intensity visualization.
 * Substitui texto de intensidade por 4 bolinhas — scan visual instantâneo.
 */
function IntensityDots({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Nota ${rating} de 4`}>
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={cn(
            "size-1.5 rounded-full transition-colors duration-300",
            n <= rating ? "bg-primary" : "bg-border"
          )}
          style={{
            transitionDelay: n <= rating ? `${n * 60}ms` : "0ms",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Spell: Progress animado 0 → target no mount.
 * Stagger de `delay`ms cria a cascata.
 */
function AnimatedProgress({
  target,
  delay = 0,
}: {
  target: number;
  delay?: number;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setV(target), 80 + delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return <Progress value={v} />;
}

export function ObjectiveView({
  categories,
  goals,
  availability,
  onEdit,
}: ObjectiveViewProps) {
  // Médias por categoria, normalizadas em 0..1.
  const radarValues = categories.map((cat) => {
    const ratings = cat.items.map((i) => goals[i] ?? 0);
    const avg = ratings.reduce((a, b) => a + b, 0) / (ratings.length || 1);
    return avg / 4;
  });
  const radarLabels = categories.map((c) => CATEGORY_SHORT[c.title] ?? c.title);

  const totalFilled = Object.values(goals).filter((v) => v > 0).length;
  const totalObjectives = categories.reduce((acc, c) => acc + c.items.length, 0);

  // Top objective: maior rating (desempate: primeiro da ordem das categorias).
  const topObjective = (() => {
    let best: { label: string; rating: number } | null = null;
    for (const cat of categories) {
      for (const item of cat.items) {
        const r = goals[item] ?? 0;
        if (r > 0 && (!best || r > best.rating)) {
          best = { label: item, rating: r };
        }
      }
    }
    return best;
  })();

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Cabeçalho com edit spell */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Objetivos e Disponibilidade
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            {/* Sparkle twinkle — pulso infinito, quase imperceptível mas vivo. */}
            <Sparkles
              className="size-3 text-primary"
              style={{
                animation: "twinkle 2.4s ease-in-out infinite",
              }}
            />
            {totalFilled} de {totalObjectives} objetivos preenchidos
          </p>
        </div>
        <EditIconButton onClick={onEdit} label="Editar objetivos" />
      </div>

      {/* HERO RADAR com Aurora + Top Objective Crown */}
      <div className="relative rounded-2xl border border-border bg-card p-4 flex flex-col items-center gap-3 overflow-hidden animate-in fade-in duration-500">
        {/* Aurora: conic gradient girando lentamente por baixo de tudo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 55%, transparent 0deg, var(--color-primary)/0 70deg, oklch(from var(--color-primary) l c h / 0.18) 180deg, var(--color-primary)/0 290deg, transparent 360deg)",
            animation: "aurora-spin 24s linear infinite",
            filter: "blur(30px)",
          }}
        />
        {/* Grid radial suave atrás do radar */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, var(--color-foreground) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />

        {/* Crown — só aparece se algum objetivo está em rating 4 */}
        {topObjective && topObjective.rating === 4 && (
          <div
            className="relative z-10 flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-500"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full",
                "bg-primary/10 border border-primary/30",
                "text-[10px] font-bold uppercase tracking-wider text-primary"
              )}
              style={{ animation: "pulse-ring 2.8s ease-in-out infinite" }}
            >
              <Crown className="size-3" />
              Prioridade máxima
            </div>
            <p className="text-sm font-semibold text-foreground text-center max-w-[260px] truncate">
              {topObjective.label}
            </p>
          </div>
        )}

        <div className="relative z-10">
          <ObjectiveRadar values={radarValues} labels={radarLabels} />
        </div>

        <p className="relative z-10 text-[11px] text-muted-foreground text-center max-w-[240px]">
          Média de relevância por categoria (0 a 4)
        </p>
      </div>

      {/* Categorias com objetivos relevantes (> 0) */}
      <div className="flex flex-col gap-5">
        {categories.map((cat, idx) => {
          const active = cat.items
            .map((item) => ({ item, rating: goals[item] ?? 0 }))
            .filter((x) => x.rating > 0)
            .sort((a, b) => b.rating - a.rating);

          if (active.length === 0) return null;

          // Spell: categoria em fogo quando todos items estão em 4.
          const allMax =
            cat.items.length > 0 &&
            cat.items.every((item) => (goals[item] ?? 0) === 4);

          return (
            <div
              key={cat.title}
              className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
              style={{ animationDelay: `${idx * 70}ms` }}
            >
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 transition-colors duration-300",
                    allMax ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {allMax && (
                    <Flame
                      className="size-3.5 text-primary"
                      style={{ animation: "flame 1.6s ease-in-out infinite" }}
                    />
                  )}
                  {cat.title}
                </h4>
                <span
                  className={cn(
                    "text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full border transition-all duration-300",
                    allMax
                      ? "text-primary-foreground border-primary bg-primary shadow-[0_0_0_3px_oklch(from_var(--color-primary)_l_c_h/0.2)]"
                      : "text-primary border-primary/30 bg-primary/10"
                  )}
                >
                  {active.length}
                </span>
              </div>

              <div
                className={cn(
                  "flex flex-col rounded-xl border bg-card overflow-hidden transition-shadow duration-500",
                  allMax
                    ? "border-primary/40 shadow-[0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.15)]"
                    : "border-border"
                )}
              >
                {active.map(({ item, rating }, i) => (
                  <div
                    key={item}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 group/row",
                      "transition-colors duration-200",
                      i < active.length - 1 && "border-b border-border"
                    )}
                  >
                    <p className="text-sm font-medium text-foreground flex-1 min-w-0 truncate">
                      {item}
                    </p>
                    <div className="w-16 shrink-0">
                      <AnimatedProgress
                        target={(rating / 4) * 100}
                        delay={idx * 70 + i * 60}
                      />
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0 w-[72px]">
                      <IntensityDots rating={rating} />
                      <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">
                        {INTENSITY_LABEL[rating]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekday strip — componente padrão de sistema */}
      {Object.values(availability).some((v) => v !== null && v !== undefined) && (
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Disponibilidade semanal
          </h4>
          <WeekdayStrip
            days={WEEKDAYS_MON_FIRST_SHORT.map((d) => ({
              key: d.key,
              label: d.label,
              caption: availability[d.key] ?? null,
            }))}
          />
        </div>
      )}

      {/* Keyframes locais — isolados ao componente via <style jsx>-ish.
          Usamos <style> puro com id pra não duplicar. */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
          50% { transform: scale(1.18) rotate(15deg); opacity: 1; }
        }
        @keyframes aurora-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 oklch(from var(--color-primary) l c h / 0.25); }
          50% { box-shadow: 0 0 0 6px oklch(from var(--color-primary) l c h / 0); }
        }
        @keyframes flame {
          0%, 100% { transform: scale(1) rotate(-4deg); }
          50% { transform: scale(1.12) rotate(4deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="twinkle"], [style*="aurora-spin"],
          [style*="pulse-ring"], [style*="flame"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
