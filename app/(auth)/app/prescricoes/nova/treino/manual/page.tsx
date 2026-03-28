'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
import { ArrowLeft, Plus } from 'lucide-react';
import { ExerciseCard, ExerciseData } from '@/components/prescriptions/exercise-card';
import { FOCUS_OPTIONS, LEVEL_OPTIONS } from '@/lib/constants/prescription';

const trainingSheetFormSchema = z.object({
  name: z.string().min(1, 'Nome da ficha é obrigatório'),
  focus: z.enum(['hypertrophy', 'strength', 'endurance', 'functional', 'aesthetic']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  daysPerWeek: z.number().min(1).max(7),
  sessionDuration: z.number().min(15).max(180),
  description: z.string().optional(),
});

type TrainingSheetFormData = z.infer<typeof trainingSheetFormSchema>;

export default function ManualTrainingSheetPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<ExerciseData[]>([]);

  const form = useForm<TrainingSheetFormData>({
    resolver: zodResolver(trainingSheetFormSchema),
    defaultValues: {
      name: '',
      focus: 'hypertrophy',
      level: 'intermediate',
      daysPerWeek: 4,
      sessionDuration: 60,
      description: '',
    },
  });

  const handleAddExercise = () => {
    alert('Funcionalidade de adicionar exercícios em desenvolvimento');
  };

  const handleDeleteExercise = (id: string | undefined) => {
    if (id) {
      setExercises(exercises.filter((e) => e.id !== id));
    }
  };

  const handleSubmit = async (data: TrainingSheetFormData) => {
    try {
      console.log('Submitting:', { ...data, exercises });
      alert('Ficha criada com sucesso!');
      router.push('/app/prescricoes');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="w-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Criar Ficha de Treino</h1>
          <p className="text-sm text-muted-foreground">
            Adicione exercícios e configure os parâmetros
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Informações da Ficha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Ficha</Label>
              <Input
                id="name"
                placeholder="Ex: Hipertrofia - Semana 1"
                {...form.register('name')}
              />
            </div>

            {/* Grid de parâmetros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Foco */}
              <div className="space-y-2">
                <Label htmlFor="focus">Foco</Label>
                <Select
                  value={form.watch('focus')}
                  onValueChange={(value: any) => form.setValue('focus', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOCUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nível */}
              <div className="space-y-2">
                <Label htmlFor="level">Nível</Label>
                <Select
                  value={form.watch('level')}
                  onValueChange={(value: any) => form.setValue('level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Criar Ficha de Treino
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
