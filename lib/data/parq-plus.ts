/**
 * PAR-Q+ (2023) — estrutura oficial de 2 etapas com gates condicionais.
 *
 * ETAPA 1 — Triagem Geral (7 perguntas, sempre exibidas)
 *   Se TODAS forem "Não" → risco baixo, libera atividade.
 *   Se QUALQUER for "Sim" → encaminha para Etapa 2 (Acompanhamento).
 *
 * ETAPA 2 — Acompanhamento (10 seções, condicionais)
 *   Cada seção abre com uma pergunta-âncora (gate). Se gate = "Sim",
 *   sub-perguntas são reveladas. Se qualquer sub-pergunta for "Sim" →
 *   risco elevado, recomenda avaliação médica antes da atividade.
 *
 * Textos transcritos ipsis litteris dos designs Figma (node-ids no topo de cada bloco).
 */

export type ParqFollowUp =
  | { type: "none" }
  | {
      type: "checkboxes";
      label: string;
      hint?: string;
      options: readonly string[];
    }
  | {
      type: "textarea";
      label: string;
      hint?: string;
      placeholder?: string;
    };

export interface ParqQuestion {
  /** id estável — usado como chave na persistência */
  id: string;
  /** número exibido (ex: "1", "2", "1.1"). */
  displayNumber?: string;
  /** enunciado principal */
  text: string;
  /** texto auxiliar (ex: "Responda NÃO se…") */
  subText?: string;
  /** follow-up revelado quando resposta = "Sim" */
  followUp?: ParqFollowUp;
}

export interface ParqSection {
  id: string;
  /** ordem (1-10) — reflete numeração "Acompanhamento X" */
  order: number;
  /** "Acompanhamento 1: Condições Ósseas e Articulares" */
  title: string;
  /** pergunta-âncora: abre a seção */
  gate: ParqQuestion;
  /** sub-perguntas reveladas quando gate = Sim */
  subQuestions: ParqQuestion[];
}

/* ──────────────────────────────────────────────────────────────────────
 * ETAPA 1 — TRIAGEM GERAL
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Páginas da Etapa 1. P2 e P3 aparecem juntas no Figma (node 6064-49904).
 * Cada item representa UMA tela/card do fluxo.
 */
