"use client";

/**
 * Parâmetros Basais — captura de sinais vitais com inteligência clínica.
 *
 * Design Spells (mobile + a11y first):
 *
 *  ✦ Zone-aware gauge
 *     Cada parâmetro tem faixas de referência (baixo / normal / elevado / alto).
 *     Uma barra de 3–4 zonas é desenhada abaixo do input, com um marcador
 *     (ponteiro) que desliza pra posição do valor atual em 400ms. GPU-only.
 *
 *  ✦ Status badge reativo
 *     Badge "Normal/Elevado/Alto" aparece com zoom-in quando o valor cai em
 *     uma zona. Cor do badge = cor da zona. `aria-live="polite"` para leitor
 *     de tela anunciar mudanças.
 *
 *  ✦ Stepper de toque amplo (+ / −)
 *     Botões 44x44 pra fine-tune sem teclado. Respeita `prefers-reduced-motion`.
 *
 *  ✦ BP Pair (pressão)
 *     Quando sistólica + diastólica estão ambos preenchidos, aparece uma pill
 *     compacta "120/80" embaixo do par com classificação combinada.
 *
 *  ✦ Progress chip no topo
 *     "X de 6 preenchidos" com Sparkles twinkle ao aproximar 100%.
 *
 *  ✦ Save button adaptativo
 *     - Todos vazios → disabled em opacity 60.
 *     - Algum preenchido + anormal → botão em primary com anel de alerta sutil.
 *     - Todos preenchidos e normais → shimmer sweep no botão, CTA "pronto".
 *
 *  ✦ Load + skeleton
 *     Carrega valores existentes da API no mount. Skeletons enquanto carrega
 *     (nunca tela em branco, conforme CLAUDE.md).
 *
 *  ✦ Acessibilidade
 *     - aria-describedby liga input → texto de referência.
 *     - aria-live nas badges.
 *     - inputMode="decimal" e pattern pra teclado numérico.
 *     - Touch targets ≥ 44px.
 *     - `prefers-reduced-motion` desliga keyframes decorativos.
 */

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Activity,
  Thermometer,
  Heart,
  Droplets,
  Wind,
  Minus,
  Plus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { cn } from "@/lib/utils";

// ─── Tipos ──────────────────────────────────────────────────────────────

type Tone = "ok" | "low" | "warn" | "bad";

interface Zone {
  max: number; // limite superior INCLUSIVO da zona
  tone: Tone;
  label: string;
}

interface BasalParam {
  key: string;
  label: string;
  short: string;
  unit: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  /** Limites do gauge (scale mínima e máxima plausível). */
  scaleMin: number;
  scaleMax: number;
  /** Zonas ordenadas por `max` crescente — cobrem todo o range. */
  zones: Zone[];
  /** Passo do stepper +/-. Default 1. */
  step?: number;
  /** Casas decimais para parse/format. Default 0. */
  decimals?: number;
  /** Descrição acessível mostrada como hint. */
  hint: string;
}

// ─── Faixas clínicas de referência (adulto saudável) ────────────────────
//
// Fontes: Ministério da Saúde, SBC 2020, SBD 2023, OMS.
// São referências didáticas — conduta clínica é responsabilidade do profissional.

