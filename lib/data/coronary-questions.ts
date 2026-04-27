/**
 * Estratificação de Risco Coronariano — banco de questões categorizadas.
 *
 * Cada questão tem opções pontuadas (0–5 por padrão). Quanto mais alto o
 * total, maior o risco. Estrutura preparada para crescer com novas questões.
 *
 * Nível de risco (proporcional à fração maxScore total):
 *   ≤ 25%   → low
 *   ≤ 50%   → moderate
 *   ≤ 75%   → high
 *   > 75%   → very-high
 *
 * Convenção de pontuação:
 *   - opções listadas em ordem do MENOR para o MAIOR risco
 *   - exceção: "Tempo de exercício" — mais exercício = menos risco, então
 *     os pontos são invertidos (mais tempo no topo da lista = 0 pts)
 */

export interface CoronaryOption {
  /** valor estável (persistido) */
  value: string;
  label: string;
  points: number;
}

export interface CoronaryQuestion {
  /** chave estável usada como id na persistência */
  key: string;
  label: string;
  options: readonly CoronaryOption[];
}

export const CORONARY_QUESTIONS: readonly CoronaryQuestion[] = [
  {
    key: "age",
    label: "Idade",
    options: [
      { value: "age-10-20", label: "De 10 a 20 anos", points: 0 },
      { value: "age-21-30", label: "Entre 21 e 30 anos", points: 1 },
      { value: "age-31-40", label: "Entre 31 e 40 anos", points: 2 },
      { value: "age-41-50", label: "Entre 41 e 50 anos", points: 3 },
      { value: "age-51-60", label: "Entre 51 e 60 anos", points: 4 },
      { value: "age-60+", label: "Acima de 60 anos", points: 5 },
    ],
  },
  {
    key: "heredity",
    label: "Hereditariedade",
    options: [
      { value: "h-0", label: "Nenhum parente com cardiopatia", points: 0 },
      { value: "h-1", label: "Um parente com cardiopatia", points: 1 },
      { value: "h-2", label: "Dois parentes com cardiopatia", points: 2 },
      { value: "h-3", label: "Três parentes com cardiopatia", points: 3 },
      { value: "h-4", label: "Quatro parentes com cardiopatia", points: 4 },
      { value: "h-5", label: "Cinco parentes com cardiopatia", points: 5 },
    ],
  },
  {
    key: "bodyfat",
    label: "Percentual de gordura",
    options: [
      { value: "bf-lt12", label: "Menor que 12%", points: 0 },
      { value: "bf-12-15", label: "Entre 12 e 15,99%", points: 1 },
      { value: "bf-16-19", label: "Entre 16 e 19,99%", points: 2 },
      { value: "bf-20-21", label: "Entre 20 e 21,99%", points: 3 },
      { value: "bf-22-29", label: "Entre 22 e 29,99%", points: 4 },
      { value: "bf-gt30", label: "Maior que 30%", points: 5 },
    ],
  },
  {
    key: "smoking",
    label: "Tabagismo",
    options: [
      { value: "s-0", label: "Não fuma", points: 0 },
      { value: "s-1-10", label: "Até 10 cigarros por dia", points: 1 },
      { value: "s-11-20", label: "Entre 11 e 20 cigarros por dia", points: 2 },
      { value: "s-21-30", label: "Entre 21 e 30 cigarros por dia", points: 3 },
      { value: "s-31-40", label: "Entre 31 e 40 cigarros por dia", points: 4 },
      { value: "s-40+", label: "Acima de 40 cigarros por dia", points: 5 },
    ],
  },
  {
    // ⚠️ TODO: confirmar opções oficiais com o cliente. Estas são placeholders
    // baseadas em protocolos comuns de estratificação fitness — ordem do
    // MAIOR exercício (menor risco) para o MENOR exercício (maior risco).
    key: "exercise",
    label: "Tempo de exercício",
    options: [
      { value: "ex-6h+", label: "Mais de 6 horas por semana", points: 0 },
      { value: "ex-4-6", label: "Entre 4 e 6 horas por semana", points: 1 },
      { value: "ex-2-4", label: "Entre 2 e 4 horas por semana", points: 2 },
      { value: "ex-1-2", label: "Entre 1 e 2 horas por semana", points: 3 },
      { value: "ex-30-60", label: "Até 1 hora por semana", points: 4 },
      { value: "ex-0", label: "Não realiza atividade física", points: 5 },
    ],
  },
  {
    key: "cholesterol",
    label: "Colesterol",
    options: [
      { value: "ch-lt180", label: "Abaixo de 180 mg/dL", points: 0 },
      { value: "ch-181-205", label: "De 181 a 205 mg/dL", points: 1 },
      { value: "ch-206-230", label: "De 206 a 230 mg/dL", points: 2 },
      { value: "ch-231-255", label: "De 231 a 255 mg/dL", points: 3 },
      { value: "ch-256-280", label: "De 256 a 280 mg/dL", points: 4 },
      { value: "ch-gt280", label: "Acima de 280 mg/dL", points: 5 },
    ],
  },
  {
    key: "systolic",
    label: "Pressão arterial sistólica",
    options: [
      { value: "sbp-110-119", label: "De 110 a 119 mmHg", points: 0 },
      { value: "sbp-120-139", label: "De 120 a 139 mmHg", points: 1 },
      { value: "sbp-140-159", label: "De 140 a 159 mmHg", points: 2 },
      { value: "sbp-160-179", label: "De 160 a 179 mmHg", points: 3 },
      { value: "sbp-180-199", label: "Entre 180 e 199 mmHg", points: 4 },
      { value: "sbp-gt200", label: "Acima de 200 mmHg", points: 5 },
    ],
  },
  {
    key: "diastolic",
    label: "Pressão arterial diastólica",
    options: [
      { value: "dbp-lt70", label: "Abaixo de 70 mmHg", points: 0 },
      { value: "dbp-71-76", label: "De 71 a 76 mmHg", points: 1 },
      { value: "dbp-77-82", label: "De 77 a 82 mmHg", points: 2 },
      { value: "dbp-83-93", label: "De 83 a 93 mmHg", points: 3 },
      { value: "dbp-94-105", label: "De 94 a 105 mmHg", points: 4 },
      { value: "dbp-gt106", label: "Acima de 106 mmHg", points: 5 },
    ],
  },
] as const;