export const PARQ_PLUS_SCREENING: ReadonlyArray<{
  id: string;
  questions: ParqQuestion[];
}> = [
  {
    // Figma: 6064-49840
    id: "screen-1",
    questions: [
      {
        id: "p1",
        displayNumber: "1",
        text: "Seu médico já disse que você tem algum problema cardíaco ou pressão alta?",
        followUp: {
          type: "checkboxes",
          label: "Como você respondeu SIM à pergunta acima...",
          hint: "Selecione a condição apropriada. Selecione TODAS as opções que se aplicam.",
          options: ["Condição cardíaca", "Pressão alta"],
        },
      },
    ],
  },
  {
    // Figma: P2 tela dedicada
    id: "screen-2",
    questions: [
      {
        id: "p2",
        displayNumber: "2",
        text: "Você sente dor no peito em repouso, durante suas atividades diárias **OU** ao realizar atividades físicas?",
        followUp: {
          type: "textarea",
          label: "Como você respondeu SIM à pergunta acima...",
          hint: "Por favor, descreva com mais detalhes sua condição.",
          placeholder: "Descreva aqui (opcional)",
        },
      },
    ],
  },
  {
    // Figma: P3 tela dedicada
    id: "screen-3",
    questions: [
      {
        id: "p3",
        displayNumber: "3",
        text: "Você perde o equilíbrio devido a tonturas **OU** perdeu a consciência nos últimos 12 meses?",
        subText:
          "Responda **NÃO** se sua tontura estiver associada à respiração excessiva (inclusive durante exercícios vigorosos).",
        followUp: {
          type: "textarea",
          label: "Como você respondeu SIM à pergunta acima...",
          hint: "Por favor, descreva com mais detalhes sua condição.",
          placeholder: "Descreva aqui (opcional)",
        },
      },
    ],
  },
  {
    // Figma: 6064-49968
    id: "screen-4",
    questions: [
      {
        id: "p4",
        displayNumber: "4",
        text: "Você já recebeu o diagnóstico de alguma outra doença crônica (além de doença cardíaca ou pressão alta)?",
        followUp: {
          type: "textarea",
          label: "Como você respondeu SIM à pergunta acima",
          hint: "Liste as condições médicas:",
          placeholder: "Liste aqui",
        },
      },
    ],
  },
  {
    // Figma: 6064-50031
    id: "screen-5",
    questions: [
      {
        id: "p5",
        displayNumber: "5",
        text: "Você está tomando algum medicamento prescrito para uma condição médica crônica?",
        followUp: {
          type: "textarea",
          label: "Como você respondeu SIM à pergunta acima",
          hint: "Liste as condições médicas e quaisquer medicamentos relacionados:",
          placeholder: "Liste aqui",
        },
      },
    ],
  },
  {
    // Figma: 6064-50094
    id: "screen-6",
    questions: [
      {
        id: "p6",
        displayNumber: "6",
        text: "Você tem atualmente (ou teve nos últimos 12 meses) algum problema ósseo, articular ou de tecido mole (músculo, ligamento ou tendão) que possa ser agravado pelo aumento da atividade física?",
        subText:
          "Responda **NÃO** se você teve um problema no passado, mas ele não limita sua capacidade atual de ser fisicamente ativa.",
        followUp: {
          type: "textarea",
          label: "Como você respondeu SIM à pergunta acima",
          hint: "Liste as condições médicas e quaisquer medicamentos relacionados:",
          placeholder: "Liste aqui",
        },
      },
    ],
  },
  {
    // Figma: 6064-50157
    id: "screen-7",
    questions: [
      {
        id: "p7",
        displayNumber: "7",
        text: "Seu médico já disse alguma vez que você só deve praticar atividades físicas sob supervisão médica?",
        followUp: {
          type: "textarea",
          label: "Como você respondeu SIM à pergunta acima",
          hint: "Por favor, descreva com mais detalhes a recomendação médica:",
          placeholder: "Descreva aqui (opcional)",
        },
      },
    ],
  },
];

/* ──────────────────────────────────────────────────────────────────────
 * ETAPA 2 — ACOMPANHAMENTO (10 seções)
 * ────────────────────────────────────────────────────────────────────── */

