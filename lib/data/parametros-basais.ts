/**
 * Parâmetros Basais — banco de parâmetros, zonas e helpers de classificação.
 *
 * Fonte: Ministério da Saúde, SBC 2020, SBD 2023, OMS.
 * Faixas didáticas — conduta clínica é responsabilidade do profissional.
 */

import { Activity, Droplets, Heart, Thermometer, Wind } from "lucide-react";

export type BasalTone = "ok" | "low" | "warn" | "bad";

export interface BasalZone {
  /** Limite superior INCLUSIVO da zona. */
  max: number;
  tone: BasalTone;
  label: string;
}

export interface BasalParam {
  key: string;
  label: string;
  short: string;
  unit: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  scaleMin: number;
  scaleMax: number;
  /**
   * Faixas clínicas. Quando omitidas, o ParameterCard renderiza modo
   * neutro (sem badge, sem cor adaptativa, trilha primary contínua).
   * Use para parâmetros sem classificação clínica (ex: perímetros).
   */
  zones?: readonly BasalZone[];
  step?: number;
  decimals?: number;
  hint: string;
}

export const BASAL_PARAMS: readonly BasalParam[] = [
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
      { max: 89, tone: "low", label: "Baixa" },
      { max: 129, tone: "ok", label: "Normal" },
      { max: 139, tone: "warn", label: "Elevada" },
      { max: 200, tone: "bad", label: "Alta" },
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
      { max: 59, tone: "low", label: "Baixa" },
      { max: 84, tone: "ok", label: "Normal" },
      { max: 89, tone: "warn", label: "Elevada" },
      { max: 120, tone: "bad", label: "Alta" },
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
      { max: 69, tone: "low", label: "Hipoglicemia" },
      { max: 99, tone: "ok", label: "Normal" },
      { max: 125, tone: "warn", label: "Pré-diabetes" },
      { max: 300, tone: "bad", label: "Alta" },
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
      { max: 35.4, tone: "low", label: "Hipotermia" },
      { max: 37.4, tone: "ok", label: "Normal" },
      { max: 37.9, tone: "warn", label: "Febrícula" },
      { max: 42, tone: "bad", label: "Febre" },
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
      { max: 59, tone: "low", label: "Bradicardia" },
      { max: 100, tone: "ok", label: "Normal" },
      { max: 120, tone: "warn", label: "Elevada" },
      { max: 200, tone: "bad", label: "Taquicardia" },
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
      { max: 89, tone: "bad", label: "Crítica" },
      { max: 94, tone: "warn", label: "Reduzida" },
      { max: 100, tone: "ok", label: "Normal" },
    ],
    hint: "Normal ≥ 95 %",
  },
];

export const BASAL_TONE_CLASSES: Record<
  BasalTone,
  { text: string; bg: string; border: string; bar: string; ring: string }
> = {
  ok: {
    text: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    bar: "bg-success",
    ring: "ring-success/30",
  },
  low: {
    text: "text-info",
    bg: "bg-info/10",
    border: "border-info/30",
    bar: "bg-info",
    ring: "ring-info/30",
  },
  warn: {
    text: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    bar: "bg-orange-500",
    ring: "ring-orange-500/30",
  },
  bad: {
    text: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    bar: "bg-destructive",
    ring: "ring-destructive/30",
  },
};

export function zoneFor(
  value: number,
  zones: BasalZone[] | readonly BasalZone[] | undefined
): BasalZone | null {
  if (!zones || zones.length === 0) return null;
  if (Number.isNaN(value)) return null;
  for (const z of zones) {
    if (value <= z.max) return z;
  }
  return zones[zones.length - 1] ?? null;
}

export function parseBasalNumber(raw: string): number | null {
  if (raw === "" || raw === "-" || raw === ".") return null;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/* ──────────────────────────────────────────────────────────────────────
 * Tipo persistido + classificação global
 * ────────────────────────────────────────────────────────────────────── */

export type BasalValues = Record<string, string>;

export type BasalRiskLevel = "all-normal" | "all-pending" | "warn" | "bad";

export interface BasalSummary {
  filled: number;
  total: number;
  byTone: Record<BasalTone, number>;
  /** Pior zona presente entre os parâmetros preenchidos. */
  worstTone: BasalTone | null;
  riskLevel: BasalRiskLevel;
}

export function summarizeBasal(values: BasalValues): BasalSummary {
  const byTone: Record<BasalTone, number> = { ok: 0, low: 0, warn: 0, bad: 0 };
  let filled = 0;

  for (const p of BASAL_PARAMS) {
    const v = parseBasalNumber(values[p.key] ?? "");
    if (v == null) continue;
    filled++;
    const z = zoneFor(v, p.zones);
    if (z) byTone[z.tone]++;
  }

  let worstTone: BasalTone | null = null;
  // ordem de severidade: bad > warn > low > ok
  if (byTone.bad > 0) worstTone = "bad";
  else if (byTone.warn > 0) worstTone = "warn";
  else if (byTone.low > 0) worstTone = "low";
  else if (byTone.ok > 0) worstTone = "ok";

  let riskLevel: BasalRiskLevel = "all-pending";
  if (filled === 0) riskLevel = "all-pending";
  else if (worstTone === "bad") riskLevel = "bad";
  else if (worstTone === "warn") riskLevel = "warn";
  else riskLevel = "all-normal";

  return {
    filled,
    total: BASAL_PARAMS.length,
    byTone,
    worstTone,
    riskLevel,
  };
}

/* ──────────────────────────────────────────────────────────────────────
 * BP combinada (sistólica + diastólica) — classificação unificada
 * ────────────────────────────────────────────────────────────────────── */

export function classifyBloodPressure(
  systolic: number | null,
  diastolic: number | null
): { label: string; tone: BasalTone } | null {
  if (systolic == null || diastolic == null) return null;
  if (systolic >= 180 || diastolic >= 110)
    return { label: "Hipertensão grave", tone: "bad" };
  if (systolic >= 140 || diastolic >= 90)
    return { label: "Hipertensão", tone: "bad" };
  if (systolic >= 130 || diastolic >= 85)
    return { label: "Pressão elevada", tone: "warn" };
  if (systolic < 90 || diastolic < 60)
    return { label: "Hipotensão", tone: "low" };
  return { label: "Pressão normal", tone: "ok" };
}
