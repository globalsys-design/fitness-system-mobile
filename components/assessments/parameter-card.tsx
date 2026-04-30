"use client";

/**
 * ParameterCard — componente único do design system para captura de
 * medidas numéricas (sinais vitais, perímetros corporais, etc.) em
 * mobile-first.
 *
 * Combina 3 modos de entrada para minimizar fricção em touch:
 *  • Drag do slider — ajuste aproximado sem teclado
 *  • Stepper +/- (44×44) — ajuste fino preciso
 *  • Input numérico central — digitação direta quando o valor é conhecido
 *
 * Suporte opcional a:
 *  • `zones` — quando presentes, o card pinta cor adaptativa por zona
 *    clínica (ok/low/warn/bad) e exibe badge de status
 *  • `guideImage` + `guideTip` — quando presentes, mostra botão "Técnica"
 *    que abre BottomSheet com imagem ilustrativa + instrução
 *
 * Used by:
 *  • parametros-basais (sinais vitais com zonas)
 *  • antropometria/perimetros (medidas corporais sem zonas, com técnica)
 */

import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ImageIcon,
  Minus,
  Plus,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { cn } from "@/lib/utils";
import {
  BASAL_TONE_CLASSES,
  parseBasalNumber,
  zoneFor,
  type BasalParam,
  type BasalTone,
  type BasalZone,
} from "@/lib/data/parametros-basais";

interface ParameterCardProps {
  param: BasalParam;
  raw: string;
  onChange: (raw: string) => void;
  onStep: (dir: 1 | -1) => void;
  index?: number;
  /** Imagem de técnica (URL ou path public). Quando definida, abre modal. */
  guideImage?: string;
  /** Instrução de técnica exibida no modal. */
  guideTip?: string;
  /**
   * Conversão para unidade derivada exibida abaixo do input (somente leitura).
   * Ex: input em mm com derivação cm → `{ unit: "cm", factor: 0.1, decimals: 2 }`.
   */
  secondaryUnit?: {
    unit: string;
    factor: number;
    decimals: number;
  };
  className?: string;
}