export const PARQ_PLUS_SECTIONS: readonly ParqSection[] = [
  {
    // Figma: 6064-50215
    id: "ac1",
    order: 1,
    title: "Acompanhamento 1: Condições Ósseas e Articulares",
    gate: {
      id: "ac1.gate",
      text: "Você tem artrite, osteoporose ou problemas de coluna?",
    },
    subQuestions: [
      {
        id: "ac1.1",
        text: "Você tem dificuldade em controlar sua condição com medicamentos ou outras terapias prescritas pelo médico?",
        subText:
          "Responda **NÃO** se você não estiver tomando medicamentos ou outros tratamentos atualmente",
      },
      {
        id: "ac1.2",
        text: "Você tem problemas nas articulações que causam dor, uma fratura recente ou fratura causada por osteoporose ou câncer, vértebra deslocada (por exemplo, espondilolistese) e/ou espondilólise/defeito da pars interarticularis (uma fissura no anel ósseo na parte posterior da coluna vertebral)?",
      },
      {
        id: "ac1.3",
        text: "Você recebeu injeções de esteroides ou tomou comprimidos de esteroides regularmente por mais de 3 meses?",
      },
    ],
  },
  {
    // Figma: 6064-50288
    id: "ac2",
    order: 2,
    title: "Acompanhamento 2: Histórico e Tratamento de Câncer",
    gate: {
      id: "ac2.gate",
      text: "Você tem algum tipo de câncer que você saiba?",
    },
    subQuestions: [
      {
        id: "ac2.1",
        text: "Seu diagnóstico de câncer inclui algum dos seguintes tipos: câncer de pulmão/broncogênico, mieloma múltiplo (câncer de plasmócitos), câncer de cabeça e/ou pescoço?",
      },
      {
        id: "ac2.2",
        text: "Você está atualmente recebendo tratamento contra o câncer (como quimioterapia ou radioterapia)?",
      },
    ],
  },
  {
    // Figma: 6064-50356
    id: "ac3",
    order: 3,
    title: "Acompanhamento 3: Condições Cardíacas e Vasculares",
    gate: {
      id: "ac3.gate",
      text: "Você tem algum problema cardíaco ou cardiovascular? Isso inclui doença arterial coronariana, insuficiência cardíaca ou arritmia cardíaca diagnosticada.",
    },
    subQuestions: [
      {
        id: "ac3.1",
        text: "Você tem dificuldade em controlar sua condição com medicamentos ou outras terapias prescritas pelo médico?",
        subText:
          "Responda **NÃO** se você não estiver tomando medicamentos ou outros tratamentos atualmente",
      },
      {
        id: "ac3.2",
        text: "Você tem batimentos cardíacos irregulares que requerem acompanhamento médico? (como fibrilação atrial, contração ventricular prematura)",
      },
      { id: "ac3.3", text: "Você tem insuficiência cardíaca crônica?" },
      {
        id: "ac3.4",
        text: "Você tem diagnóstico de doença arterial coronariana (cardiovascular) e não pratica atividade física regular nos últimos 2 meses?",
      },
    ],
  },
  {
    // Figma: 6064-50434
    id: "ac4",
    order: 4,
    title: "Acompanhamento 4: Hipertensão e Pressão Arterial",
    gate: {
      id: "ac4.gate",
      text: "Você tem pressão alta atualmente?",
    },
    subQuestions: [
      {
        id: "ac4.1",
        text: "Você tem dificuldade em controlar sua condição com medicamentos ou outras terapias prescritas pelo médico?",
        subText:
          "Responda **NÃO** se você não estiver tomando medicamentos ou outros tratamentos atualmente",
      },
    ],
  },
  {
    // Figma: 6064-50497
    id: "ac5",
    order: 5,
    title: "Acompanhamento 5: Diabetes e Condições Metabólicas",
    gate: {
      id: "ac5.gate",
      text: "Você tem alguma condição metabólica? Isso inclui diabetes tipo 1, diabetes tipo 2 e pré-diabetes.",
    },
    subQuestions: [
      {
        id: "ac5.1",
        text: "Você costuma ter dificuldade em controlar seus níveis de açúcar no sangue com alimentos, medicamentos ou outras terapias prescritas por médicos?",
      },
      {
        id: "ac5.2",
        text: "Você costuma apresentar sinais e sintomas de hipoglicemia (baixo nível de açúcar no sangue) após exercícios físicos e/ou durante atividades da vida diária?",
        subText:
          "Os sinais de hipoglicemia podem incluir tremores, nervosismo, irritabilidade incomum, sudorese anormal, tontura ou vertigem, confusão mental, dificuldade para falar, fraqueza ou sonolência.",
      },
      {
        id: "ac5.3",
        text: "Você apresenta algum sinal ou sintoma de complicações do diabetes, como doenças cardíacas ou vasculares e/ou complicações que afetam os olhos, os rins OU a sensibilidade nos dedos dos pés e dos pés?",
      },
      {
        id: "ac5.4",
        text: "Você tem outras condições metabólicas (como diabetes gestacional atual, doença renal crônica ou problemas hepáticos)?",
      },
      {
        id: "ac5.5",
        text: "Você planeja se envolver em exercícios físicos de intensidade excepcionalmente alta (ou vigorosa) para você em um futuro próximo?",
      },
    ],
  },
  {
    // Figma: 6064-50580
    id: "ac6",
    order: 6,
    title: "Acompanhamento 6: Saúde Mental e Cognitiva",
    gate: {
      id: "ac6.gate",
      text: "Você tem algum problema de saúde mental ou dificuldade de aprendizagem? Isso inclui Alzheimer, demência, depressão, transtorno de ansiedade, transtorno alimentar, transtorno psicótico, deficiência intelectual e síndrome de Down.",
    },
    subQuestions: [
      {
        id: "ac6.1",
        text: "Você tem dificuldade em controlar sua condição com medicamentos ou outras terapias prescritas pelo médico?",
        subText:
          "Responda **NÃO** se você não estiver tomando medicamentos ou outros tratamentos atualmente",
      },
      {
        id: "ac6.2",
        text: "Você tem Síndrome de Down e problemas de coluna que afetam os nervos ou músculos?",
      },
    ],
  },
  {
    // Figma: 6064-50648
    id: "ac7",
    order: 7,
    title: "Acompanhamento 7: Doenças e Saúde Respiratória",
    gate: {
      id: "ac7.gate",
      text: "Você tem alguma doença respiratória? Isso inclui Doença Pulmonar Obstrutiva Crônica (DPOC), asma e hipertensão pulmonar.",
    },
    subQuestions: [
      {
        id: "ac7.1",
        text: "Você tem dificuldade em controlar sua condição com medicamentos ou outras terapias prescritas pelo médico?",
        subText:
          "Responda **NÃO** se você não estiver tomando medicamentos ou outros tratamentos atualmente",
      },
      {
        id: "ac7.2",
        text: "Seu médico já disse alguma vez que seu nível de oxigênio no sangue está baixo em repouso ou durante o exercício e/ou que você precisa de oxigenoterapia suplementar?",
      },
      {
        id: "ac7.3",
        text: "Se você tem asma, apresenta atualmente sintomas como aperto no peito, chiado no peito, dificuldade para respirar, tosse persistente (mais de 2 dias por semana) ou precisou usar medicação de resgate mais de duas vezes na última semana?",
      },
      {
        id: "ac7.4",
        text: "Seu médico já disse alguma vez que você tem pressão alta nos vasos sanguíneos dos pulmões?",
      },
    ],
  },
  {
    // Figma: 6064-50797
    id: "ac8",
    order: 8,
    title: "Acompanhamento 8: Lesão Medular e Resposta Autonômica",
    gate: {
      id: "ac8.gate",
      text: "Você tem uma lesão na medula espinhal? Isso inclui tetraplegia e paraplegia.",
    },
    subQuestions: [
      {
        id: "ac8.1",
        text: "Você tem dificuldade em controlar sua condição com medicamentos ou outras terapias prescritas pelo médico?",
        subText:
          "Responda **NÃO** se você não estiver tomando medicamentos ou outros tratamentos atualmente",
      },
      {
        id: "ac8.2",
        text: "Você costuma apresentar pressão arterial baixa em repouso, a ponto de causar tontura, vertigem e/ou desmaios?",
      },
      {
        id: "ac8.3",
        text: "Seu médico indicou que você apresenta episódios repentinos de pressão alta (conhecidos como disreflexia autonômica)?",
      },
    ],
  },
  {
    // Figma: 6064-50870
    id: "ac9",
    order: 9,
    title: "Acompanhamento 9: Histórico de AVC e Locomoção",
    gate: {
      id: "ac9.gate",
      text: "Você já teve um AVC? Isso inclui Ataque Isquêmico Transitório (AIT) ou Acidente Vascular Cerebral.",
    },
    subQuestions: [
      {
        id: "ac9.1",
        text: "Você tem dificuldade em controlar sua condição com medicamentos ou outras terapias prescritas pelo médico?",
        subText:
          "Responda **NÃO** se você não estiver tomando medicamentos ou outros tratamentos atualmente",
      },
      {
        id: "ac9.2",
        text: "Você tem alguma dificuldade para andar ou se locomover?",
      },
      {
        id: "ac9.3",
        text: "Você sofreu um AVC ou teve algum problema nos nervos ou músculos nos últimos 6 meses?",
      },
    ],
  },
  {
    // Figma: 6064-50943
    id: "ac10",
    order: 10,
    title: "Acompanhamento 10: Outras Condições e Comorbidades",
    gate: {
      id: "ac10.gate",
      text: "Você convive atualmente com duas ou mais condições médicas?",
    },
    subQuestions: [
      {
        id: "ac10.1",
        text: "Você sofreu um desmaio, perdeu a consciência ou teve um apagão em decorrência de um traumatismo craniano nos últimos 12 meses OU recebeu um diagnóstico de concussão nos últimos 12 meses?",
      },
      {
        id: "ac10.2",
        text: "Você tem algum problema de saúde que não esteja listado (como epilepsia, problemas neurológicos, problemas renais)?",
        followUp: {
          type: "textarea",
          label: "Como você respondeu SIM à pergunta acima",
          hint: "Liste as condições médicas e quaisquer medicamentos relacionados:",
          placeholder: "Liste aqui",
        },
      },
    ],
  },
];

