/**
 * User-related constants
 * Centralized source of truth to avoid duplication across components
 */

export const USER_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
] as const;

export const GENDER_OPTIONS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Feminino" },
  { value: "OTHER", label: "Outro" },
] as const;
