import { z } from "zod";

// ── Age Helpers ──────────────────────────────────────────────────

/**
 * Calculates precise age in years from a birth date string (YYYY-MM-DD).
 * Handles leap years and checks if the birthday has occurred this year.
 */
export function calculateAge(birthDateStr: string): number {
  const birth = new Date(birthDateStr + "T00:00:00");
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Returns true if the person is under 18 based on birth date string.
 */
export function isMinor(birthDateStr: string | undefined | null): boolean {
  if (!birthDateStr) return false;
  return calculateAge(birthDateStr) < 18;
}

// ── CPF Helper ──────────────────────────────────────────────────
function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === parseInt(digits[10]);
}

// ── Sub-schemas ──────────────────────────────────────────────────

const addressSchema = z.object({
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

const responsibleSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Email do responsável inválido").optional().or(z.literal("")),
  cpf: z
    .string()
    .optional()
    .refine((val) => !val || isValidCPF(val), { message: "CPF do responsável inválido" }),
  phone: z.string().optional(),
  profession: z.string().optional(),
});

const emergencySchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  landline: z.string().optional(),
  notes: z.string().optional(),
});

const dayAvailabilitySchema = z.object({
  active: z.boolean().default(false),
  start: z.string().optional(),
  end: z.string().optional(),
});

const availabilitySchema = z.object({
  monday: dayAvailabilitySchema.default({ active: false }),
  tuesday: dayAvailabilitySchema.default({ active: false }),
  wednesday: dayAvailabilitySchema.default({ active: false }),
  thursday: dayAvailabilitySchema.default({ active: false }),
  friday: dayAvailabilitySchema.default({ active: false }),
  saturday: dayAvailabilitySchema.default({ active: false }),
  sunday: dayAvailabilitySchema.default({ active: false }),
});

// ── Master Schema (5 Steps) ─────────────────────────────────────

export const clientFormSchema = z
  .object({
    // Step 1 — Dados Pessoais
    photo: z.string().max(500000, "Imagem muito grande. Use uma foto menor.").optional(),
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    birthDate: z.string().optional(),
    cpf: z
      .string()
      .optional()
      .refine((val) => !val || isValidCPF(val), { message: "CPF inválido" }),
    gender: z.string().optional(),
    maritalStatus: z.string().optional(),
    ethnicity: z.string().optional(),
    healthInsurance: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    phoneDdi: z.string().default("+55"),
    emergencyPhone: z.string().optional(),

    // Step 2 — Endereço e Profissão
    address: addressSchema.optional(),
    profession: z.string().optional(),

    // Step 3 — Responsável e Emergência
    responsible: responsibleSchema.optional(),
    emergency: emergencySchema.optional(),

    // Step 4 — Acesso
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres").optional().or(z.literal("")),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),

    // Step 5 — Disponibilidade
    availability: availabilitySchema.optional(),
  })
  .superRefine((data, ctx) => {
    // Conditional validation: if client is a minor, responsible fields are required
    if (isMinor(data.birthDate)) {
      const resp = data.responsible;

      if (!resp?.name || resp.name.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nome do responsável é obrigatório para menores de 18 anos",
          path: ["responsible", "name"],
        });
      }

      if (!resp?.cpf) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CPF do responsável é obrigatório para menores de 18 anos",
          path: ["responsible", "cpf"],
        });
      } else if (!isValidCPF(resp.cpf)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CPF do responsável inválido",
          path: ["responsible", "cpf"],
        });
      }

      if (!resp?.phone || resp.phone.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Telefone do responsável é obrigatório para menores de 18 anos",
          path: ["responsible", "phone"],
        });
      }
    }
  });

export type ClientFormData = z.infer<typeof clientFormSchema>;

// ── Fields per step (for trigger validation) ─────────────────────

export const STEP_FIELDS: Record<number, (keyof ClientFormData)[]> = {
  0: ["name", "email", "phone", "cpf", "birthDate"],
  1: ["address", "profession"],
  2: ["responsible", "emergency"],
  3: ["password", "status"],
  4: ["availability"],
};

// ── Constants ────────────────────────────────────────────────────

export const GENDER_OPTIONS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Feminino" },
  { value: "OTHER", label: "Outro" },
  { value: "PREFER_NOT", label: "Prefiro não informar" },
] as const;

export const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Solteiro(a)" },
  { value: "married", label: "Casado(a)" },
  { value: "divorced", label: "Divorciado(a)" },
  { value: "widowed", label: "Viúvo(a)" },
  { value: "other", label: "Outro" },
] as const;

export const ETHNICITY_OPTIONS = [
  { value: "white", label: "Branco(a)" },
  { value: "black", label: "Negro(a)" },
  { value: "brown", label: "Pardo(a)" },
  { value: "asian", label: "Amarelo(a)" },
  { value: "indigenous", label: "Indígena" },
  { value: "other", label: "Outro" },
] as const;

export const DAYS_OF_WEEK = [
  { key: "monday" as const, label: "Segunda-feira" },
  { key: "tuesday" as const, label: "Terça-feira" },
  { key: "wednesday" as const, label: "Quarta-feira" },
  { key: "thursday" as const, label: "Quinta-feira" },
  { key: "friday" as const, label: "Sexta-feira" },
  { key: "saturday" as const, label: "Sábado" },
  { key: "sunday" as const, label: "Domingo" },
] as const;

export const DDI_OPTIONS = [
  { value: "+55", label: "🇧🇷 +55" },
  { value: "+1", label: "🇺🇸 +1" },
  { value: "+351", label: "🇵🇹 +351" },
  { value: "+34", label: "🇪🇸 +34" },
  { value: "+39", label: "🇮🇹 +39" },
  { value: "+44", label: "🇬🇧 +44" },
  { value: "+49", label: "🇩🇪 +49" },
  { value: "+33", label: "🇫🇷 +33" },
  { value: "+81", label: "🇯🇵 +81" },
] as const;