/* ──────────────────────────────────────────────────────────────────────
 * Tipos de resposta (persistidos)
 * ────────────────────────────────────────────────────────────────────── */

export type ParqAnswer = "yes" | "no" | null;

/**
 * Snapshot arquivado de uma avaliação PAR-Q+ anterior.
 * PAR-Q+ é documento clínico-legal: tecnicamente não se "edita" uma resposta
 * antiga — faz-se uma nova avaliação e preserva-se o histórico.
 */
export interface ParqPlusHistoryEntry {
  /** Timestamp do arquivamento (quando a nova avaliação foi iniciada). */
  archivedAt: string;
  /** Timestamp original de conclusão da avaliação arquivada. */
  completedAt?: string;
  riskLevel?: "low" | "moderate" | "high";
  answers: Record<string, ParqAnswer>;
  followUpOptions: Record<string, string[]>;
  followUpText: Record<string, string>;
}

export interface ParqPlusData {
  version: "plus-v1";
  /** Respostas por questionId (inclui gates, subs e perguntas da Etapa 1). */
  answers: Record<string, ParqAnswer>;
  /** Follow-ups: checkbox arrays por questionId. */
  followUpOptions: Record<string, string[]>;
  /** Follow-ups: textos livres por questionId. */
  followUpText: Record<string, string>;
  /** Metadata de conclusão. */
  completedAt?: string;
  riskLevel?: "low" | "moderate" | "high";
  /** Avaliações PAR-Q+ anteriores (mais recente primeiro). */
  history?: ParqPlusHistoryEntry[];
}

