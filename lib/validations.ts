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

// ── Permissões (modelo CRUD) ────────────────────────────────────────────────
// Cada módulo tem 4 eixos: visualizar, criar, editar, deletar.
// `isAdmin`: master toggle — concede acesso total, ignorando os eixos específicos.
export const crudPermissionSchema = z.object({
  view: z.boolean(),
  create: z.boolean(),
  edit: z.boolean(),
  delete: z.boolean(),
});

export const permissionsSchema = z.object({
  isAdmin: z.boolean().optional(),
  clients: crudPermissionSchema.optional(),
  assessments: crudPermissionSchema.optional(),
  prescriptions: crudPermissionSchema.optional(),
  calendar: crudPermissionSchema.optional(),
  billing: crudPermissionSchema.optional(),
});

export type CrudPermission = z.infer<typeof crudPermissionSchema>;
export type PermissionsMap = z.infer<typeof permissionsSchema>;

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
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres").optional().or(z.literal("")),
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
  permissions: permissionsSchema.optional(),
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
  // Modalidades: multi-select. Mantém `modality` (string) para compat com chamadas antigas
  // e `modalities` (array) como novo formato — a API aceita ambos.
  modality: z.string().optional(),
  modalities: z.array(z.string()).optional(),
  // Agendamento opcional da próxima avaliação
  scheduleNext: z.boolean().optional().default(false),
  nextDate: z.string().optional(),
  nextStartTime: z.string().optional(),
  nextEndTime: z.string().optional(),
}).refine(
  (data) => {
    if (!data.scheduleNext) return true;
    return !!data.nextDate && !!data.nextStartTime && !!data.nextEndTime;
  },
  { message: "Preencha data, hora de início e fim", path: ["nextDate"] }
).refine(
  (data) => {
    if (!data.scheduleNext || !data.nextStartTime || !data.nextEndTime) return true;
    return data.nextStartTime < data.nextEndTime;
  },
  { message: "Hora de fim deve ser posterior à hora de início", path: ["nextEndTime"] }
);

export const calendarEventSchema = z.object({
  type: z.enum(["ASSESSMENT", "PRESCRIPTION"]),
  title: z.string().min(2, "Título deve ter no mínimo 2 caracteres"),
  clientId: z.string().optional(),
  description: z.string().optional(),
  startAt: z.string(),
  endAt: z.string(),
});
