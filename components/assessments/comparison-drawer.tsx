"use client";

import { useState, useEffect } from "react";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface ComparisonAssessment {
  id: string;
  createdAt: string;
  anthropometry: {
    weight: number | null;
    height: number | null;
    bodyComposition: any | null;
    perimeters: any | null;
  } | null;
  fitnessTests: {
    vo2Predictive: any | null;
    vo2Max: any | null;
  } | null;
}

interface ComparisonDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessments: ComparisonAssessment[];
}

// ── Comparison Row ───────────────────────────────────────────────────────────
function ComparisonRow({
  label,
  unit,
  valueA,
  valueB,
  higherIsBetter = true,
}: {
  label: string;
  unit: string;
  valueA: number | null;
  valueB: number | null;
  higherIsBetter?: boolean;
}) {
  const a = valueA ?? 0;
  const b = valueB ?? 0;
  const diff = b - a;
  const hasDiff = valueA != null && valueB != null && diff !== 0;
  const isImprovement = higherIsBetter ? diff > 0 : diff < 0;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-3 border-b border-border/50 last:border-0">
      {/* Value A */}
      <div className="text-center">
        <p className="text-lg font-bold tabular-nums text-foreground">
          {valueA != null ? valueA : "—"}
        </p>
      </div>

      {/* Label + Delta */}
      <div className="flex flex-col items-center gap-0.5 min-w-[5rem]">
        <p className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wide text-center leading-tight">
          {label}
        </p>
        <span className="text-[0.6rem] text-muted-foreground">{unit}</span>
        {hasDiff && (
          <div
            className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[0.6rem] font-bold",
              isImprovement
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {isImprovement ? (
              <ArrowUp className="size-2.5" />
            ) : (
              <ArrowDown className="size-2.5" />
            )}
            {Math.abs(diff).toFixed(1)}
          </div>
        )}
        {hasDiff === false && valueA != null && valueB != null && (
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-muted text-[0.6rem] font-bold text-muted-foreground">
            <Minus className="size-2.5" />
            Igual
          </div>
        )}
      </div>

      {/* Value B */}
      <div className="text-center">
        <p className="text-lg font-bold tabular-nums text-foreground">
          {valueB != null ? valueB : "—"}
        </p>
      </div>
    </div>
  );
}

// ── Selector ─────────────────────────────────────────────────────────────────
function AssessmentSelector({
  assessments,
  selected,
  onChange,
  label,
}: {
  assessments: ComparisonAssessment[];
  selected: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[0.6rem] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 bg-muted/30 border border-border rounded-lg px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {assessments.map((a) => (
          <option key={a.id} value={a.id}>
            {format(new Date(a.createdAt), "dd MMM yyyy", { locale: ptBR })}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function ComparisonDrawer({
  open,
  onOpenChange,
  assessments,
}: ComparisonDrawerProps) {
  const [idA, setIdA] = useState(assessments[1]?.id ?? assessments[0]?.id ?? "");
  const [idB, setIdB] = useState(assessments[0]?.id ?? "");

  const assessmentA = assessments.find((a) => a.id === idA);
  const assessmentB = assessments.find((a) => a.id === idB);

  // Extract comparable values
  const getWeight = (a?: ComparisonAssessment) => a?.anthropometry?.weight ?? null;
  const getHeight = (a?: ComparisonAssessment) => a?.anthropometry?.height ?? null;

  const getPerimeter = (a?: ComparisonAssessment, key?: string) => {
    if (!a?.anthropometry?.perimeters || !key) return null;
    const val = (a.anthropometry.perimeters as any)?.[key];
    return typeof val === "number" ? val : null;
  };

  const getVO2 = (a?: ComparisonAssessment) => {
    const vo2 = a?.fitnessTests?.vo2Max as any;
    if (vo2?.vo2Result) return parseFloat(vo2.vo2Result);
    const pred = a?.fitnessTests?.vo2Predictive as any;
    if (pred?.result) return parseFloat(pred.result);
    return null;
  };

  const getBodyFat = (a?: ComparisonAssessment) => {
    const comp = a?.anthropometry?.bodyComposition as any;
    if (comp?.fatPercentage) return parseFloat(comp.fatPercentage);
    return null;
  };

  if (assessments.length < 2) {
    return (
      <BottomSheet open={open} onOpenChange={onOpenChange} title="Comparar Avaliacoes">
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <p className="text-sm text-muted-foreground text-center">
            Sao necessarias ao menos 2 avaliacoes para comparar.
          </p>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Comparar Avaliacoes"
      className="max-h-[90dvh]"
    >
      <div className="flex flex-col gap-4 pb-4">
        {/* ── Assessment Selectors ───────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <AssessmentSelector
            assessments={assessments}
            selected={idA}
            onChange={setIdA}
            label="Avaliacao A"
          />
          <AssessmentSelector
            assessments={assessments}
            selected={idB}
            onChange={setIdB}
            label="Avaliacao B"
          />
        </div>

        {/* ── Column Headers ─────────────────────────────────────────── */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-2">
          <p className="text-center text-[0.6rem] font-bold text-muted-foreground uppercase">
            {assessmentA
              ? format(new Date(assessmentA.createdAt), "dd/MM/yy", { locale: ptBR })
              : "—"}
          </p>
          <div className="min-w-[5rem]" />
          <p className="text-center text-[0.6rem] font-bold text-muted-foreground uppercase">
            {assessmentB
              ? format(new Date(assessmentB.createdAt), "dd/MM/yy", { locale: ptBR })
              : "—"}
          </p>
        </div>

        {/* ── Corpo ──────────────────────────────────────────────────── */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-foreground mb-2">Corpo</p>
          <div className="rounded-xl border border-border overflow-hidden bg-card px-3">
            <ComparisonRow
              label="Peso"
              unit="kg"
              valueA={getWeight(assessmentA)}
              valueB={getWeight(assessmentB)}
              higherIsBetter={false}
            />
            <ComparisonRow
              label="% Gordura"
              unit="%"
              valueA={getBodyFat(assessmentA)}
              valueB={getBodyFat(assessmentB)}
              higherIsBetter={false}
            />
          </div>
        </div>

        {/* ── Perimetros ─────────────────────────────────────────────── */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-foreground mb-2">Perimetros</p>
          <div className="rounded-xl border border-border overflow-hidden bg-card px-3">
            {["cintura", "quadril", "bracoD", "coxaD", "panturrilhaD"].map((key) => (
              <ComparisonRow
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                unit="cm"
                valueA={getPerimeter(assessmentA, key)}
                valueB={getPerimeter(assessmentB, key)}
                higherIsBetter={key !== "cintura"}
              />
            ))}
          </div>
        </div>

        {/* ── Performance ────────────────────────────────────────────── */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-foreground mb-2">Performance</p>
          <div className="rounded-xl border border-border overflow-hidden bg-card px-3">
            <ComparisonRow
              label="VO2"
              unit="ml/kg/min"
              valueA={getVO2(assessmentA)}
              valueB={getVO2(assessmentB)}
              higherIsBetter={true}
            />
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
