export const MUSCLE_GROUPS = [
  { value: "PEITO", label: "Peito" },
  { value: "COSTAS", label: "Costas" },
  { value: "OMBROS", label: "Ombros" },
  { value: "BICEPS", label: "Biceps" },
  { value: "TRICEPS", label: "Triceps" },
  { value: "ANTEBRACO", label: "Antebraco" },
  { value: "ABDOMEN", label: "Abdomen" },
  { value: "QUADRICEPS", label: "Quadriceps" },
  { value: "POSTERIOR", label: "Posterior" },
  { value: "GLUTEOS", label: "Gluteos" },
  { value: "PANTURRILHA", label: "Panturrilha" },
  { value: "CORPO_TODO", label: "Corpo todo" },
] as const;

export const EXERCISE_CATEGORIES = [
  { value: "STRENGTH", label: "Forca" },
  { value: "AEROBIC", label: "Aerobico" },
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]["value"];
export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number]["value"];