/* ──────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Risco PAR-Q+ oficial:
 *  - low: todas as 7 perguntas da Etapa 1 = "Não"
 *  - moderate: Sim em Etapa 1, mas TODAS as sub-questões relevantes = "Não"
 *  - high: qualquer sub-questão de seção aberta = "Sim"
 */
export function calculateParqPlusRisk(
  answers: Record<string, ParqAnswer>
): "low" | "moderate" | "high" {
  const screeningIds = PARQ_PLUS_SCREENING.flatMap((s) =>
    s.questions.map((q) => q.id)
  );
  const anyScreeningYes = screeningIds.some((id) => answers[id] === "yes");
  if (!anyScreeningYes) return "low";

  // Alguma sub-questão de seção aberta = Sim → alto
  for (const section of PARQ_PLUS_SECTIONS) {
    if (answers[section.gate.id] === "yes") {
      const anySubYes = section.subQuestions.some(
        (q) => answers[q.id] === "yes"
      );
      if (anySubYes) return "high";
    }
  }
  return "moderate";
}

/** Conta respostas "Sim" em toda a estrutura (para exibir no header). */
export function countYesAnswers(
  answers: Record<string, ParqAnswer>
): number {
  return Object.values(answers).filter((v) => v === "yes").length;
}

/** Seções "visíveis": gate respondido (qualquer resposta ou Sim na Etapa 1). */
export function getVisibleSections(
  answers: Record<string, ParqAnswer>
): readonly ParqSection[] {
  const screeningIds = PARQ_PLUS_SCREENING.flatMap((s) =>
    s.questions.map((q) => q.id)
  );
  const anyScreeningYes = screeningIds.some((id) => answers[id] === "yes");
  if (!anyScreeningYes) return [];
  return PARQ_PLUS_SECTIONS;
}

/** Total de steps do fluxo (Etapa 1 páginas + Etapa 2 seções). */
export const PARQ_PLUS_TOTAL_STEPS =
  PARQ_PLUS_SCREENING.length + PARQ_PLUS_SECTIONS.length;
