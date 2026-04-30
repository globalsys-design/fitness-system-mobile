/**
 * Escore de Risco de Framingham — banco de opções e tabela oficial de pontos.
 *
 * Diferenças vs a versão numérica anterior:
 *  - Idade e gênero: puxados do perfil do cliente (não pergunta no formulário)
 *  - Colesterol total / HDL / PA Sistólica: dropdowns com faixas categorizadas
 *    cujos limites batem exatamente com as bandas oficiais de Framingham
 *  - Tabagismo e PA tratada: Sim/Não (mantidos)
 *
 * Tabela de pontos preserva a fonte original (Framingham Heart Study, 2008).
 */

export type FraminghamGender = "M" | "F";

/* ──────────────────────────────────────────────────────────────────────
 * Tipo dos selects de faixa
 * ────────────────────────────────────────────────────────────────────── */

export interface FraminghamRangeOption {
  value: string;
  label: string;
}

/* ──────────────────────────────────────────────────────────────────────
 * Opções dos dropdowns (espelham os limites de pontuação do protocolo)
 * ────────────────────────────────────────────────────────────────────── */

export const CHOLESTEROL_OPTIONS: readonly FraminghamRangeOption[] = [
  { value: "ch-lt160", label: "Menor que 160 mg/dL" },
  { value: "ch-160-199", label: "Entre 160 e 199 mg/dL" },
  { value: "ch-200-239", label: "Entre 200 e 239 mg/dL" },
  { value: "ch-240-279", label: "Entre 240 e 279 mg/dL" },
  { value: "ch-gte280", label: "Maior ou igual a 280 mg/dL" },
] as const;

export const HDL_OPTIONS: readonly FraminghamRangeOption[] = [
  { value: "hdl-gte60", label: "Maior ou igual a 60 mg/dL" },
  { value: "hdl-50-59", label: "Entre 50 e 59 mg/dL" },
  { value: "hdl-40-49", label: "Entre 40 e 49 mg/dL" },
  { value: "hdl-lt40", label: "Menor que 40 mg/dL" },
] as const;

export const SYSTOLIC_OPTIONS: readonly FraminghamRangeOption[] = [
  { value: "sbp-lt120", label: "Menor que 120 mmHg" },
  { value: "sbp-120-129", label: "Entre 120 e 129 mmHg" },
  { value: "sbp-130-139", label: "Entre 130 e 139 mmHg" },
  { value: "sbp-140-159", label: "Entre 140 e 159 mmHg" },
  { value: "sbp-gte160", label: "Maior ou igual a 160 mmHg" },
] as const;

/* ──────────────────────────────────────────────────────────────────────
 * Pontuação por idade (tabela oficial Framingham)
 * ────────────────────────────────────────────────────────────────────── */

export function ageToPoints(age: number, gender: FraminghamGender): number {
  if (gender === "M") {
    if (age < 20) return -9; // extrapola — idade muito baixa
    if (age <= 34) return -9;
    if (age <= 39) return -4;
    if (age <= 44) return 0;
    if (age <= 49) return 3;
    if (age <= 54) return 6;
    if (age <= 59) return 8;
    if (age <= 64) return 10;
    if (age <= 69) return 11;
    if (age <= 74) return 12;
    return 13;
  }
  // Feminino
  if (age < 20) return -7;
  if (age <= 34) return -7;
  if (age <= 39) return -3;
  if (age <= 44) return 0;
  if (age <= 49) return 3;
  if (age <= 54) return 6;
  if (age <= 59) return 8;
  if (age <= 64) return 10;
  if (age <= 69) return 12;
  if (age <= 74) return 14;
  return 16;
}

/* ──────────────────────────────────────────────────────────────────────
 * Pontuação para colesterol total
 * (a tabela oficial varia por idade; aqui usamos a faixa mediana adultos
 * 40-49 anos, que é a mais aplicada na clínica brasileira; refinamento
 * por idade pode ser adicionado depois sem quebrar o tipo)
 * ────────────────────────────────────────────────────────────────────── */

