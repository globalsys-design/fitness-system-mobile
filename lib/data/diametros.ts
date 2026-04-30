/**
 * Diâmetros Ósseos — banco de medidas antropométricas.
 *
 * **UI/state em mm** (unidade natural do paquímetro). A conversão para cm
 * é exibida em tempo real pelo `secondaryUnit` do `ParameterCard`.
 * Persistência segue em **cm** (compat com perímetros e dados antigos),
 * com conversão mm↔cm no boundary da página.
 *
 * Estrutura alinhada ao padrão de Perímetros (mesma família visual):
 *  - Diâmetros do Tronco (torácicos, biacromial, biiliaco, bitrocanterico)
 *  - Diâmetros das Articulações (punho, cotovelo, joelho, tornozelo)
 *
 * Fonte: ISAK (International Society for the Advancement of Kinanthropometry).
 * Step de 1 mm — paquímetro lê precisão milimétrica direta.
 */

import { Maximize2 } from "lucide-react";
import type { BasalParam } from "@/lib/data/parametros-basais";

export interface DiametroParam extends BasalParam {
  guideImage?: string;
  guideTip?: string;
}

/**
 * Helper de criação. `rangeMm` é a faixa em milímetros.
 */
const baseParam = (
  key: string,
  label: string,
  short: string,
  rangeMm: [number, number],
  hint: string
): DiametroParam => ({
  key,
  label,
  short,
  unit: "mm",
  icon: Maximize2,
  iconColor: "text-primary",
  iconBg: "bg-primary/10",
  scaleMin: rangeMm[0],
  scaleMax: rangeMm[1],
  step: 1,
  decimals: 0,
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
    [200, 400],
    "Distância máxima entre as faces laterais do tórax na linha mamilar, expiração tranquila"
  ),
  baseParam(
    "toracico_ap",
    "Torácico ântero-posterior",
    "Tórax A-P",
    [140, 300],
    "Distância entre o esterno e a coluna vertebral na linha mamilar, expiração tranquila"
  ),
  baseParam(
    "biacromial",
    "Biacromial",
    "Biacromial",
    [300, 500],
    "Distância máxima entre os pontos acromiais (ombros relaxados, braços ao longo do corpo)"
  ),
  baseParam(
    "biiliaco",
    "Bi-iliocristal",
    "Bi-iliaco",
    [200, 400],
    "Distância máxima entre as cristas ilíacas"
  ),
  baseParam(
    "bitrocanterico",
    "Bitrocantérico",
    "Bitrocant.",
    [250, 450],
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
    [40, 80],
    "Distância entre os processos estilóides do rádio e da ulna, mão pronada"
  ),
  baseParam(
    "biepicondilo_umeral",
    "Biepicôndilo Umeral (Cotovelo)",
    "Cotovelo",
    [50, 100],
    "Distância entre os epicôndilos medial e lateral do úmero, cotovelo flexionado a 90°"
  ),
  baseParam(
    "biepicondilo_femoral",
    "Biepicôndilo Femoral (Joelho)",
    "Joelho",
    [70, 120],
    "Distância entre os côndilos medial e lateral do fêmur, joelho flexionado a 90°"
  ),
  baseParam(
    "bimaleolar",
    "Bimaleolar (Tornozelo)",
    "Tornozelo",
    [50, 100],
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
