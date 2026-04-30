/**
 * Questionário Completo — banco de perguntas oficiais (Globalsys, 2026).
 *
 * O fluxo tem 9 etapas; este arquivo cobre as 5 primeiras (Últimos Exames →
 * Histórico Atual → Antecedentes Mórbidos → Atividade Física → Dieta).
 * Demais etapas (Histórico Familiar, Reavaliação Física, Autopercepção,
 * Laudo Final) virão em iterações futuras.
 *
 * Padrão de UX (alinhado ao Questionário Avançado):
 *  - Perguntas Sim/Não usam <YesNoButtons /> (componente único do design system)
 *  - Quando "Sim", uma textarea "Observações" é revelada para a pergunta
 *  - Outros tipos (data, número, dropdown, checkbox, radio) seguem
 *    primitivas existentes (Input, NativeSelect, Checkbox)
 */

export type FullStepId =
  | "exams"
  | "current"
  | "morbid"
  | "activity"
  | "diet"
  | "family"
  | "reassessment"
  | "selfperception"
  | "report";

/* ──────────────────────────────────────────────────────────────────────
 * 1. ÚLTIMOS EXAMES — 5 datas
 * ────────────────────────────────────────────────────────────────────── */

export interface ExamField {
  id: keyof FullExams;
  label: string;
}

export const EXAM_FIELDS: readonly ExamField[] = [
  { id: "physicalExam", label: "Exame físico completo" },
  { id: "ekg", label: "Eletrocardiograma" },
  { id: "stressTest", label: "Teste de esforço" },
  { id: "mri", label: "Ressonância Magnética" },
  { id: "xray", label: "Raio X" },
] as const;

export interface FullExams {
  physicalExam?: string; // ISO date
  ekg?: string;
  stressTest?: string;
  mri?: string;
  xray?: string;
}

/* ──────────────────────────────────────────────────────────────────────
 * 2. HISTÓRICO ATUAL — 20 perguntas + radio personalidade
 * ────────────────────────────────────────────────────────────────────── */

export interface YesNoQuestion {
  id: string;
  text: string;
}

export const CURRENT_HISTORY_QUESTIONS_BEFORE_PERSONALITY: readonly YesNoQuestion[] =
  [
    { id: "smoking", text: "Você fuma ou já fumou?" },
    { id: "bp-issue", text: "Você tem problema de pressão arterial?" },
    { id: "cholesterol-issue", text: "Você tem problema de colesterol?" },
    { id: "diabetic", text: "Você é diabético?" },
    {
      id: "chest-pain",
      text: "Você alguma vez sentiu dor no coração ou no peito?",
    },
    {
      id: "heart-skip",
      text: "Algumas vezes você já sentiu o coração falhar?",
    },
    {
      id: "swollen-ankles",
      text: "Seus tornozelos ficam frequentemente inchados?",
    },
    {
      id: "cold-extremities",
      text: "Seus pés e mãos ficam gelados e trêmulos, mesmo em tempo de calor?",
    },
    { id: "leg-cramps", text: "Você sofre de câimbras nas pernas?" },
    {
      id: "shortness-of-breath",
      text: "Você já ficou com falta de ar sem qualquer razão?",
    },
    {
      id: "ecg-alteration",
      text: "Alguma vez um médico lhe disse que você tem algum comprometimento cardíaco, ou alteração no ECG?",
    },
    { id: "morning-cough", text: "Já teve tosse matinal?" },
  ] as const;

export const PERSONALITY_OPTIONS = [
  { value: "calma", label: "Calma" },
  { value: "ansiosa", label: "Ansiosa" },
  { value: "agitada", label: "Agitada" },
  { value: "competitiva", label: "Competitiva" },
  { value: "meio-termo", label: "Meio-termo" },
] as const;

export type PersonalityValue = (typeof PERSONALITY_OPTIONS)[number]["value"];

export const CURRENT_HISTORY_QUESTIONS_AFTER_PERSONALITY: readonly YesNoQuestion[] =
  [
    { id: "depression", text: "Já teve problema de depressão?" },
    { id: "medication", text: "Faz uso de algum medicamento?" },
    {
      id: "headaches",
      text: "Sofre de dor de cabeça ou enxaqueca frequentes?",
    },
    { id: "surgery", text: "Já fez alguma cirurgia?" },
    { id: "heat-issues", text: "Você já teve problemas com calor?" },
    {
      id: "metal-implant",
      text: "Você tem algum pino, placa, parafuso, ou qualquer objeto de metal em seu corpo?",
    },
    { id: "fracture", text: "Já fraturou alguma coisa?" },
  ] as const;

