'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { INTENSITY_OPTIONS_WITH_HR, FREQUENCY_OPTIONS_EXTENDED } from '@/lib/constants/prescription';
import {
  AerobicModalityPicker,
  type AerobicModality,
} from '@/components/prescriptions/aerobic-modality-picker';

const aerobicSchema = z.object({
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
  duration: z.number().min(5).max(180),
  frequency: z.enum(['daily', '3x-week', '4x-week', '5x-week', '6x-week']),
  speed: z.number().optional(),
  rpm: z.number().optional(),
  resistance: z.number().optional(),
  incline: z.number().optional(),
  spm: z.number().optional(),
  notes: z.string().optional(),
});

type AerobicFormData = z.infer<typeof aerobicSchema>;

export default function AerobicPrescriptionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AerobicFormData>({
    resolver: zodResolver(aerobicSchema),
    defaultValues: {
      modality: 'running',
      intensity: 'moderate',
      duration: 30,
      frequency: '4x-week',
      notes: '',
    },
  });

  const selectedModality = form.watch('modality');

  const handleSubmit = async (data: AerobicFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting aerobic prescription:', data);
      alert('Prescrição aeróbica criada com sucesso!');
      router.push('/app/prescricoes');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-10 w-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Prescrição Aeróbica</h1>
          <p className="text-sm text-muted-foreground">
            Configure a atividade aeróbica personalizada
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Seleção de Modalidade */}
            <div>
              <Controller
                name="modality"
                control={form.control}
                render={({ field }) => (
                  <AerobicModalityPicker
                    selectedModality={field.value}
                    onSelect={field.onChange}
                  />
                )}
              />
            </div>

            {/* Divisor */}
            <div className="border-t border-border" />

            {/* Parâmetros */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Parâmetros</h3>

              {/* Intensidade */}
              <div className="space-y-2">
                <Label htmlFor="intensity">Intensidade</Label>
                <Controller
                  name="intensity"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INTENSITY_OPTIONS_WITH_HR.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Duração */}
              <div className="space-y-2">
                <Label htmlFor="duration">
                  Duração: {form.watch('duration')} minutos
                </Label>
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  {...form.register('duration', { valueAsNumber: true })}
                  className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Frequência */}
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência Semanal</Label>
                <Controller
                  name="frequency"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCY_OPTIONS_EXTENDED.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas e Observações (opcional)</Label>
              <textarea
                placeholder="Ex: Não permitir em dias com dor nas articulações..."
                rows={3}
                {...form.register('notes')}
                className="w-full px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
              />
            </div>

            {/* Botões de Ação - Sticky */}
            <div className="sticky bottom-0 left-0 right-0 -mx-6 px-6 py-4 bg-card border-t border-border flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Prescrição'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
