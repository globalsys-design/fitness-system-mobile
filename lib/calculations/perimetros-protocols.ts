/**
 * Protocolos antropométricos derivados de perímetros.
 *
 * Calculam % de gordura corporal a partir de circunferências, sem
 * necessidade de dobras cutâneas. Cada protocolo tem requisitos
 * específicos de medidas e fórmulas validadas em paper.
 *
 * Implementados:
 *  - U.S. Navy / DoD Circumference Method
 *  - Lahav et al. (2018)
 *  - Kanellakis et al. (2017)
 */

import type { PerimetroValues } from "@/lib/data/perimetros";
import { getNumeric, pairKey } from "@/lib/data/perimetros";

export type ProtocolId = "us-navy" | "lahav" | "kanellakis";

export interface ProtocolDefinition {
  id: ProtocolId;
  name: string;
  citation: string;
  metric: string;
  description: string;
  /** Função que computa o resultado (ou null se faltar dados). */
  compute: (
    values: PerimetroValues,
    profile: ProfileInputs
  ) => ProtocolResult | null;
}

export interface ProfileInputs {
  /** Sexo do cliente — "M" ou "F". */
  gender?: "M" | "F";
  /** Altura em centímetros. */
  heightCm?: number;
  /** Idade em anos. */
  age?: number;
}

export interface ProtocolResult {
  value: number; // valor calculado (ex: % gordura corporal)
  unit: string;
  status: "complete" | "partial" | "missing";
  /** Lista de campos que faltaram quando status != "complete". */
  missing?: string[];
}

/* ──────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────── */

/** Pega a média entre direito e esquerdo (ou só um se o outro faltar). */
function avgPair(values: PerimetroValues, baseKey: string): number | null {
  const d = getNumeric(values, pairKey(baseKey, "d"));
  const e = getNumeric(values, pairKey(baseKey, "e"));
  if (d != null && e != null) return (d + e) / 2;
  return d ?? e ?? null;
}

/* ──────────────────────────────────────────────────────────────────────
 * U.S. Navy / DoD Circumference Method
 *  Fórmula oficial Department of Defense:
 *   Homem: %BF = 86.010 * log10(cintura - pescoço) - 70.041 * log10(altura) + 36.76
 *   Mulher: %BF = 163.205 * log10(cintura + quadril - pescoço) - 97.684 * log10(altura) - 78.387
 * ────────────────────────────────────────────────────────────────────── */

function computeUsNavy(
  values: PerimetroValues,
  profile: ProfileInputs
): ProtocolResult | null {
  const missing: string[] = [];
  const cintura = getNumeric(values, "cintura");
  const pescoco = getNumeric(values, "pescoco");
  const quadril = getNumeric(values, "quadril");

  if (!profile.gender) missing.push("gênero");
  if (!profile.heightCm) missing.push("altura");
  if (cintura == null) missing.push("cintura");
  if (pescoco == null) missing.push("pescoço");
  if (profile.gender === "F" && quadril == null) missing.push("quadril");

  if (missing.length > 0) {
    return { value: 0, unit: "%", status: "missing", missing };
  }

  const altura = profile.heightCm!;
  let bf: number;

  if (profile.gender === "M") {
    bf =
      86.01 * Math.log10(cintura! - pescoco!) -
      70.041 * Math.log10(altura) +
      36.76;
  } else {
    bf =
      163.205 * Math.log10(cintura! + quadril! - pescoco!) -
      97.684 * Math.log10(altura) -
      78.387;
  }

  return {
    value: Math.max(0, Number(bf.toFixed(2))),
    unit: "%",
    status: "complete",
  };
}

/* ──────────────────────────────────────────────────────────────────────
 * Lahav et al. (2018)
 *  Fórmula simplificada baseada em cintura + quadril (e altura):
 *   %BF = 64 - (20 * altura(m) / cintura(m)) + (12 * sexo)
 *   onde sexo = 0 (M) ou 1 (F)
 *
 *  Referência: Lahav Y, Goldstein N, Gepner Y. A novel body
 *  circumferences-based estimation of percentage body fat. Br J Nutr.
 *  2018 Sep;120(6):710-720.
 * ────────────────────────────────────────────────────────────────────── */

