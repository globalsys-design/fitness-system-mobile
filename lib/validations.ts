import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const credentialsLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export const recoveryEmailSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
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
  gender: z.enum(["M", "F", ""]).optional(),
  activityLevel: z.string().optional(),
  objective: z.string().optional(),
  address: z.object({
    cep: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const clientStep1Schema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["M", "F", ""]).optional(),
});

export const assistantSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  emergencyPhone: z.string().optional(),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  birthCity: z.string().optional(),
  maritalStatus: z.string().optional(),
  profession: z.string().optional(),
  role: z.string().optional(),
  address: z.object({
    cep: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  permissions: z.object({
    clients: z.object({ read: z.boolean(), write: z.boolean() }).optional(),
    assessments: z.object({ read: z.boolean(), write: z.boolean() }).optional(),
    prescriptions: z.object({ read: z.boolean(), write: z.boolean() }).optional(),
    calendar: z.object({ read: z.boolean(), write: z.boolean() }).optional(),
    billing: z.object({ read: z.boolean(), write: z.boolean() }).optional(),
  }).optional(),
});

export type AssistantFormData = z.infer<typeof assistantSchema>;

// Schemas por step do stepper (5 steps: Nome → Pessoal → Endereço → Profissional → Permissões)
export const assistantStep1Schema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
});

export const assistantStep2Schema = z.object({
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  emergencyPhone: z.string().optional(),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  birthCity: z.string().optional(),
  maritalStatus: z.string().optional(),
});

export const assistantStep3Schema = z.object({
  address: z.object({
    cep: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }).optional(),
});

export const assistantStep4Schema = z.object({
  profession: z.string().optional(),
  role: z.string().optional(),
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
