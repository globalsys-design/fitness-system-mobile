"use client";

/**
 * PairedParameterCard — bloco de medida com lado direito + esquerdo +
 * cálculo automático de assimetria.
 *
 * Composição: 2 <ParameterCard> empilhados ou lado-a-lado, com banner
 * de assimetria abaixo classificando ok/warn/bad.
 *
 * Mobile-first: empilha em telas estreitas (<sm), side-by-side em
 * telas mais largas. Cada lado preserva todas as affordances do
 * ParameterCard (input + stepper + slider + técnica opcional).
 */

import { AlertCircle, CheckCircle2, Ruler } from "lucide-react";

import { cn } from "@/lib/utils";
import { ParameterCard } from "@/components/assessments/parameter-card";
import {
  computeAsymmetry,
  getNumeric,
  pairKey,
  type PerimetroPairParam,
  type PerimetroValues,
} from "@/lib/data/perimetros";

interface PairedParameterCardProps {
  param: PerimetroPairParam;
  values: PerimetroValues;
  onChange: (key: string, raw: string) => void;
  onStep: (key: string, dir: 1 | -1) => void;
  index?: number;
}

export function PairedParameterCard({
  param,
  values,
  onChange,
  onStep,
  index = 0,
}: PairedParameterCardProps) {
  const dKey = pairKey(param.key, "d");
  const eKey = pairKey(param.key, "e");

  // Adapta a forma de PerimetroPairParam para a forma BasalParam
  // exigida pelo ParameterCard. Cada lado herda os mesmos limites.
  const sideParam = (sideKey: string, sideLabel: string) => ({
    key: sideKey,
    label: sideLabel,
    short: sideLabel,
    unit: param.unit,
    icon: Ruler,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    scaleMin: param.range[0],
    scaleMax: param.range[1],
    step: param.step,
    decimals: param.decimals,
    hint: param.hint ?? "",
    // Sem zonas (perímetros não têm classificação clínica universal)
  });

  const dParam = sideParam(dKey, "Direito");
  const eParam = sideParam(eKey, "Esquerdo");

  const direito = getNumeric(values, dKey);
  const esquerdo = getNumeric(values, eKey);

  const asymmetry = computeAsymmetry(
    direito,
    esquerdo,
    param.asymmetryWarn,
    param.asymmetryBad
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header com label + técnica opcional */}
      <div className="px-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            {param.label}
          </h3>
          {param.hint && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {param.hint}
            </p>
          )}
        </div>
      </div>

      {/* Direito + Esquerdo lado-a-lado em sm+, empilhado em mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ParameterCard
          param={dParam}
          raw={values[dKey] ?? ""}
          onChange={(raw) => onChange(dKey, raw)}
          onStep={(dir) => onStep(dKey, dir)}
          index={index * 2}
          guideImage={param.guideImage}
          guideTip={param.guideTip}
        />
        <ParameterCard
          param={eParam}
          raw={values[eKey] ?? ""}
          onChange={(raw) => onChange(eKey, raw)}
          onStep={(dir) => onStep(eKey, dir)}
          index={index * 2 + 1}
          guideImage={param.guideImage}
          guideTip={param.guideTip}
        />
      </div>

      {/* Banner de assimetria — só aparece quando ambos preenchidos */}
      {asymmetry && (
        <div
          aria-live="polite"
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
            "animate-in fade-in slide-in-from-top-1 duration-300",
            asymmetry.level === "ok" &&
              "bg-success/10 border-success/30 text-success",
            asymmetry.level === "warn" &&
              "bg-orange-500/10 border-orange-500/30 text-orange-500",
            asymmetry.level === "bad" &&
              "bg-destructive/10 border-destructive/30 text-destructive"
          )}
        >
          {asymmetry.level === "ok" ? (
            <CheckCircle2 className="size-3.5 shrink-0" />
          ) : (
            <AlertCircle className="size-3.5 shrink-0" />
          )}
          <span className="leading-relaxed">
            <span className="font-semibold">
              Assimetria de {asymmetry.diffPct.toFixed(1).replace(".", ",")}%
            </span>{" "}
            ({asymmetry.diffCm.toFixed(1).replace(".", ",")}cm) em{" "}
            {param.label.toLowerCase()}
            {asymmetry.level === "ok"
              ? " — aceitável"
              : asymmetry.level === "warn"
                ? " — atenção"
                : " — alterada"}
          </span>
        </div>
      )}
    </div>
  );
}
