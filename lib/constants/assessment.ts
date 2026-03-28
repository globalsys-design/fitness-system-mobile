/**
 * Assessment constants
 * Centralized source of truth to avoid duplication across components
 */

export const POPULATION_OPTIONS = [
  { value: "NORMAL", label: "Normal" },
  { value: "ATHLETE", label: "Atleta" },
  { value: "ELDERLY", label: "Idoso" },
  { value: "CHILD", label: "Criança" },
  { value: "PREGNANT", label: "Gestante" },
] as const;

export const MODALITY_OPTIONS = [
  { value: "Atletismo", label: "Atletismo" },
  { value: "Futebol", label: "Futebol" },
  { value: "Musculação", label: "Musculação" },
  { value: "Basquete", label: "Basquete" },
  { value: "Beach Tênis", label: "Beach Tênis" },
  { value: "Natação", label: "Natação" },
  { value: "Outras", label: "Outras modalidades" },
] as const;