const PARAMS: BasalParam[] = [
  {
    key: "systolic",
    label: "Pressão Sistólica",
    short: "PAS",
    unit: "mmHg",
    icon: Activity,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
    scaleMin: 70,
    scaleMax: 200,
    zones: [
      { max: 89,  tone: "low",  label: "Baixa" },
      { max: 129, tone: "ok",   label: "Normal" },
      { max: 139, tone: "warn", label: "Elevada" },
      { max: 200, tone: "bad",  label: "Alta" },
    ],
    hint: "Normal 90–129 mmHg",
  },
  {
    key: "diastolic",
    label: "Pressão Diastólica",
    short: "PAD",
    unit: "mmHg",
    icon: Activity,
    iconColor: "text-red-400",
    iconBg: "bg-red-400/10",
    scaleMin: 40,
    scaleMax: 120,
    zones: [
      { max: 59,  tone: "low",  label: "Baixa" },
      { max: 84,  tone: "ok",   label: "Normal" },
      { max: 89,  tone: "warn", label: "Elevada" },
      { max: 120, tone: "bad",  label: "Alta" },
    ],
    hint: "Normal 60–84 mmHg",
  },
  {
    key: "glucose",
    label: "Glicemia em Jejum",
    short: "Glicemia",
    unit: "mg/dL",
    icon: Droplets,
    iconColor: "text-info",
    iconBg: "bg-info/10",
    scaleMin: 40,
    scaleMax: 300,
    zones: [
      { max: 69,  tone: "low",  label: "Hipoglicemia" },
      { max: 99,  tone: "ok",   label: "Normal" },
      { max: 125, tone: "warn", label: "Pré-diabetes" },
      { max: 300, tone: "bad",  label: "Alta" },
    ],
    hint: "Normal 70–99 mg/dL em jejum",
  },
  {
    key: "temperature",
    label: "Temperatura",
    short: "Temp.",
    unit: "°C",
    icon: Thermometer,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
    scaleMin: 34,
    scaleMax: 42,
    decimals: 1,
    step: 0.1,
    zones: [
      { max: 35.4, tone: "low",  label: "Hipotermia" },
      { max: 37.4, tone: "ok",   label: "Normal" },
      { max: 37.9, tone: "warn", label: "Febrícula" },
      { max: 42,   tone: "bad",  label: "Febre" },
    ],
    hint: "Normal 35,5–37,4 °C",
  },
  {
    key: "heartRate",
    label: "Frequência Cardíaca",
    short: "FC",
    unit: "bpm",
    icon: Heart,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10",
    scaleMin: 30,
    scaleMax: 200,
    zones: [
      { max: 59,  tone: "low",  label: "Bradicardia" },
      { max: 100, tone: "ok",   label: "Normal" },
      { max: 120, tone: "warn", label: "Elevada" },
      { max: 200, tone: "bad",  label: "Taquicardia" },
    ],
    hint: "Normal 60–100 bpm em repouso",
  },
  {
    key: "saturation",
    label: "Saturação de O₂",
    short: "SpO₂",
    unit: "%",
    icon: Wind,
    iconColor: "text-teal-500",
    iconBg: "bg-teal-500/10",
    scaleMin: 80,
    scaleMax: 100,
    zones: [
      { max: 89, tone: "bad",  label: "Crítica" },
      { max: 94, tone: "warn", label: "Reduzida" },
      { max: 100, tone: "ok",  label: "Normal" },
    ],
    hint: "Normal ≥ 95 %",
  },
];

// ─── Tone helpers ───────────────────────────────────────────────────────

const TONE_CLASSES: Record<
  Tone,
  { text: string; bg: string; border: string; bar: string; ring: string }
> = {
  ok:   { text: "text-success",       bg: "bg-success/10",       border: "border-success/30",       bar: "bg-success",          ring: "ring-success/30" },
  low:  { text: "text-info",          bg: "bg-info/10",          border: "border-info/30",          bar: "bg-info",             ring: "ring-info/30" },
  warn: { text: "text-orange-500",    bg: "bg-orange-500/10",    border: "border-orange-500/30",    bar: "bg-orange-500",       ring: "ring-orange-500/30" },
  bad:  { text: "text-destructive",   bg: "bg-destructive/10",   border: "border-destructive/30",   bar: "bg-destructive",      ring: "ring-destructive/30" },
};

function zoneFor(value: number, zones: Zone[]): Zone | null {
  if (Number.isNaN(value)) return null;
  for (const z of zones) {
    if (value <= z.max) return z;
  }
  return zones[zones.length - 1];
}

