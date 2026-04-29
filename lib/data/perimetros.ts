/**
 * Perímetros Corporais — banco de medidas antropométricas (cm).
 *
 * Estrutura alinhada ao protótipo Globalsys 2026-04-29:
 *  - Medidas Superiores (singletons: pescoço, ombro, tórax, etc.)
 *  - Medidas dos Braços (paired: D/E com assimetria)
 *  - Medidas Inferiores (paired: D/E com assimetria)
 *  - Protocolos derivados (computados, não medidos)
 *
 * Reusa o tipo `BasalParam` (de @/lib/data/parametros-basais) — o
 * `ParameterCard` é o mesmo componente, com `zones` omitidas (perímetros
 * não têm classificação clínica universal).
 *
 * Fonte: ISAK (International Society for the Advancement of Kinanthropometry).
 */

import { Ruler } from "lucide-react";
import type { BasalParam } from "@/lib/data/parametros-basais";

/* ──────────────────────────────────────────────────────────────────────
 * Medidas singletons (sem D/E)
 * ────────────────────────────────────────────────────────────────────── */

export interface PerimetroSingleParam extends BasalParam {
  guideImage?: string;
  guideTip?: string;
}

const baseParam = (
  key: string,
  label: string,
  short: string,
  range: [number, number],
  hint = ""
): PerimetroSingleParam => ({
  key,
  label,
  short,
  unit: "cm",
  icon: Ruler,
  iconColor: "text-primary",
  iconBg: "bg-primary/10",
  scaleMin: range[0],
  scaleMax: range[1],
  step: 0.5,
  decimals: 1,
  hint,
});

/* ──────────────────────────────────────────────────────────────────────
 * Pairs — medidas com lado direito + esquerdo
 * ────────────────────────────────────────────────────────────────────── */

export interface PerimetroPairParam {
  key: string; // chave base (ex: "braco_relaxado") — D/E ficam como sufixos
  label: string;
  short: string;
  unit: "cm";
  range: [number, number];
  step: number;
  decimals: number;
  hint?: string;
  guideImage?: string;
  guideTip?: string;
  /**
   * Limite de assimetria aceitável (em %). Acima → atenção.
   * Default 3% (referência geral).
   */
  asymmetryWarn?: number;
  /**
   * Limite de assimetria crítica (em %). Acima → alerta.
   * Default 5%.
   */
  asymmetryBad?: number;
}

const basePair = (
  key: string,
  label: string,
  short: string,
  range: [number, number],
  hint?: string
): PerimetroPairParam => ({
  key,
  label,
  short,
  unit: "cm",
  range,
  step: 0.5,
  decimals: 1,
  hint,
  asymmetryWarn: 3,
  asymmetryBad: 5,
});

/* ──────────────────────────────────────────────────────────────────────
 * Seções
 * ────────────────────────────────────────────────────────────────────── */

export const PERIMETRO_SUPERIORES: readonly PerimetroSingleParam[] = [
  baseParam("pescoco", "Pescoço", "Pescoço", [25, 60], "Logo abaixo da laringe, perpendicular ao eixo do pescoço"),
  baseParam("ombro", "Ombro", "Ombro", [70, 160], "Maior circunferência sobre a região deltóide"),
  baseParam("tronco_normal", "Tronco normal", "Tronco", [60, 160], "Linha mamilar, expiração tranquila"),
  baseParam("tronco_inspirado", "Tronco inspirado", "Tronco insp.", [60, 170], "Linha mamilar, inspiração máxima"),
  baseParam("cintura", "Cintura", "Cintura", [50, 200], "Menor circunferência entre costelas e crista ilíaca"),
  baseParam("abdomen", "Abdômen", "Abdômen", [50, 200], "Na altura da cicatriz umbilical"),
  baseParam("quadril", "Quadril", "Quadril", [60, 200], "Maior circunferência sobre os trocânteres"),
] as const;

export const PERIMETRO_BRACOS: readonly PerimetroPairParam[] = [
  basePair(
    "braco_relaxado",
    "Braço relaxado",
    "Braço rel.",
    [15, 60],
    "Ponto médio entre acrômio e olécrano, braço estendido"
  ),
  basePair(
    "braco_contraido",
    "Braço contraído",
    "Braço contr.",
    [15, 70],
    "Mesma altura do relaxado, com flexão isométrica"
  ),
  basePair(
    "antebraco",
    "Antebraço",
    "Antebraço",
    [15, 50],
    "Maior circunferência do antebraço, mão pronada"
  ),
] as const;

export const PERIMETRO_INFERIORES: readonly PerimetroPairParam[] = [
  basePair(
    "coxa",
    "Coxa",
    "Coxa",
    [30, 100],
    "Logo abaixo do glúteo, eixo perpendicular ao fêmur"
  ),
  basePair(
    "panturrilha",
    "Panturrilha",
    "Panturrilha",
    [20, 60],
    "Maior circunferência da panturrilha, perna em ângulo reto"
  ),
] as const;

/* ──────────────────────────────────────────────────────────────────────
 * Tipo persistido
 * ────────────────────────────────────────────────────────────────────── */

export type PerimetroValues = Record<string, string>;

/**
 * Para pares, as chaves no values usam sufixos:
 *   braco_relaxado_d, braco_relaxado_e
 */
export function pairKey(baseKey: string, side: "d" | "e"): string {
  return `${baseKey}_${side}`;
}

/* ──────────────────────────────────────────────────────────────────────
 * Cálculo de assimetria
 * ────────────────────────────────────────────────────────────────────── */

export interface AsymmetryResult {
  diffCm: number; // |D - E|
  diffPct: number; // (|D - E| / max(D, E)) * 100
  level: "ok" | "warn" | "bad";
}

export function computeAsymmetry(
  direito: number | null,
  esquerdo: number | null,
  warnPct = 3,
  badPct = 5
): AsymmetryResult | null {
  if (direito == null || esquerdo == null) return null;
  if (direito === 0 && esquerdo === 0) return null;
  const diffCm = Math.abs(direito - esquerdo);
  const max = Math.max(direito, esquerdo);
  const diffPct = max > 0 ? (diffCm / max) * 100 : 0;
  let level: AsymmetryResult["level"] = "ok";
  if (diffPct >= badPct) level = "bad";
  else if (diffPct >= warnPct) level = "warn";
  return { diffCm, diffPct, level };
}

/* ──────────────────────────────────────────────────────────────────────
 * Helpers para pegar valores do dict
 * ────────────────────────────────────────────────────────────────────── */

export function getNumeric(
  values: PerimetroValues,
  key: string
): number | null {
  const raw = values[key];
  if (!raw || raw.trim() === "") return null;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/* ──────────────────────────────────────────────────────────────────────
 * Resumo de progresso (X/N preenchidos)
 * ────────────────────────────────────────────────────────────────────── */

export function countFilled(values: PerimetroValues): {
  filled: number;
  total: number;
} {
  let filled = 0;
  let total = 0;

  for (const p of PERIMETRO_SUPERIORES) {
    total++;
    if (getNumeric(values, p.key) != null) filled++;
  }
  for (const p of [...PERIMETRO_BRACOS, ...PERIMETRO_INFERIORES]) {
    // Cada par conta como 2 (D + E)
    total += 2;
    if (getNumeric(values, pairKey(p.key, "d")) != null) filled++;
    if (getNumeric(values, pairKey(p.key, "e")) != null) filled++;
  }

  return { filled, total };
}