export const ALL_CURRENT_HISTORY_QUESTIONS: readonly YesNoQuestion[] = [
  ...CURRENT_HISTORY_QUESTIONS_BEFORE_PERSONALITY,
  ...CURRENT_HISTORY_QUESTIONS_AFTER_PERSONALITY,
] as const;

export interface CurrentHistory {
  answers: Record<string, "yes" | "no">;
  observations: Record<string, string>;
  personality?: PersonalityValue;
}

/* ──────────────────────────────────────────────────────────────────────
 * 3. ANTECEDENTES MÓRBIDOS — 18 Sim/Não
 * ────────────────────────────────────────────────────────────────────── */

export const MORBID_QUESTIONS: readonly YesNoQuestion[] = [
  { id: "heart-attack", text: "Ataque cardíaco?" },
  { id: "rheumatic-fever", text: "Febre reumática?" },
  { id: "heart-murmur", text: "Sopro cardíaco?" },
  { id: "dislocation", text: "Luxação?" },
  { id: "arteriosclerosis", text: "Arteriosclerose?" },
  { id: "varicose", text: "Veias varicosas?" },
  { id: "arthritis", text: "Artrites perna/braço?" },
  { id: "bronchitis", text: "Bronquite?" },
  { id: "dizziness", text: "Tonteira?" },
  { id: "fainting", text: "Desmaios?" },
  { id: "epilepsy", text: "Epilepsia?" },
  { id: "stroke", text: "Acidente cerebral?" },
  { id: "asthma", text: "Asma?" },
  { id: "anemia", text: "Anemia?" },
  { id: "thyroid", text: "Tireoide?" },
  { id: "chest-abnormality", text: "Anormalidade no tórax?" },
  { id: "nervous-emotional", text: "Problema nervoso/emocional?" },
  { id: "pneumonia", text: "Pneumonia?" },
] as const;

export interface MorbidHistory {
  answers: Record<string, "yes" | "no">;
  observations: Record<string, string>;
}

/* ──────────────────────────────────────────────────────────────────────
 * 4. ATIVIDADE FÍSICA — 6 Sim/Não + dropdowns esportes + 2 dropdowns
 * ────────────────────────────────────────────────────────────────────── */

export const ACTIVITY_QUESTIONS: readonly YesNoQuestion[] = [
  {
    id: "enrolled-program",
    text: "Você está normalmente inscrito num programa de exercícios?",
  },
  {
    id: "walks-runs-1.6km",
    text: "Você habitualmente anda ou corre regularmente 1,6 km ou mais continuamente?",
  },
  {
    id: "competitive-sports",
    text: "Participa com frequência de esportes competitivos?",
  },
  {
    id: "leisure-sports",
    text: "Participa com frequência de esportes com características de lazer?",
  },
  {
    id: "previous-gym",
    text: "Você já frequentou alguma atividade em academia anteriormente?",
  },
  {
    id: "practices-activity",
    text: "Você pratica atividade física?",
  },
] as const;

export const SPORT_FIELDS = [
  "Caminhada",
  "Corrida",
  "Ciclismo",
  "Natação",
  "Ginástica",
  "Musculação",
  "Luta",
  "Dança",
  "Futebol",
  "Basquete",
] as const;

/**
 * Lista oficial de preferência por esporte (Habitualmente / Não Gosto /
 * Gosto / Gostaria de fazer). Aplicada a todos os 10 esportes do
 * questionário completo (protótipo Globalsys 2026-04-29).
 */
export const SPORT_PREFERENCE_OPTIONS = [
  { value: "", label: "Sem resposta" },
  { value: "habitualmente", label: "Habitualmente" },
  { value: "nao-gosto", label: "Não Gosto" },
  { value: "gosto", label: "Gosto" },
  { value: "gostaria-de-fazer", label: "Gostaria de fazer" },
] as const;

/**
 * Mapa esporte → lista de opções. Hoje todos os esportes usam a mesma
 * lista de preferência, mas o mapa fica preservado para suportar
 * variações futuras sem mexer na UI.
 */
type SportOption = { value: string; label: string };