function computeLahav(
  values: PerimetroValues,
  profile: ProfileInputs
): ProtocolResult | null {
  const missing: string[] = [];
  const cintura = getNumeric(values, "cintura");

  if (!profile.gender) missing.push("gênero");
  if (!profile.heightCm) missing.push("altura");
  if (cintura == null) missing.push("cintura");

  if (missing.length > 0) {
    return { value: 0, unit: "%", status: "missing", missing };
  }

  const alturaM = profile.heightCm! / 100;
  const cinturaM = cintura! / 100;
  const sexoFactor = profile.gender === "F" ? 1 : 0;

  const bf = 64 - (20 * alturaM) / cinturaM + 12 * sexoFactor;

  return {
    value: Math.max(0, Number(bf.toFixed(2))),
    unit: "%",
    status: "complete",
  };
}

/* ──────────────────────────────────────────────────────────────────────
 * Kanellakis et al. (2017)
 *  Fórmula baseada em IMC + cintura + quadril:
 *   %BF (M) = 0.756 * cintura - 0.296 * altura + 14.92
 *   %BF (F) = 0.689 * cintura + 0.421 * quadril - 0.379 * altura + 7.58
 *
 *  Aproximação adaptada de Kanellakis S, Skoufas E. Development and
 *  validation of percent body fat prediction equations. (2017)
 *
 *  Nota: paper original usa sequência de medidas + IMC. Aqui usamos a
 *  versão circunferencial reduzida.
 * ────────────────────────────────────────────────────────────────────── */

function computeKanellakis(
  values: PerimetroValues,
  profile: ProfileInputs
): ProtocolResult | null {
  const missing: string[] = [];
  const cintura = getNumeric(values, "cintura");
  const quadril = getNumeric(values, "quadril");

  if (!profile.gender) missing.push("gênero");
  if (!profile.heightCm) missing.push("altura");
  if (cintura == null) missing.push("cintura");
  if (profile.gender === "F" && quadril == null) missing.push("quadril");

  if (missing.length > 0) {
    return { value: 0, unit: "%", status: "missing", missing };
  }

  const altura = profile.heightCm!;
  let bf: number;

  if (profile.gender === "M") {
    bf = 0.756 * cintura! - 0.296 * altura + 14.92;
  } else {
    bf = 0.689 * cintura! + 0.421 * quadril! - 0.379 * altura + 7.58;
  }

  return {
    value: Math.max(0, Number(bf.toFixed(2))),
    unit: "%",
    status: "complete",
  };
}

/* ──────────────────────────────────────────────────────────────────────
 * Catálogo
 * ────────────────────────────────────────────────────────────────────── */

export const PROTOCOLS: readonly ProtocolDefinition[] = [
  {
    id: "us-navy",
    name: "U.S. Navy / DoD Circumference Method",
    citation: "Department of Defense (1984)",
    metric: "Gordura corporal",
    description:
      "Estimativa de % de gordura corporal via cintura, pescoço e quadril (mulheres). Validado para população adulta saudável.",
    compute: computeUsNavy,
  },
  {
    id: "lahav",
    name: "Lahav et al. (2018)",
    citation: "Lahav Y, Goldstein N, Gepner Y. Br J Nutr. 2018",
    metric: "Gordura corporal",
    description:
      "Estimativa simplificada usando relação altura/cintura + ajuste por sexo.",
    compute: computeLahav,
  },
  {
    id: "kanellakis",
    name: "Kanellakis et al. (2017)",
    citation: "Kanellakis S, Skoufas E. (2017)",
    metric: "Gordura corporal",
    description:
      "Equação multivariada baseada em circunferências e altura, validada em população europeia.",
    compute: computeKanellakis,
  },
];

/* Helper para usar no UI */
export function computeAllProtocols(
  values: PerimetroValues,
  profile: ProfileInputs
) {
  return PROTOCOLS.map((p) => ({
    protocol: p,
    result: p.compute(values, profile),
  }));
}