export function cholesterolToPoints(
  optionValue: string | undefined,
  gender: FraminghamGender
): number {
  if (!optionValue) return 0;
  // Pontos por faixa (adultos 40-49 anos — mediana clínica)
  const tableM: Record<string, number> = {
    "ch-lt160": 0,
    "ch-160-199": 3,
    "ch-200-239": 5,
    "ch-240-279": 6,
    "ch-gte280": 8,
  };
  const tableF: Record<string, number> = {
    "ch-lt160": 0,
    "ch-160-199": 3,
    "ch-200-239": 6,
    "ch-240-279": 8,
    "ch-gte280": 10,
  };
  return (gender === "M" ? tableM : tableF)[optionValue] ?? 0;
}

/* ──────────────────────────────────────────────────────────────────────
 * HDL — pontos
 * ────────────────────────────────────────────────────────────────────── */

export function hdlToPoints(optionValue: string | undefined): number {
  if (!optionValue) return 0;
  const table: Record<string, number> = {
    "hdl-gte60": -1,
    "hdl-50-59": 0,
    "hdl-40-49": 1,
    "hdl-lt40": 2,
  };
  return table[optionValue] ?? 0;
}

/* ──────────────────────────────────────────────────────────────────────
 * PA Sistólica — pontos (varia se está em tratamento)
 * ────────────────────────────────────────────────────────────────────── */

export function systolicToPoints(
  optionValue: string | undefined,
  gender: FraminghamGender,
  isTreated: boolean
): number {
  if (!optionValue) return 0;
  if (gender === "M") {
    if (!isTreated) {
      const t: Record<string, number> = {
        "sbp-lt120": 0,
        "sbp-120-129": 0,
        "sbp-130-139": 1,
        "sbp-140-159": 1,
        "sbp-gte160": 2,
      };
      return t[optionValue] ?? 0;
    }
    const t: Record<string, number> = {
      "sbp-lt120": 0,
      "sbp-120-129": 1,
      "sbp-130-139": 2,
      "sbp-140-159": 2,
      "sbp-gte160": 3,
    };
    return t[optionValue] ?? 0;
  }
  // Feminino
  if (!isTreated) {
    const t: Record<string, number> = {
      "sbp-lt120": 0,
      "sbp-120-129": 1,
      "sbp-130-139": 2,
      "sbp-140-159": 3,
      "sbp-gte160": 4,
    };
    return t[optionValue] ?? 0;
  }
  const t: Record<string, number> = {
    "sbp-lt120": 0,
    "sbp-120-129": 3,
    "sbp-130-139": 4,
    "sbp-140-159": 5,
    "sbp-gte160": 6,
  };
  return t[optionValue] ?? 0;
}

/* ──────────────────────────────────────────────────────────────────────
 * Tabagismo / Diabetes — pontos
 * ────────────────────────────────────────────────────────────────────── */

export function smokerToPoints(
  isSmoker: boolean,
  gender: FraminghamGender
): number {
  if (!isSmoker) return 0;
  return gender === "M" ? 8 : 9;
}

export function diabetesToPoints(
  hasDiabetes: boolean,
  gender: FraminghamGender
): number {
  if (!hasDiabetes) return 0;
  return gender === "M" ? 5 : 7;
}

/* ──────────────────────────────────────────────────────────────────────
 * Score total → risco em 10 anos (%)
 * ────────────────────────────────────────────────────────────────────── */