export const SPORT_OPTIONS_MAP: Record<string, readonly SportOption[]> = {
  Caminhada: SPORT_PREFERENCE_OPTIONS,
  Corrida: SPORT_PREFERENCE_OPTIONS,
  Ciclismo: SPORT_PREFERENCE_OPTIONS,
  Natação: SPORT_PREFERENCE_OPTIONS,
  Ginástica: SPORT_PREFERENCE_OPTIONS,
  Musculação: SPORT_PREFERENCE_OPTIONS,
  Luta: SPORT_PREFERENCE_OPTIONS,
  Dança: SPORT_PREFERENCE_OPTIONS,
  Futebol: SPORT_PREFERENCE_OPTIONS,
  Basquete: SPORT_PREFERENCE_OPTIONS,
};

export function getSportOptions(sportName: string): readonly SportOption[] {
  return SPORT_OPTIONS_MAP[sportName] ?? SPORT_PREFERENCE_OPTIONS;
}

/** Horário preferido para exercício físico — protótipo Globalsys 2026-04-29. */
export const PREFERRED_TIME_OPTIONS = [
  { value: "", label: "Sem resposta" },
  { value: "inicio-manha", label: "Início da manhã" },
  { value: "meio-manha", label: "Meio da manhã" },
  { value: "final-manha", label: "Final da manhã" },
  { value: "almoco", label: "Horário do almoço" },
  { value: "inicio-tarde", label: "Início da tarde" },
  { value: "final-tarde", label: "Final da tarde" },
  { value: "noite", label: "Durante a noite" },
] as const;

/** Modo de deslocamento até o trabalho/estudos — protótipo Globalsys 2026-04-29. */
export const COMMUTE_OPTIONS = [
  { value: "", label: "Sem resposta" },
  { value: "caminhando", label: "Caminhando" },
  { value: "bicicleta", label: "Bicicleta" },
  { value: "transporte-coletivo", label: "Transporte coletivo" },
  { value: "carro", label: "Carro" },
  { value: "moto", label: "Moto" },
] as const;

export interface PhysicalActivity {
  answers: Record<string, "yes" | "no">;
  observations: Record<string, string>;
  sports: Record<string, string>; // sport name → frequency value
  preferredTime?: string;
  commute?: string;
}

/* ──────────────────────────────────────────────────────────────────────
 * 5. DIETA — formulário misto
 * ────────────────────────────────────────────────────────────────────── */

/** Avaliação da própria alimentação — protótipo Globalsys 2026-04-29. */
export const EATING_QUALITY_OPTIONS = [
  { value: "", label: "Sem resposta" },
  { value: "adequada", label: "Adequada" },
  { value: "inadequada", label: "Inadequada" },
  { value: "poderia-ser-melhor", label: "Poderia ser melhor" },
] as const;

export const MEAL_OPTIONS = [
  { id: "breakfast", label: "Café da manhã" },
  { id: "midmorning", label: "Lanche no meio da Manhã" },
  { id: "lunch", label: "Almoço" },
  { id: "midafternoon", label: "Lanche no meio da Tarde" },
  { id: "dinner", label: "Jantar ou lanche noturno" },
  { id: "supper", label: "Ceia" },
] as const;

export const WEEKLY_FREQUENCY_FIELDS = [
  { id: "fried", label: "Frituras" },
  { id: "fish", label: "Peixe" },
  { id: "pork", label: "Carne de porco" },
  { id: "dessert", label: "Sobremesa" },
  { id: "poultry", label: "Aves" },
  { id: "beef", label: "Carne de boi" },
] as const;

export const DAILY_PORTION_FIELDS = [
  { id: "milk", label: "Leite" },
  { id: "juice", label: "Sucos" },
  { id: "soda", label: "Refrigerante" },
  { id: "coffee", label: "Café" },
  { id: "tea", label: "Chá" },
  { id: "vitamins", label: "Vitaminas" },
] as const;

export const NUTRITIONIST_OPTIONS = [
  { value: "yes", label: "Sim" },
  { value: "no", label: "Não" },
  { value: "pretendo", label: "Pretendo fazer" },
] as const;

export type NutritionistValue = (typeof NUTRITIONIST_OPTIONS)[number]["value"];

export interface DietData {
  idealWeight?: number;
  maxWeight?: number;
  maxWeightAge?: number;
  currentWeight?: number;
  mealsPerDay?: number;
  eatingQuality?: string;
  mealsTaken: string[]; // ids dos checkboxes marcados
  weeklyFrequency: Record<string, number>;
  dailyPortions: Record<string, number>;
  drinksAlcohol?: "yes" | "no";
  nutritionist?: NutritionistValue;
  supplements?: string;
}

