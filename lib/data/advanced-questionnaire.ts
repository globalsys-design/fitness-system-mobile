/**
 * Questionário Avançado de Saúde — banco de perguntas oficiais.
 *
 * Estrutura mobile-first: cada seção contém perguntas Sim/Não.
 * Quando a resposta é "Sim", uma caixa de observação é revelada para
 * registrar contexto clínico (data do evento, medicação, etc).
 *
 * Fonte: protótipo Globalsys aprovado pelo cliente, baseado em diretrizes
 * ACSM e SBC para avaliação pré-participação esportiva.
 */

export interface AdvancedQuestion {
  /** id estável — usado como chave em answers/observations */
  id: string;
  text: string;
}

export interface AdvancedSection {
  id: string;
  title: string;
  questions: AdvancedQuestion[];
}

/* ──────────────────────────────────────────────────────────────────────
 * SEÇÕES — preserva texto literal do protótipo
 * ────────────────────────────────────────────────────────────────────── */

export const ADVANCED_SECTIONS: readonly AdvancedSection[] = [
  {
    id: "had",
    title: "Você já teve",
    questions: [
      {
        id: "had-heart-attack",
        text: "Já teve ataque cardíaco ou infarto?",
      },
      {
        id: "had-arrhythmia",
        text: "Possui ou já foi diagnosticado com arritmia cardíaca?",
      },
      {
        id: "had-cardiac-surgery",
        text: "Já realizou alguma cirurgia cardíaca?",
      },
      {
        id: "had-valve-problem",
        text: "Possui algum problema nas válvulas do coração?",
      },
      {
        id: "had-catheterization",
        text: "Já realizou cateterismo cardíaco?",
      },
      {
        id: "had-heart-failure",
        text: "Possui diagnóstico de insuficiência cardíaca?",
      },
      {
        id: "had-angioplasty",
        text: "Já realizou angioplastia coronária?",
      },
      {
        id: "had-transplant",
        text: "Já passou por transplante de coração?",
      },
      {
        id: "had-pacemaker",
        text: "Possui marcapasso ou desfibrilador cardíaco?",
      },
      {
        id: "had-congenital",
        text: "Nasceu com alguma doença cardíaca congênita?",
      },
    ],
  },
  {
    id: "medical-history",
    title: "História Médica",
    questions: [
      {
        id: "mh-diabetes",
        text: "Você sofre de diabetes?",
      },
      {
        id: "mh-asthma",
        text: "Você tem asma ou outra doença pulmonar?",
      },
      {
        id: "mh-leg-pain",
        text: "Você tem queimação ou sensação cãibras em suas pernas quando percorre pequenas distâncias?",
      },
      {
        id: "mh-musculoskeletal",
        text: "Você tem problemas musculoesqueléticos que limitam sua atividade física?",
      },
      {
        id: "mh-medications",
        text: "Você toma medicações prescritas por médico?",
      },
      {
        id: "mh-exercise-concerns",
        text: "Você tem preocupações quanto a segurança do exercício?",
      },
      {
        id: "mh-pregnant",
        text: "Você está grávida?",
      },
    ],
  },
  {
    id: "risk-factors",
    title: "Fatores de Risco",
    questions: [
      {
        id: "rf-male-45",
        text: "Você é homem e tem mais de 45 anos?",
      },
      {
        id: "rf-female-55-meno",
        text: "Você é uma mulher com mais de 55 anos e já passou pela menopausa?",
      },
      {
        id: "rf-smoker",
        text: "Você fuma ou parou de fumar nos últimos 6 meses?",
      },
      {
        id: "rf-bp-high",
        text: "Sua pressão arterial é superior a 140/90 mmHg?",
      },
      {
        id: "rf-bp-medication",
        text: "Você utiliza medicamentos para pressão arterial?",
      },
      {
        id: "rf-cholesterol",
        text: "Seu colesterol sanguíneo ultrapassa 200 mg/dl?",
      },
      {
        id: "rf-family-history",
        text: "Algum parente próximo teve ataque cardíaco ou cirurgia cardíaca antes dos 55 anos (pai/irmão) ou 65 anos (mãe/irmã)?",
      },
      {
        id: "rf-inactive",
        text: "Você é fisicamente inativo (realiza menos de 30 minutos de atividade física em pelo menos 3 dias por semana)?",
      },
      {
        id: "rf-overweight",
        text: "Você tem mais de 9 kg acima do peso ideal?",
      },
    ],
  },
] as const;

/* ──────────────────────────────────────────────────────────────────────
 * Tipos persistidos
 * ────────────────────────────────────────────────────────────────────── */

export type AdvancedAnswer = "yes" | "no" | null;

export interface AdvancedQuestionnaireData {
  version: "v2";
  /** Respostas Sim/Não por questionId */
  answers: Record<string, "yes" | "no">;
  /** Observação livre por questionId (apenas quando answer === "yes") */
  observations: Record<string, string>;
  completedAt?: string;
}

/* ──────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────── */

export function getAllQuestions(): AdvancedQuestion[] {
  return ADVANCED_SECTIONS.flatMap((s) => s.questions);
}

export function countYesAnswers(
  answers: Record<string, "yes" | "no">
): number {
  return Object.values(answers).filter((v) => v === "yes").length;
}

export function isQuestionnaireComplete(
  answers: Record<string, "yes" | "no">
): boolean {
  return getAllQuestions().every((q) => answers[q.id] !== undefined);
}

export function answeredCount(
  answers: Record<string, "yes" | "no">
): number {
  return getAllQuestions().filter((q) => answers[q.id] !== undefined).length;
}
