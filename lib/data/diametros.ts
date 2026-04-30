/**
 * Diâmetros Ósseos — banco de medidas antropométricas (cm).
 *
 * Estrutura alinhada ao padrão de Perímetros (mesma família visual):
 *  - Diâmetros do Tronco (singletons: torácicos, biacromial, biiliaco, bitrocanterico)
 *  - Diâmetros das Articulações (singletons: punho, cotovelo, joelho, tornozelo)
 *
 * Reusa o tipo `BasalParam` e o `ParameterCard` (slider + stepper +/- + guia técnico).
 *
 * Fonte: ISAK (International Society for the Advancement of Kinanthropometry).
 * Step de 0,1 cm (1 mm) — paquímetro tem precisão milimétrica.
 */

import { Maximize2 } from "lucide-react";
import type { BasalParam } from "@/lib/data/parametros-basais";

export interface DiametroParam extends BasalParam {
  guideImage?: string;
  guideTip?: string;
}

const baseParam = (
  key: string,
  label: string,
  short: string,
  range: [number, number],
  hint: string
): DiametroParam => ({
  key,
  label,
  short,
  unit: "cm",
  icon: Maximize2,
  iconColor: "text-primary",
  iconBg: "bg-primary/10",
  scaleMin: range[0],
  scaleMax: range[1],
  step: 0.1,
  decimals: 1,
  hint,
});

/* ──────────────────────────────────────────────────────────────────────
 * Diâmetros do Tronco
 * ────────────────────────────────────────────────────────────────────── */

export const DIAMETRO_TRONCO: readonly DiametroParam[] = [
  baseParam(
    "toracico_transverso",
    "Torácico transverso",
    "Tórax transv.",
    [20, 40],
    "Distância máxima entre as faces laterais do tórax na linha mamilar, expiração tranquila"
  ),
  baseParam(
    "toracico_ap",
    "Torácico ântero-posterior",
    "Tórax A-P",
    [14, 30],
    "Distância entre o esterno e a coluna vertebral na linha mamilar, expiração tranquila"
  ),
  baseParam(
    "biacromial",
    "Biacromial",
    "Biacromial",
    [30, 50],
    "Distância máxima entre os pontos acromiais (ombros relaxados, braços ao longo do corpo)"
  ),
  baseParam(
    "biiliaco",
    "Bi-iliocristal",
    "Bi-iliaco",
    [20, 40],
    "Distância máxima entre as cristas ilíacas"
  ),
  baseParam(
    "bitrocanterico",
    "Bitrocantérico",
    "Bitrocant.",
    [25, 45],
    "Distância máxima entre os trocânteres maiores do fêmur"
  ),
] as const;

/* ──────────────────────────────────────────────────────────────────────
 * Diâmetros das Articulações
 * ────────────────────────────────────────────────────────────────────── */

export const DIAMETRO_ARTICULACOES: readonly DiametroParam[] = [
  baseParam(
    "biestiloide",
    "Biestilóide (Punho)",
    "Punho",
    [4, 8],
    "Distância entre os processos estilóides do rádio e da ulna, mão pronada"
  ),
  baseParam(
    "biepicondilo_umeral",
    "Biepicôndilo Umeral (Cotovelo)",
    "Cotovelo",
    [5, 10],
    "Distância entre os epicôndilos medial e lateral do úmero, cotovelo flexionado a 90°"
  ),
  baseParam(
    "biepicondilo_femoral",
    "Biepicôndilo Femoral (Joelho)",
    "Joelho",
    [7, 12],
    "Distância entre os côndilos medial e lateral do fêmur, joelho flexionado a 90°"
  ),
  baseParam(
    "bimaleolar",
    "Bimaleolar (Tornozelo)",
    "Tornozelo",
    [5, 10],
    "Distância entre os maléolos medial (tíbia) e lateral (fíbula) do tornozelo"
  ),
] as const;

/* ──────────────────────────────────────────────────────────────────────
 * Tipo persistido + helpers
 * ────────────────────────────────────────────────────────────────────── */

export type DiametroValues = Record<string, string>;

export function getNumeric(
  values: DiametroValues,
  key: string
): number | null {
  const raw = values[key];
  if (!raw || raw.trim() === "") return null;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function countFilled(values: DiametroValues): {
  filled: number;
  total: number;
} {
  let filled = 0;
  let total = 0;

  for (const p of [...DIAMETRO_TRONCO, ...DIAMETRO_ARTICULACOES]) {
    total++;
    if (getNumeric(values, p.key) != null) filled++;
  }

  return { filled, total };
}
