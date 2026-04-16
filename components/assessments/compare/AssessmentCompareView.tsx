"use client";

import { useState, useMemo } from "react";
import { GitCompareArrows, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

type JsonBodyComposition = {
  fatPercentage?: number | null;
  leanMass?: number | null;
  fatMass?: number | null;
  bmi?: number | null;
};

type JsonPerimeters = {
  waist?: number | null;
  hip?: number | null;
  abdomen?: number | null;
  chest?: number | null;
  rightArm?: number | null;
  rightThigh?: number | null;
  rightCalf?: number | null;
};

type JsonVo2Max = { vo2max?: number | null };
type JsonFramingham = { risk10Year?: number | null };
type JsonBasalParameters = {
  restingHR?: number | null;
  systolicBP?: number | null;
  diastolicBP?: number | null;
};

type Assessment = {
  id: string;
  createdAt: Date;
  client: { id: string; name: string; photo: string | null; gender: string | null };
  anthropometry: {
    weight: number | null;
    height: number | null;
    bodyComposition: JsonBodyComposition | null;
    perimeters: JsonPerimeters | null;
    diameters: Record<string, number | null> | null;
  } | null;
  anamnesis: { framingham: JsonFramingham | null; basalParameters: JsonBasalParameters | null } | null;
  fitnessTests: { vo2Max: JsonVo2Max | null } | null;
};

interface Props {
  assessments: Assessment[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function delta(a: number | null | undefined, b: number | null | undefined) {
  if (a == null || b == null || a === 0) return null;
  return ((b - a) / Math.abs(a)) * 100;
}

// For metrics where LOWER is better (fat %, weight if goal is loss, etc.)
type Direction = "up-good" | "down-good" | "neutral";

function DeltaBadge({
  pct,
  direction = "neutral",
}: {
  pct: number | null;
  direction?: Direction;
}) {
  if (pct == null) return <span className="text-xs text-muted-foreground">—</span>;

  const abs = Math.abs(pct);
  const isUp = pct > 0;
  const isGood =
    direction === "neutral"
      ? null
      : direction === "up-good"
      ? isUp
      : !isUp;

  const colorClass =
    isGood === null
      ? "text-muted-foreground"
      : isGood
      ? "text-emerald-500"
      : "text-destructive";

  const Icon = Math.abs(pct) < 0.1 ? Minus : isUp ? TrendingUp : TrendingDown;

  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-bold", colorClass)}>
      <Icon className="size-3" strokeWidth={2.5} />
      {abs < 0.1 ? "0%" : `${abs.toFixed(1)}%`}
    </span>
  );
}

// ── Metric Row ────────────────────────────────────────────────────────────────

function MetricRow({
  label,
  unit,
  valA,
  valB,
  direction = "neutral",
  decimals = 1,
}: {
  label: string;
  unit: string;
  valA: number | null | undefined;
  valB: number | null | undefined;
  direction?: Direction;
  decimals?: number;
}) {
  const pct = delta(valA, valB);
  const fmtNum = (v: number | null | undefined) =>
    v != null ? `${v.toFixed(decimals)} ${unit}` : "—";

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-3 border-b border-border/40 last:border-0">
      {/* A */}
      <div className="text-right">
        <span className={cn("text-base font-semibold", valA == null && "text-muted-foreground/40")}>
          {fmtNum(valA)}
        </span>
      </div>

      {/* Label + Delta */}
      <div className="flex flex-col items-center gap-0.5 min-w-[90px]">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center leading-tight">
          {label}
        </span>
        <DeltaBadge pct={pct} direction={direction} />
      </div>

      {/* B */}
      <div className="text-left">
        <span className={cn("text-base font-semibold", valB == null && "text-muted-foreground/40")}>
          {fmtNum(valB)}
        </span>
      </div>
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 bg-muted/40 border-b border-border">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AssessmentCompareView({ assessments }: Props) {
  const [idA, setIdA] = useState<string>("");
  const [idB, setIdB] = useState<string>("");

  const assessmentA = useMemo(() => assessments.find((a) => a.id === idA), [idA, assessments]);
  const assessmentB = useMemo(() => assessments.find((a) => a.id === idB), [idB, assessments]);

  // Group by client for the selectors
  const byClient = useMemo(() => {
    const map = new Map<string, { name: string; items: Assessment[] }>();
    for (const a of assessments) {
      const existing = map.get(a.client.id);
      if (existing) {
        existing.items.push(a);
      } else {
        map.set(a.client.id, { name: a.client.name, items: [a] });
      }
    }
    return Array.from(map.values());
  }, [assessments]);

  const canCompare = assessmentA && assessmentB && idA !== idB;

  // ── Extracted metric values ────────────────────────────────────────────────

  const anthroA = assessmentA?.anthropometry;
  const anthroB = assessmentB?.anthropometry;
  const bcA = anthroA?.bodyComposition;
  const bcB = anthroB?.bodyComposition;
  const perimA = anthroA?.perimeters;
  const perimB = anthroB?.perimeters;
  const vo2A = assessmentA?.fitnessTests?.vo2Max?.vo2max;
  const vo2B = assessmentB?.fitnessTests?.vo2Max?.vo2max;
  const framA = assessmentA?.anamnesis?.framingham?.risk10Year;
  const framB = assessmentB?.anamnesis?.framingham?.risk10Year;
  const bpA = assessmentA?.anamnesis?.basalParameters;
  const bpB = assessmentB?.anamnesis?.basalParameters;

  // ── Empty state ────────────────────────────────────────────────────────────

  if (assessments.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 gap-4 text-center">
        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
          <GitCompareArrows className="size-8 text-muted-foreground" />
        </div>
        <p className="text-xl font-bold">Avaliações insuficientes</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Você precisa de pelo menos 2 avaliações para comparar. Complete mais avaliações e volte aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 pt-2">

      {/* ── Seletores ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-muted-foreground">Escolha 2 avaliações para comparar</p>

        {/* Headers A / B */}
        <div className="grid grid-cols-2 gap-3">
          {(["A", "B"] as const).map((label) => {
            const selectedId = label === "A" ? idA : idB;
            const setSelected = label === "A" ? setIdA : setIdB;
            const other = label === "A" ? idB : idA;

            return (
              <div key={label} className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Avaliação {label}
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelected(e.target.value)}
                  className={cn(
                    "w-full rounded-xl border-2 bg-card px-3 py-2.5",
                    "text-sm font-medium appearance-none",
                    "focus:outline-none transition-colors duration-200",
                    selectedId
                      ? "border-primary text-foreground"
                      : "border-border text-muted-foreground"
                  )}
                >
                  <option value="">Selecionar...</option>
                  {byClient.map((group) => (
                    <optgroup key={group.name} label={group.name}>
                      {group.items.map((a) => (
                        <option
                          key={a.id}
                          value={a.id}
                          disabled={a.id === other}
                        >
                          {fmtDate(a.createdAt)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {/* Chips de identificação */}
        {(assessmentA || assessmentB) && (
          <div className="grid grid-cols-2 gap-3">
            {[assessmentA, assessmentB].map((a, i) =>
              a ? (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-xl px-3 py-2"
                >
                  <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-primary">{i === 0 ? "A" : "B"}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate">{a.client.name}</span>
                    <span className="text-[10px] text-muted-foreground">{fmtDate(a.createdAt)}</span>
                  </div>
                </div>
              ) : (
                <div key={i} className="h-[52px] rounded-xl border-2 border-dashed border-border" />
              )
            )}
          </div>
        )}
      </div>

      {/* ── Resultado da comparação ─────────────────────────────────────────── */}
      {canCompare ? (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-semibold text-primary/80">{assessmentA.client.name} A</span>
            <span className="italic">← delta →</span>
            <span className="font-semibold text-primary/80">B {assessmentB.client.name}</span>
          </div>

          {/* Antropometria básica */}
          {(anthroA || anthroB) && (
            <SectionCard title="Medidas Corporais">
              <MetricRow label="Peso" unit="kg" valA={anthroA?.weight} valB={anthroB?.weight} direction="neutral" />
              <MetricRow label="Altura" unit="cm" valA={anthroA?.height} valB={anthroB?.height} direction="neutral" />
              {(bcA || bcB) && (
                <>
                  <MetricRow label="% Gordura" unit="%" valA={bcA?.fatPercentage} valB={bcB?.fatPercentage} direction="down-good" />
                  <MetricRow label="Massa Magra" unit="kg" valA={bcA?.leanMass} valB={bcB?.leanMass} direction="up-good" />
                  <MetricRow label="Massa Gorda" unit="kg" valA={bcA?.fatMass} valB={bcB?.fatMass} direction="down-good" />
                  <MetricRow label="IMC" unit="" valA={bcA?.bmi} valB={bcB?.bmi} direction="neutral" />
                </>
              )}
            </SectionCard>
          )}

          {/* Perímetros */}
          {(perimA || perimB) && (
            <SectionCard title="Perímetros (cm)">
              {[
                { key: "waist", label: "Cintura", dir: "down-good" as Direction },
                { key: "hip", label: "Quadril", dir: "neutral" as Direction },
                { key: "abdomen", label: "Abdômen", dir: "down-good" as Direction },
                { key: "chest", label: "Tórax", dir: "neutral" as Direction },
                { key: "rightArm", label: "Braço D.", dir: "up-good" as Direction },
                { key: "rightThigh", label: "Coxa D.", dir: "neutral" as Direction },
                { key: "rightCalf", label: "Perna D.", dir: "neutral" as Direction },
              ]
                .filter(({ key }) => perimA?.[key] != null || perimB?.[key] != null)
                .map(({ key, label, dir }) => (
                  <MetricRow
                    key={key}
                    label={label}
                    unit="cm"
                    valA={perimA?.[key]}
                    valB={perimB?.[key]}
                    direction={dir}
                  />
                ))}
            </SectionCard>
          )}

          {/* Capacidade aeróbica */}
          {(vo2A != null || vo2B != null) && (
            <SectionCard title="Capacidade Aeróbica">
              <MetricRow label="VO₂ Máx" unit="ml/kg/min" valA={vo2A} valB={vo2B} direction="up-good" />
            </SectionCard>
          )}

          {/* Risco cardiovascular */}
          {(framA != null || framB != null) && (
            <SectionCard title="Risco Cardiovascular">
              <MetricRow label="Framingham 10a" unit="%" valA={framA} valB={framB} direction="down-good" />
            </SectionCard>
          )}

          {/* Parâmetros basais */}
          {(bpA || bpB) && (
            <SectionCard title="Parâmetros Basais">
              <MetricRow label="FC Repouso" unit="bpm" valA={bpA?.restingHR} valB={bpB?.restingHR} direction="down-good" />
              <MetricRow label="PA Sistólica" unit="mmHg" valA={bpA?.systolicBP} valB={bpB?.systolicBP} direction="neutral" />
              <MetricRow label="PA Diastólica" unit="mmHg" valA={bpA?.diastolicBP} valB={bpB?.diastolicBP} direction="neutral" />
            </SectionCard>
          )}

          {/* Legenda de cores */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="size-3 text-emerald-500" />
              Melhora
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingDown className="size-3 text-destructive" />
              Piora
            </span>
            <span className="flex items-center gap-1.5">
              <Minus className="size-3 text-muted-foreground" />
              Neutro
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
          <GitCompareArrows className="size-10 opacity-30" />
          <p className="text-sm">Selecione 2 avaliações diferentes para ver a comparação</p>
        </div>
      )}
    </div>
  );
}