function parseNumber(raw: string): number | null {
  if (raw === "" || raw === "-" || raw === ".") return null;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

// ─── Página ─────────────────────────────────────────────────────────────

export default function ParametrosBasaisPage() {
  const params = useParams();
  const [values, setValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Carrega valores existentes.
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/anamnesis`);
        if (res.ok) {
          const data = await res.json();
          const basal = data?.basalParameters ?? data?.anamnesis?.basalParameters;
          if (basal && typeof basal === "object") {
            const next: Record<string, string> = {};
            for (const p of PARAMS) {
              const v = basal[p.key];
              if (v !== null && v !== undefined && v !== "") {
                next[p.key] = String(v);
              }
            }
            setValues(next);
          }
        }
      } catch {
        // silently ignore — form starts empty
      } finally {
        setIsFetching(false);
      }
    }
    load();
  }, [params.id]);

  const numericValues = useMemo(() => {
    const out: Record<string, number | null> = {};
    for (const p of PARAMS) out[p.key] = parseNumber(values[p.key] ?? "");
    return out;
  }, [values]);

  const filledCount = Object.values(numericValues).filter((v) => v !== null).length;
  const totalCount = PARAMS.length;
  const anyAbnormal = PARAMS.some((p) => {
    const v = numericValues[p.key];
    if (v === null) return false;
    const z = zoneFor(v, p.zones);
    return z?.tone === "warn" || z?.tone === "bad";
  });
  const allFilledAndNormal =
    filledCount === totalCount &&
    PARAMS.every((p) => {
      const v = numericValues[p.key];
      if (v === null) return false;
      return zoneFor(v, p.zones)?.tone === "ok";
    });

  function setValue(key: string, raw: string) {
    setValues((v) => ({ ...v, [key]: raw }));
  }

  function step(param: BasalParam, dir: 1 | -1) {
    const current = numericValues[param.key];
    const stepSize = param.step ?? 1;
    const decimals = param.decimals ?? 0;
    // Se não tem valor, começa no meio da zona "ok" para orientar.
    const base = current ?? Math.round((param.scaleMin + param.scaleMax) / 2);
    const next = Math.max(
      param.scaleMin,
      Math.min(param.scaleMax, base + dir * stepSize)
    );
    setValue(param.key, next.toFixed(decimals));
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      // Só envia numéricos válidos — backend não se preocupa com strings vazias.
      const payload: Record<string, number> = {};
      for (const p of PARAMS) {
        const n = numericValues[p.key];
        if (n !== null) payload[p.key] = n;
      }
      const res = await fetch(`/api/assessments/${params.id}/anamnesis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ basalParameters: payload }),
      });
      if (!res.ok) throw new Error();
      toast.success("Parâmetros salvos!");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Parâmetros Basais" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Parâmetros Basais" showBack>
      <div className="p-4 flex flex-col gap-4">
        {/* Progress chip no topo */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Preencha os sinais vitais de repouso do cliente.
          </p>
          {filledCount > 0 && (
            <span
              key={filledCount}
              className={cn(
                "shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full",
                "text-[11px] font-semibold tabular-nums border",
                "animate-in zoom-in-95 fade-in duration-200",
                filledCount === totalCount
                  ? "text-primary-foreground bg-primary border-primary"
                  : "text-primary bg-primary/10 border-primary/30"
              )}
              aria-live="polite"
            >
              <Sparkles
                className={cn(
                  "size-3",
                  filledCount === totalCount ? "" : "text-primary"
                )}
                style={
                  filledCount >= totalCount - 1
                    ? { animation: "twinkle 2.4s ease-in-out infinite" }
                    : undefined
                }
              />
              {filledCount}/{totalCount}
            </span>
          )}
        </div>

        {/* Cards dos parâmetros */}
        {PARAMS.map((param, idx) => (
          <ParameterCard
            key={param.key}
            param={param}
            raw={values[param.key] ?? ""}
            onChange={(raw) => setValue(param.key, raw)}
            onStep={(dir) => step(param, dir)}
            index={idx}
          />
        ))}

        {/* Combo PAS/PAD — aparece quando os dois estão preenchidos */}
        <BloodPressureCombo
          systolic={numericValues.systolic}
          diastolic={numericValues.diastolic}
        />

        {/* Save button adaptativo */}
        <Button
          className={cn(
            "w-full h-12 relative overflow-hidden",
            "transition-[transform,box-shadow] duration-200 active:scale-[0.98]",
            filledCount === 0 && "opacity-60",
            anyAbnormal &&
              filledCount > 0 &&
              "shadow-[0_0_0_3px_oklch(from_var(--color-destructive)_l_c_h/0.2)]"
          )}
          onClick={handleSave}
          disabled={isLoading || filledCount === 0}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {filledCount === 0
            ? "Preencha ao menos um parâmetro"
            : anyAbnormal
              ? "Salvar com alertas"
              : "Salvar parâmetros"}

          {/* Shimmer sweep quando todos preenchidos e normais */}
          {allFilledAndNormal && !isLoading && (
            <span
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                animation: "shimmer-sweep 2.8s ease-in-out infinite",
              }}
            />
          )}
        </Button>
      </div>

      {/* Keyframes locais — respeitam reduced-motion */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
          50%      { transform: scale(1.2) rotate(15deg); opacity: 1; }
        }
        @keyframes shimmer-sweep {
          0%        { transform: translateX(-100%); }
          60%, 100% { transform: translateX(250%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="twinkle"], [style*="shimmer-sweep"] { animation: none !important; }
        }
      `}</style>
    </MobileLayout>
  );
}

// ─── ParameterCard ──────────────────────────────────────────────────────

function ParameterCard({
  param,
  raw,
  onChange,
  onStep,
  index,
}: {
  param: BasalParam;
  raw: string;
  onChange: (raw: string) => void;
  onStep: (dir: 1 | -1) => void;
  index: number;
}) {
  const Icon = param.icon;
  const numeric = parseNumber(raw);
  const zone = numeric !== null ? zoneFor(numeric, param.zones) : null;
  const tone = zone?.tone;
  const toneCls = tone ? TONE_CLASSES[tone] : null;

  // Posição do marker no gauge (0..1).
  const markerPos =
    numeric !== null
      ? Math.max(
          0,
          Math.min(
            1,
            (numeric - param.scaleMin) / (param.scaleMax - param.scaleMin)
          )
        )
      : null;

  const hintId = `hint-${param.key}`;
  const statusId = `status-${param.key}`;

  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 flex flex-col gap-3 overflow-hidden",
        "transition-[background-color,border-color,box-shadow] duration-300 ease-out",
        "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both",
        tone && toneCls
          ? cn("bg-card", toneCls.border)
          : "bg-card border-border"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      data-tone={tone ?? "empty"}
    >
      {/* Header — ícone + label + status badge */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex items-center justify-center size-10 rounded-xl shrink-0 transition-transform duration-300",
            param.iconBg,
            tone && "scale-105"
          )}
          aria-hidden
        >
          <Icon className={cn("w-4 h-4", param.iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <Label
            htmlFor={param.key}
            className="text-sm font-semibold text-foreground block"
          >
            {param.label}
          </Label>
          <p
            id={hintId}
            className="text-[11px] text-muted-foreground mt-0.5"
          >
            {param.hint}
          </p>
        </div>

        {/* Status badge — aparece/morfa conforme a zona */}
        {zone && toneCls && (
          <span
            key={zone.label}
            id={statusId}
            aria-live="polite"
            className={cn(
              "shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
              "text-[10px] font-bold uppercase tracking-wide border",
              "animate-in zoom-in-95 fade-in duration-200",
              toneCls.text,
              toneCls.bg,
              toneCls.border
            )}
          >
            {tone === "bad" || tone === "warn" ? (
              <AlertCircle className="size-2.5" />
            ) : tone === "ok" ? (
              <CheckCircle2 className="size-2.5" />
            ) : null}
            {zone.label}
          </span>
        )}
      </div>

      {/* Input row — stepper amplo + número grande + unit */}
      <div className="flex items-stretch gap-2">
        <StepperButton
          direction="down"
          onClick={() => onStep(-1)}
          ariaLabel={`Diminuir ${param.short}`}
        />
        <div className="flex-1 relative">
          <Input
            id={param.key}
            type="text"
            inputMode="decimal"
            pattern="[0-9,.]*"
            placeholder="—"
            value={raw}
            onChange={(e) => onChange(e.target.value)}
            aria-describedby={`${hintId}${zone ? ` ${statusId}` : ""}`}
            className={cn(
              "h-12 text-center text-xl font-bold tabular-nums pr-14",
              "transition-[border-color,box-shadow] duration-200",
              toneCls && [toneCls.border, "focus-visible:" + toneCls.ring]
            )}
          />
          <span
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold tabular-nums",
              toneCls ? toneCls.text : "text-muted-foreground"
            )}
          >
            {param.unit}
          </span>
        </div>
        <StepperButton
          direction="up"
          onClick={() => onStep(1)}
          ariaLabel={`Aumentar ${param.short}`}
        />
      </div>

      {/* Gauge zonas + marker */}
      <ZoneGauge param={param} markerPos={markerPos} tone={tone} />
    </div>
  );
}

// ─── StepperButton (44x44) ───────────────────────────────────────────────

function StepperButton({
  direction,
  onClick,
  ariaLabel,
}: {
  direction: "up" | "down";
  onClick: () => void;
  ariaLabel: string;
}) {
  const Icon = direction === "up" ? Plus : Minus;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "shrink-0 w-11 h-12 rounded-lg border border-border bg-card",
        "flex items-center justify-center",
        "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        "active:scale-[0.92] transition-[transform,background-color,color] duration-150",
        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

// ─── ZoneGauge ───────────────────────────────────────────────────────────

function ZoneGauge({
  param,
  markerPos,
  tone,
}: {
  param: BasalParam;
  markerPos: number | null;
  tone: Tone | undefined;
}) {
  const range = param.scaleMax - param.scaleMin;

  // Cada zona ocupa uma faixa proporcional ao range do scale.
  const segments = param.zones.map((z, i) => {
    const prevMax = i === 0 ? param.scaleMin : param.zones[i - 1].max;
    const width = Math.max(0, (z.max - prevMax) / range) * 100;
    return { ...z, width };
  });

  return (
    <div className="relative mt-1">
      {/* Trilho de zonas */}
      <div
        className="flex h-1.5 rounded-full overflow-hidden border border-border/50"
        role="presentation"
      >
        {segments.map((s, i) => (
          <div
            key={i}
            className={cn(TONE_CLASSES[s.tone].bar, "opacity-40 transition-opacity duration-300")}
            style={{
              width: `${s.width}%`,
              opacity: tone === s.tone ? 0.95 : 0.25,
            }}
            aria-hidden
          />
        ))}
      </div>

      {/* Marker deslizante */}
      {markerPos !== null && tone && (
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{
            left: `${markerPos * 100}%`,
            transition: "left 400ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          aria-hidden
        >
          <span
            className={cn(
              "block size-3 rounded-full border-2 border-background shadow",
              TONE_CLASSES[tone].bar
            )}
          />
        </div>
      )}

      {/* Escala min/max */}
      <div className="flex justify-between mt-1 text-[9px] font-semibold tabular-nums text-muted-foreground/70">
        <span>{param.scaleMin}</span>
        <span>{param.scaleMax} {param.unit}</span>
      </div>
    </div>
  );
}

// ─── BloodPressureCombo ──────────────────────────────────────────────────

function BloodPressureCombo({
  systolic,
  diastolic,
}: {
  systolic: number | null;
  diastolic: number | null;
}) {
  if (systolic === null || diastolic === null) return null;

  // Classificação combinada conforme SBC — usa o pior dos dois.
  function classify(s: number, d: number): { label: string; tone: Tone } {
    if (s >= 180 || d >= 110) return { label: "Hipertensão grave", tone: "bad" };
    if (s >= 140 || d >= 90)  return { label: "Hipertensão", tone: "bad" };
    if (s >= 130 || d >= 85)  return { label: "Pressão elevada", tone: "warn" };
    if (s < 90 || d < 60)     return { label: "Hipotensão", tone: "low" };
    return { label: "Pressão normal", tone: "ok" };
  }
  const cls = classify(systolic, diastolic);
  const toneCls = TONE_CLASSES[cls.tone];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        toneCls.bg,
        toneCls.border
      )}
      aria-live="polite"
    >
      <div className={cn("flex items-center justify-center size-10 rounded-xl shrink-0", toneCls.bg)}>
        <Activity className={cn("size-5", toneCls.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Pressão arterial
        </p>
        <p className="text-base font-bold tabular-nums">
          <span className={toneCls.text}>
            {systolic}/{diastolic}
          </span>{" "}
          <span className="text-xs font-semibold text-muted-foreground">mmHg</span>
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border",
          toneCls.text,
          toneCls.bg,
          toneCls.border
        )}
      >
        {cls.label}
      </span>
    </div>
  );
}
