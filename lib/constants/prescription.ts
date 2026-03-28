/**
 * Prescription constants
 * Centralized source of truth to avoid duplication across components
 */

export const INTENSITY_OPTIONS = [
  { value: "low", label: "Baixa" },
  { value: "moderate", label: "Moderada" },
  { value: "high", label: "Alta" },
  { value: "very-high", label: "Muito Alta" },
] as const;

/** Extended intensity options with heart rate zone descriptions */
export const INTENSITY_OPTIONS_WITH_HR = [
  { value: "low", label: "Baixa (50-60% FC máx)" },
  { value: "moderate", label: "Moderada (60-70% FC máx)" },
  { value: "high", label: "Alta (70-85% FC máx)" },
  { value: "very-high", label: "Muito Alta (>85% FC máx)" },
] as const;

export const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Diária" },
  { value: "3x-week", label: "3x/semana" },
  { value: "4x-week", label: "4x/semana" },
  { value: "5x-week", label: "5x/semana" },
  { value: "6x-week", label: "6x/semana" },
] as const;

/** Extended frequency options with "por semana" phrasing */
export const FREQUENCY_OPTIONS_EXTENDED = [
  { value: "daily", label: "Diária" },
  { value: "3x-week", label: "3x por semana" },
  { value: "4x-week", label: "4x por semana" },
  { value: "5x-week", label: "5x por semana" },
  { value: "6x-week", label: "6x por semana" },
] as const;

export const FOCUS_OPTIONS = [
  { value: "hypertrophy", label: "Hipertrofia" },
  { value: "strength", label: "Força" },
  { value: "endurance", label: "Resistência" },
  { value: "functional", label: "Funcional" },
  { value: "aesthetic", label: "Estético" },
] as const;

/** Extended focus options with descriptions (used in AI generation form) */
export const FOCUS_OPTIONS_WITH_DESCRIPTION = [
  { value: "hypertrophy", label: "Hipertrofia (Ganho de Massa)" },
  { value: "strength", label: "Força (Ganho de Força)" },
  { value: "endurance", label: "Resistência (Resistência Muscular)" },
  { value: "functional", label: "Funcional (Movimentos do Dia a Dia)" },
  { value: "aesthetic", label: "Estético (Definição)" },
] as const;

export const LEVEL_OPTIONS = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
] as const;

export const EQUIPMENT_OPTIONS = [
  { value: "dumbbell", label: "Halteres" },
  { value: "barbell", label: "Barra" },
  { value: "machine", label: "Máquinas" },
  { value: "cable", label: "Cabos" },
  { value: "bodyweight", label: "Peso Corporal" },
] as const;

export const SESSION_DURATION_OPTIONS = [
  { value: "30", label: "30 minutos" },
  { value: "45", label: "45 minutos" },
  { value: "60", label: "60 minutos" },
  { value: "90", label: "90 minutos" },
] as const;

export const AEROBIC_MODALITY_OPTIONS = [
  { value: "bike", label: "Bicicleta", icon: "\u{1F6B4}" },
  { value: "running", label: "Corrida", icon: "\u{1F3C3}" },
  { value: "swimming", label: "Natação", icon: "\u{1F3CA}" },
  { value: "elliptical", label: "Elíptico", icon: "\u{1F6B4}\u200D\u2640\uFE0F" },
  { value: "rowing", label: "Remo", icon: "\u{1F6A3}" },
  { value: "walking", label: "Caminhada", icon: "\u{1F6B6}" },
  { value: "treadmill", label: "Esteira", icon: "\u{1F3C3}\u200D\u2642\uFE0F" },
  { value: "jump-rope", label: "Pular Corda", icon: "\u26F9\uFE0F" },
] as const;