export function pointsTo10YearRisk(
  points: number,
  gender: FraminghamGender
): number {
  if (gender === "M") {
    if (points <= 0) return 1;
    if (points <= 4) return 1;
    if (points <= 6) return 2;
    if (points <= 8) return 5;
    if (points <= 10) return 6;
    if (points <= 12) return 10;
    if (points <= 14) return 16;
    if (points <= 16) return 25;
    return 30;
  }
  if (points <= 8) return 1;
  if (points <= 12) return 1;
  if (points <= 14) return 2;
  if (points <= 16) return 4;
  if (points <= 18) return 6;
  if (points <= 20) return 11;
  if (points <= 22) return 17;
  if (points <= 24) return 25;
  return 30;
}

/* ──────────────────────────────────────────────────────────────────────
 * Tipo de dado persistido + cálculo end-to-end
 * ────────────────────────────────────────────────────────────────────── */

export interface FraminghamDataV2 {
  version: "v2";
  /** Faixa selecionada para colesterol total (key dos CHOLESTEROL_OPTIONS) */
  cholesterol?: string;
  /** Faixa selecionada para HDL (key dos HDL_OPTIONS) */
  hdl?: string;
  /** Faixa selecionada para PA sistólica (key dos SYSTOLIC_OPTIONS) */
  systolic?: string;
  isSmoker?: boolean;
  isTreatedBP?: boolean;
  hasDiabetes?: boolean;
  notes?: string;
  completedAt?: string;
  /** Cache do score calculado no momento do save (não-autoritativo). */
  score?: number;
  risk10Year?: number;
}

export function calcAge(birthDate: Date | string | null | undefined): number | null {
  if (!birthDate) return null;
  const d = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function calcFraminghamV2(
  data: FraminghamDataV2,
  gender: FraminghamGender,
  age: number
): { score: number; risk10Year: number } {
  let score = 0;
  score += ageToPoints(age, gender);
  score += cholesterolToPoints(data.cholesterol, gender);
  score += hdlToPoints(data.hdl);
  score += systolicToPoints(data.systolic, gender, !!data.isTreatedBP);
  score += smokerToPoints(!!data.isSmoker, gender);
  score += diabetesToPoints(!!data.hasDiabetes, gender);
  const risk10Year = pointsTo10YearRisk(score, gender);
  return { score, risk10Year };
}

export interface FraminghamBreakdownItem {
  label: string;
  points: number;
}

export function buildFraminghamBreakdown(
  data: FraminghamDataV2,
  gender: FraminghamGender,
  age: number
): FraminghamBreakdownItem[] {
  const out: FraminghamBreakdownItem[] = [];
  out.push({ label: `Idade (${age} anos)`, points: ageToPoints(age, gender) });
  if (data.cholesterol) {
    const opt = CHOLESTEROL_OPTIONS.find((o) => o.value === data.cholesterol);
    out.push({
      label: `Colesterol — ${opt?.label ?? "—"}`,
      points: cholesterolToPoints(data.cholesterol, gender),
    });
  }
  if (data.hdl) {
    const opt = HDL_OPTIONS.find((o) => o.value === data.hdl);
    out.push({ label: `HDL — ${opt?.label ?? "—"}`, points: hdlToPoints(data.hdl) });
  }
  if (data.systolic) {
    const opt = SYSTOLIC_OPTIONS.find((o) => o.value === data.systolic);
    out.push({
      label: `PA Sistólica — ${opt?.label ?? "—"}${data.isTreatedBP ? " · tratada" : ""}`,
      points: systolicToPoints(data.systolic, gender, !!data.isTreatedBP),
    });
  }
  if (data.isSmoker)
    out.push({ label: "Fumante atual", points: smokerToPoints(true, gender) });
  if (data.hasDiabetes)
    out.push({ label: "Diabetes", points: diabetesToPoints(true, gender) });
  return out;
}

export function isFraminghamComplete(data: FraminghamDataV2): boolean {
  return (
    !!data.cholesterol &&
    !!data.hdl &&
    !!data.systolic &&
    typeof data.isSmoker === "boolean" &&
    typeof data.isTreatedBP === "boolean" &&
    typeof data.hasDiabetes === "boolean"
  );
}
