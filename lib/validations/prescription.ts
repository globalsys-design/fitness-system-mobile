import { z } from 'zod';

/**
 * Schema para exercício individual
 */
export const exerciseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome do exercício é obrigatório'),
  series: z.number().min(1, 'Mínimo 1 série').max(10, 'Máximo 10 séries'),
  repetitions: z.string().min(1, 'Repetições obrigatórias'),
  load: z.string().min(1, 'Carga obrigatória'),
  rest: z.string().min(1, 'Tempo de descanso obrigatório'),
  observations: z.string().optional(),
});

export type Exercise = z.infer<typeof exerciseSchema>;

/**
 * Schema para ficha de treino
 */
export const trainingSheetSchema = z.object({
  id: z.string().optional(),
  clientId: z.string(),
  professionalId: z.string(),
  name: z.string().min(1, 'Nome da ficha é obrigatório').max(100),
  description: z.string().optional(),
  focus: z.enum(['hypertrophy', 'strength', 'endurance', 'functional', 'aesthetic']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  daysPerWeek: z.number().min(1).max(7),
  sessionDuration: z.number().min(15).max(180), // em minutos
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  exercises: z.array(exerciseSchema),
  notes: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed']).default('active'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type TrainingSheet = z.infer<typeof trainingSheetSchema>;

/**
 * Schema para prescrição aeróbica
 */
export const aerobicPrescriptionSchema = z.object({
  id: z.string().optional(),
  clientId: z.string(),
  professionalId: z.string(),
  modality: z.enum([
    'bike',
    'running',
    'swimming',
    'elliptical',
    'rowing',
    'walking',
    'treadmill',
    'jump-rope',
  ]),
  intensity: z.enum(['low', 'moderate', 'high', 'very-high']),
  duration: z.number().min(5).max(180), // em minutos
  frequency: z.enum(['daily', '3x-week', '4x-week', '5x-week', '6x-week']),

  // Parâmetros específicos por modalidade
  speed: z.number().optional(), // km/h ou similar
  rpm: z.number().optional(), // rotações por minuto (bike)
  resistance: z.number().optional(), // resistência (bike, elíptico)
  incline: z.number().optional(), // inclinação (esteira, corrida)
  spm: z.number().optional(), // strokes per minute (remo)

  notes: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed']).default('active'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type AerobicPrescription = z.infer<typeof aerobicPrescriptionSchema>;

/**
 * Schema para resposta da geração com IA
 */
export const aiGenerationResponseSchema = z.object({
  trainingSheet: trainingSheetSchema,
  exercises: z.array(exerciseSchema),
});

export type AIGenerationResponse = z.infer<typeof aiGenerationResponseSchema>;

/**
 * Schemas para requisições API
 */
export const createTrainingSheetSchema = trainingSheetSchema.pick({
  name: true,
  description: true,
  focus: true,
  level: true,
  daysPerWeek: true,
  sessionDuration: true,
  exercises: true,
  notes: true,
});

export const createAerobicPrescriptionSchema = aerobicPrescriptionSchema.pick({
  modality: true,
  intensity: true,
  duration: true,
  frequency: true,
  speed: true,
  rpm: true,
  resistance: true,
  incline: true,
  spm: true,
  notes: true,
});

export const aiGenerationParamsSchema = z.object({
  focus: z.enum(['hypertrophy', 'strength', 'endurance', 'functional', 'aesthetic']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  daysPerWeek: z.number().min(1).max(7),
  sessionDuration: z.enum(['30', '45', '60', '90']),
  equipment: z.array(z.enum(['dumbbell', 'barbell', 'machine', 'cable', 'bodyweight'])),
  injuries: z.string().optional(),
});

export type AIGenerationParams = z.infer<typeof aiGenerationParamsSchema>;
