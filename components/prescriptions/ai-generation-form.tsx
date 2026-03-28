'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import {
  FOCUS_OPTIONS_WITH_DESCRIPTION,
  LEVEL_OPTIONS,
  EQUIPMENT_OPTIONS,
  SESSION_DURATION_OPTIONS,
} from '@/lib/constants/prescription';

const aiGenerationSchema = z.object({
  focus: z.enum(['hypertrophy', 'strength', 'endurance', 'functional', 'aesthetic']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  daysPerWeek: z.number().min(1).max(7),
  sessionDuration: z.enum(['30', '45', '60', '90']),
  equipment: z.array(z.enum(['dumbbell', 'barbell', 'machine', 'cable', 'bodyweight'])),
  injuries: z.string().optional(),
});

type AIGenerationFormData = z.infer<typeof aiGenerationSchema>;


interface AIGenerationFormProps {
  clientId: string;
  assessmentId?: string;
  onSubmit: (data: AIGenerationFormData) => Promise<void>;
  isLoading?: boolean;
}

export function AIGenerationForm({
  clientId,
  assessmentId,
  onSubmit,
  isLoading = false,
}: AIGenerationFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<AIGenerationFormData>({
    resolver: zodResolver(aiGenerationSchema),
    defaultValues: {
      focus: 'hypertrophy',
      level: 'intermediate',
      daysPerWeek: 4,
      sessionDuration: '60',
      equipment: ['dumbbell', 'barbell'],
      injuries: '',
    },
  });

  const handleSubmit = async (data: AIGenerationFormData) => {
    try {
      setSubmitError(null);
      await onSubmit(data);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Erro ao gerar ficha de treino com IA'
      );
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Gerar Ficha com IA</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Preencha os parâmetros para gerar uma ficha de treino personalizada
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Foco do Treino */}
          <div className="space-y-2">
            <Label htmlFor="focus" className="text-sm font-semibold">
              Foco do Treino
            </Label>
            <Controller
              name="focus"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o foco" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOCUS_OPTIONS_WITH_DESCRIPTION.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Nível */}
          <div className="space-y-2">
            <Label htmlFor="level" className="text-sm font-semibold">
              Nível do Cliente
            </Label>
            <Controller
              name="level"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Dias por Semana */}
          <div className="space-y-2">
            <Label htmlFor="daysPerWeek" className="text-sm font-semibold">
              Dias por Semana: {form.watch('daysPerWeek')}
            </Label>
            <input
              type="range"
              min="1"
              max="7"
              {...form.register('daysPerWeek', { valueAsNumber: true })}
              className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 dia</span>
              <span>7 dias</span>
            </div>
          </div>

          {/* Duração da Sessão */}
          <div className="space-y-2">
            <Label htmlFor="sessionDuration" className="text-sm font-semibold">
              Duração da Sessão
            </Label>
            <Controller
              name="sessionDuration"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSION_DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Equipamentos Disponíveis */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Equipamentos Disponíveis</Label>
            <div className="space-y-2">
              {EQUIPMENT_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Controller
                    name="equipment"
                    control={form.control}
                    render={({ field }) => (
                      <Checkbox
                        id={option.value}
                        checked={field.value.includes(
                          option.value as AIGenerationFormData['equipment'][number]
                        )}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...field.value, option.value as AIGenerationFormData['equipment'][number]]
                            : field.value.filter((v) => v !== option.value);
                          field.onChange(newValue);
                        }}
                      />
                    )}
                  />
                  <Label
                    htmlFor={option.value}
                    className="text-sm cursor-pointer font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Lesões ou Restrições */}
          <div className="space-y-2">
            <Label htmlFor="injuries" className="text-sm font-semibold">
              Lesões ou Restrições (opcional)
            </Label>
            <textarea
              id="injuries"
              placeholder="Ex: Lesão no ombro, dor nas costas..."
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
              {...form.register('injuries')}
            />
          </div>

          {/* Erro */}
          {submitError && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
              {submitError}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar Ficha com IA'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