export type CoronaryRiskLevel = "low" | "moderate" | "high" | "very-high";

export interface CoronaryRiskData {
  /** version flag para migração futura */
  version: "v2";
  /** questionKey → optionValue */
  answers: Record<string, string>;
  /** Anotações livres do avaliador */
  notes?: string;
  completedAt?: string;
  /** Cache opcional do nível calculado no momento do save */
  riskLevel?: CoronaryRiskLevel;
  score?: number;
}

/* ──────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────── */

export function getCoronaryMaxScore(): number {
  return CORONARY_QUESTIONS.reduce((sum, q) => {
    const max = Math.max(...q.options.map((o) => o.points));
    return sum + max;
  }, 0);
}

export function findOption(
  questionKey: string,
  optionValue: string | undefined
): CoronaryOption | null {
  if (!optionValue) return null;
  const q = CORONARY_QUESTIONS.find((q) => q.key === questionKey);
  if (!q) return null;
  return q.options.find((o) => o.value === optionValue) ?? null;
}

export function calcCoronaryScore(
  answers: Record<string, string>
): number {
  let total = 0;
  for (const q of CORONARY_QUESTIONS) {
    const opt = findOption(q.key, answers[q.key]);
    if (opt) total += opt.points;
  }
  return total;
}

export function calcCoronaryRiskLevel(
  score: number,
  maxScore: number
): CoronaryRiskLevel {
  if (maxScore <= 0) return "low";
  const pct = score / maxScore;
  if (pct <= 0.25) return "low";
  if (pct <= 0.5) return "moderate";
  if (pct <= 0.75) return "high";
  return "very-high";
}

export function describeCoronaryRisk(level: CoronaryRiskLevel): string {
  switch (level) {
    case "low":
      return "Baixo Risco — Pode iniciar programa de exercícios sem necessidade de avaliação médica adicional.";
    case "moderate":
      return "Risco Moderado — Recomenda-se avaliação médica antes de exercícios vigorosos.";
    case "high":
      return "Risco Alto — Avaliação médica completa antes de qualquer programa de exercícios.";
    case "very-high":
      return "Risco Muito Alto — Necessita avaliação cardiológica imediata antes de iniciar atividade física.";
  }
}

export function isAllAnswered(answers: Record<string, string>): boolean {
  return CORONARY_QUESTIONS.every((q) => !!answers[q.key]);
}
