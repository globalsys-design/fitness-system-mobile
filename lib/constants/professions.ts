/**
 * Profession constants and labels
 * Centralized source of truth to avoid duplication across components
 */

export enum ProfessionEnum {
  DOCTOR = "Médico",
  NUTRITIONIST = "Nutricionista",
  PHYSIOTHERAPIST = "Fisioterapeuta",
  FITNESS_COACH = "Educador Físico",
  INTERN = "Estagiário",
  OTHER = "Outro",
}

export const PROFESSIONS = [
  { value: ProfessionEnum.DOCTOR, label: "Médico" },
  { value: ProfessionEnum.NUTRITIONIST, label: "Nutricionista" },
  { value: ProfessionEnum.PHYSIOTHERAPIST, label: "Fisioterapeuta" },
  { value: ProfessionEnum.FITNESS_COACH, label: "Educador Físico" },
  { value: ProfessionEnum.INTERN, label: "Estagiário" },
  { value: ProfessionEnum.OTHER, label: "Outro" },
] as const;

export function getProfessionLabel(profession: string | undefined): string {
  if (!profession) return "";
  return PROFESSIONS.find((p) => p.value === profession)?.label || profession;
}