export function ParameterCard({
  param,
  raw,
  onChange,
  onStep,
  index = 0,
  guideImage,
  guideTip,
  secondaryUnit,
  className,
}: ParameterCardProps) {
  const Icon = param.icon;
  const numeric = parseBasalNumber(raw);
  const hasZones = !!param.zones && param.zones.length > 0;
  const zone = hasZones && numeric !== null ? zoneFor(numeric, param.zones) : null;
  const tone = zone?.tone;
  const toneCls = tone ? BASAL_TONE_CLASSES[tone] : null;

  const [techniqueOpen, setTechniqueOpen] = useState(false);

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
  const hasGuide = !!guideImage || !!guideTip;

  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 flex flex-col gap-3 overflow-hidden",
        "transition-[background-color,border-color,box-shadow] duration-300 ease-out",
        "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both",
        tone && toneCls
          ? cn("bg-card", toneCls.border)
          : "bg-card border-border",
        className
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      data-tone={tone ?? "empty"}
    >
      {/* Header — ícone + label + (status badge | botão técnica) */}
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

        {/* Status badge — quando há zona detectada */}
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

        {/* Botão técnica — quando não há zona mas há guia */}
        {!zone && hasGuide && (
          <button
            type="button"
            onClick={() => setTechniqueOpen(true)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full",
              "text-[10px] font-semibold uppercase tracking-wide",
              "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              "transition-colors active:scale-[0.95]"
            )}
          >
            <HelpCircle className="size-3" />
            Técnica
          </button>
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

      {/* Conversão para unidade derivada (ex: mm → cm) */}
      {secondaryUnit && numeric !== null && (
        <p
          className="text-xs text-muted-foreground tabular-nums text-center -mt-1"
          aria-live="polite"
        >
          ={" "}
          <span className="font-semibold text-foreground/80">
            {(numeric * secondaryUnit.factor)
              .toFixed(secondaryUnit.decimals)
              .replace(".", ",")}
          </span>{" "}
          {secondaryUnit.unit}
        </p>
      )}

      {/* Slider/gauge — com zonas (basais) ou neutro (perímetros) */}
      <ParameterGauge
        param={param}
        markerPos={markerPos}
        tone={tone}
        onChange={onChange}
      />

      {/* Modal de técnica — só renderiza se houver guia */}
      {hasGuide && (
        <BottomSheet
          open={techniqueOpen}
          onOpenChange={setTechniqueOpen}
          srOnlyTitle={`Técnica de medição: ${param.label}`}
          srOnlyDescription={guideTip ?? "Imagem ilustrativa do ponto de medição."}
        >
          <div className="px-1 pt-2 pb-1 space-y-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">
                {param.label} — Técnica
              </h2>
            </div>
            {guideImage && (
              <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={guideImage}
                  alt={`Ilustração da técnica de medição de ${param.label}`}
                  className="w-full h-auto object-contain"
                />
              </div>
            )}
            {guideTip && (
              <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/40 pl-3 italic">
                {guideTip}
              </p>
            )}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * StepperButton (44×44 mobile-safe hit area)
 * ────────────────────────────────────────────────────────────────────── */

export function StepperButton({
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

/* ──────────────────────────────────────────────────────────────────────
 * ParameterGauge — slider draggable com zonas opcionais
 * ────────────────────────────────────────────────────────────────────── */

export function ParameterGauge({
  param,
  markerPos,
  tone,
  onChange,
}: {
  param: BasalParam;
  markerPos: number | null;
  tone: BasalTone | undefined;
  onChange: (raw: string) => void;
}) {
  const range = param.scaleMax - param.scaleMin;
  const stepSize = param.step ?? 1;
  const decimals = param.decimals ?? 0;
  const zones = param.zones;
  const hasZones = !!zones && zones.length > 0;

  /* Segmentos de zonas — usados apenas quando o param tem zones definidas */
  const segments: (BasalZone & { width: number })[] = hasZones
    ? zones.map((z, i) => {
        const prevMax = i === 0 ? param.scaleMin : zones[i - 1].max;
        const width = Math.max(0, (z.max - prevMax) / range) * 100;
        return { ...z, width };
      })
    : [];

  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const visualPos = markerPos ?? 0.5;
  const hasValue = markerPos !== null;
  const numericValue =
    markerPos !== null ? param.scaleMin + markerPos * range : null;

  function snap(value: number): number {
    const stepped = Math.round(value / stepSize) * stepSize;
    const clamped = Math.max(param.scaleMin, Math.min(param.scaleMax, stepped));
    return Number(clamped.toFixed(decimals));
  }

  function format(value: number): string {
    if (decimals > 0) return value.toFixed(decimals).replace(".", ",");
    return String(value);
  }

  function commitFromPointerX(clientX: number) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = param.scaleMin + pct * range;
    onChange(format(snap(raw)));
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    commitFromPointerX(e.clientX);
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    commitFromPointerX(e.clientX);
  }
  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.currentTarget as HTMLDivElement).hasPointerCapture(e.pointerId)) {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const current = numericValue ?? (param.scaleMin + param.scaleMax) / 2;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = current + stepSize;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = current - stepSize;
    else if (e.key === "Home") next = param.scaleMin;
    else if (e.key === "End") next = param.scaleMax;
    else if (e.key === "PageUp") next = current + stepSize * 10;
    else if (e.key === "PageDown") next = current - stepSize * 10;
    if (next !== null) {
      e.preventDefault();
      onChange(format(snap(next)));
    }
  }

  const toneClsForMarker =
    hasValue && tone ? BASAL_TONE_CLASSES[tone].bar : "bg-primary";

  return (
    <div className="relative mt-1">
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={`Ajustar ${param.label}`}
        aria-valuemin={param.scaleMin}
        aria-valuemax={param.scaleMax}
        aria-valuenow={numericValue ?? undefined}
        aria-valuetext={
          numericValue !== null
            ? `${format(numericValue)} ${param.unit}`
            : "Não definido"
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative -my-2 py-2 cursor-pointer select-none touch-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:rounded-full"
        )}
      >
        {/* Trilho — segmentado por zonas (se houver) ou primary contínuo */}
        <div
          className="flex h-1.5 rounded-full overflow-hidden border border-border/50"
          aria-hidden
        >
          {hasZones ? (
            segments.map((s, i) => (
              <div
                key={i}
                className={cn(
                  BASAL_TONE_CLASSES[s.tone].bar,
                  "opacity-40 transition-opacity duration-300"
                )}
                style={{
                  width: `${s.width}%`,
                  opacity: tone === s.tone ? 0.95 : 0.25,
                }}
              />
            ))
          ) : (
            <div className="w-full bg-primary/30" />
          )}
        </div>

        {/* Marker / handle */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none",
            !isDragging && "transition-[left] duration-300 ease-out"
          )}
          style={{ left: `${visualPos * 100}%` }}
          aria-hidden
        >
          <span
            className={cn(
              "block size-4 rounded-full border-2 border-background",
              "transition-[transform,box-shadow,background-color] duration-150",
              isDragging
                ? "scale-125 shadow-lg ring-2 ring-foreground/10"
                : "shadow",
              hasValue ? toneClsForMarker : "bg-muted-foreground/40"
            )}
          />
        </div>
      </div>

      <div className="flex justify-between mt-1 text-[9px] font-semibold tabular-nums text-muted-foreground/70">
        <span>{param.scaleMin}</span>
        <span>
          {param.scaleMax} {param.unit}
        </span>
      </div>
    </div>
  );
}
