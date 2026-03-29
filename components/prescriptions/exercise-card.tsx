'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExerciseData {
  id?: string;
  name: string;
  series: number;
  repetitions: string;
  load: string;
  rest: string;
  observations?: string;
}

interface ExerciseCardProps {
  exercise: ExerciseData;
  index: number;
  onEdit?: (exercise: ExerciseData) => void;
  onDelete?: (id: string | undefined) => void;
  isReadOnly?: boolean;
}

export function ExerciseCard({
  exercise,
  index,
  onEdit,
  onDelete,
  isReadOnly = false,
}: ExerciseCardProps) {
  return (
    <Card className="bg-card border-border hover:bg-accent/5 transition-colors">
      <CardContent className="p-4 sm:p-6">
        {/* Cabeçalho com número e ações */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
              <span className="text-sm font-semibold text-primary">{index + 1}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-foreground line-clamp-2">
                {exercise.name}
              </h3>
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(exercise)}
                  className="h-9 w-9 p-0"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="sr-only">Editar exercício</span>
                </Button>
              )}
              {onDelete && exercise.id && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(exercise.id)}
                  className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">Deletar exercício</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Grid de informações */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Séries */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase">Séries</span>
            <span className="text-base sm:text-lg font-bold text-foreground">
              {exercise.series}x
            </span>
          </div>

          {/* Repetições */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase">Reps</span>
            <span className="text-base sm:text-lg font-bold text-foreground">
              {exercise.repetitions}
            </span>
          </div>

          {/* Carga */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase">Carga</span>
            <span className="text-base sm:text-lg font-bold text-foreground">
              {exercise.load}
            </span>
          </div>

          {/* Descanso */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase">Descanso</span>
            <span className="text-base sm:text-lg font-bold text-foreground">
              {exercise.rest}
            </span>
          </div>
        </div>

        {/* Observações - se houver */}
        {exercise.observations && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
              Observações
            </p>
            <p className="text-sm text-foreground">{exercise.observations}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