/* ──────────────────────────────────────────────────────────────────────
 * 6. HISTÓRICO FAMILIAR — Sim/Não com qualifiers
 * ────────────────────────────────────────────────────────────────────── */

export const FAMILY_HISTORY_QUESTIONS: readonly YesNoQuestion[] = [
  { id: "fh-heart-attack-50", text: "Ataque cardíaco abaixo de 50 anos" },
  { id: "fh-diabetes", text: "Diabetes" },
  { id: "fh-bp-high", text: "Pressão alta" },
  { id: "fh-stroke-50", text: "Acidente cerebral abaixo de 50 anos" },
  { id: "fh-cholesterol", text: "Colesterol elevado" },
  { id: "fh-chf", text: "Doença cardíaca congestiva" },
  { id: "fh-obesity", text: "Obesidade (20 kg ou mais acima do peso)" },
  { id: "fh-cardiac-ops", text: "Operações cardíacas" },
  { id: "fh-glaucoma", text: "Glaucoma" },
  {
    id: "fh-leukemia-cancer-60",
    text: "Leucemia ou câncer (abaixo dos 60 anos)",
  },
  { id: "fh-asthma", text: "Asma" },
] as const;

export interface FamilyHistory {
  answers: Record<string, "yes" | "no">;
  observations: Record<string, string>;
}

/* ──────────────────────────────────────────────────────────────────────
 * 7. ANAMNESE - REAVALIAÇÃO FÍSICA — radios + texto + dropdowns
 * ────────────────────────────────────────────────────────────────────── */

export const GOAL_ACHIEVEMENT_OPTIONS = [
  { value: "plenamente", label: "Plenamente" },
  { value: "parcialmente", label: "Parcialmente" },
  { value: "nao", label: "Não alcançou" },
] as const;

export type GoalAchievement = (typeof GOAL_ACHIEVEMENT_OPTIONS)[number]["value"];

/**
 * Frequência semanal por faixa — protótipo Globalsys 2026-04-29.
 * Usado em "Frequência de atividades no último período" e em
 * "Atividades pretendidas" (mesma lista).
 */
export const WEEKLY_FREQUENCY_OPTIONS = [
  { value: "", label: "Sem resposta" },
  { value: "1", label: "1 vez" },
  { value: "1-2", label: "1 a 2 vezes" },
  { value: "3-4", label: "3 a 4 vezes" },
  { value: "5-6", label: "5 a 6 vezes" },
  { value: "todos-os-dias", label: "Todos os dias" },
] as const;

/** Intensidade da atividade — protótipo Globalsys 2026-04-29. */
export const INTENSITY_OPTIONS = [
  { value: "", label: "Sem resposta" },
  { value: "baixa", label: "Baixa" },
  { value: "moderada", label: "Moderada" },
  { value: "alta", label: "Alta" },
  { value: "muito-alta", label: "Muito alta" },
] as const;

export const DIET_ASSESSMENT_OPTIONS = [
  { value: "adequada", label: "Adequada" },
  { value: "inadequada", label: "Inadequada" },
  { value: "melhor", label: "Poderia ser melhor" },
] as const;

export type DietAssessment = (typeof DIET_ASSESSMENT_OPTIONS)[number]["value"];

export interface RecentActivity {
  activity?: string;
  timeSpent?: string;
  weeklyFrequency?: string;
  intensity?: string;
  duration?: string;
}

export interface IntendedActivity {
  weeklyFrequency?: string;
  activity?: string;
}

export interface PhysicalReassessment {
  goalAchievement?: GoalAchievement;
  currentGoal?: string;
  recentActivity: RecentActivity;
  intendedActivity: IntendedActivity;
  dietAssessment?: DietAssessment;
}

/* ──────────────────────────────────────────────────────────────────────
 * 8. AUTOPERCEPÇÃO — radios de avaliação + sono
 * ────────────────────────────────────────────────────────────────────── */

export const RATING_OPTIONS = [
  { value: "ruim", label: "Ruim" },
  { value: "regular", label: "Regular" },
  { value: "bom", label: "Bom" },
  { value: "excelente", label: "Excelente" },
] as const;

export type Rating = (typeof RATING_OPTIONS)[number]["value"];

export const SOMETIMES_RATING_OPTIONS = [
  { value: "yes", label: "Sim" },
  { value: "no", label: "Não" },
  { value: "sometimes", label: "Às vezes" },
] as const;

