import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  newPassword: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

export const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const assistantSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  profession: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const assessmentSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
  population: z.enum(["NORMAL", "ATHLETE", "ELDERLY", "CHILD", "PREGNANT"]).default("NORMAL"),
  modality: z.string().optional(),
});

export const calendarEventSchema = z.object({
  type: z.enum(["ASSESSMENT", "PRESCRIPTION"]),
  title: z.string().min(2, "Título deve ter no mínimo 2 caracteres"),
  clientId: z.string().optional(),
  description: z.string().optional(),
  startAt: z.string(),
  endAt: z.string(),
});