export type SometimesRating =
  (typeof SOMETIMES_RATING_OPTIONS)[number]["value"];

export interface SelfPerception {
  qualityOfLife?: Rating;
  fitnessCondition?: Rating;
  appearance?: Rating;
  mood?: Rating;
  sleepHours?: number;
  bedTime?: string; // HH:mm
  wakeTime?: string; // HH:mm
  sleepQuality?: Rating;
  daytimeSleepiness?: SometimesRating;
  restedAfterSleep?: SometimesRating;
}

/* ──────────────────────────────────────────────────────────────────────
 * 9. LAUDO FINAL — conclusão clínica + observações
 * ────────────────────────────────────────────────────────────────────── */

export const FINAL_REPORT_OPTIONS = [
  {
    value: "no-issues",
    label:
      "Anamnese sem nenhum destaque, totalmente liberado para realização de exercícios físicos",
  },
  {
    value: "minor",
    label:
      "Anamnese com pequenas observações importantes, que requerem atenção na prescrição",
  },
  {
    value: "major-restrictions",
    label:
      "Anamnese com observações importantes que requerem uma prescrição de exercícios com nível elevado de restrições",
  },
  {
    value: "needs-medical",
    label:
      "Anamnese em que se recomenda um levantamento minucioso feito por médico, para estabelecer os níveis de restrição física",
  },
] as const;

export type FinalConclusion = (typeof FINAL_REPORT_OPTIONS)[number]["value"];

export interface FinalReport {
  conclusion?: FinalConclusion;
  observations?: string;
}

/* ──────────────────────────────────────────────────────────────────────
 * Tipo persistido (v2)
 * ────────────────────────────────────────────────────────────────────── */

export interface FullQuestionnaireDataV2 {
  version: "v2";
  exams: FullExams;
  currentHistory: CurrentHistory;
  morbidHistory: MorbidHistory;
  physicalActivity: PhysicalActivity;
  diet: DietData;
  familyHistory: FamilyHistory;
  reassessment: PhysicalReassessment;
  selfPerception: SelfPerception;
  finalReport: FinalReport;
  completedAt?: string;
}

export const EMPTY_FULL_QUESTIONNAIRE: FullQuestionnaireDataV2 = {
  version: "v2",
  exams: {},
  currentHistory: {
    answers: {},
    observations: {},
  },
  morbidHistory: {
    answers: {},
    observations: {},
  },
  physicalActivity: {
    answers: {},
    observations: {},
    sports: {},
  },
  diet: {
    mealsTaken: [],
    weeklyFrequency: {},
    dailyPortions: {},
  },
  familyHistory: {
    answers: {},
    observations: {},
  },
  reassessment: {
    recentActivity: {},
    intendedActivity: {},
  },
  selfPerception: {},
  finalReport: {},
};

/* ──────────────────────────────────────────────────────────────────────
 * Steps do fluxo (com label e id; demais 4 etapas virão depois)
 * ────────────────────────────────────────────────────────────────────── */

export interface FullStep {
  id: FullStepId;
  label: string;
}

export const FULL_STEPS: readonly FullStep[] = [
  { id: "exams", label: "Últimos Exames" },
  { id: "current", label: "Histórico Atual" },
  { id: "morbid", label: "Antecedentes Mórbidos" },
  { id: "activity", label: "Atividade Física" },
  { id: "diet", label: "Dieta" },
  { id: "family", label: "Histórico Familiar" },
  { id: "reassessment", label: "Anamnese - Reavaliação Física" },
  { id: "selfperception", label: "Autopercepção" },
  { id: "report", label: "Laudo Final" },
] as const;

/* Helpers de validação por etapa */

export function isExamsValid(_data: FullExams): boolean {
  // Datas são opcionais (podem ainda não ter sido feitos)
  return true;
}

export function isCurrentHistoryValid(data: CurrentHistory): boolean {
  return ALL_CURRENT_HISTORY_QUESTIONS.every(
    (q) => data.answers?.[q.id] !== undefined
  );
}

export function isMorbidHistoryValid(data: MorbidHistory): boolean {
  return MORBID_QUESTIONS.every((q) => data.answers?.[q.id] !== undefined);
}

export function isActivityValid(data: PhysicalActivity): boolean {
  return ACTIVITY_QUESTIONS.every((q) => data.answers?.[q.id] !== undefined);
}

export function isDietValid(_data: DietData): boolean {
  // Dieta tem muitos campos opcionais — validamos só o essencial
  return true;
}
