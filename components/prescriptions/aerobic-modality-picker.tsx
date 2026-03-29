'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AerobicModality = 'bike' | 'running' | 'swimming' | 'elliptical' | 'rowing' | 'walking' | 'treadmill' | 'jump-rope';

interface ModalityOption {
  id: AerobicModality;
  label: string;
  description: string;
  icon: string;
}

const MODALITIES: ModalityOption[] = [
  {
    id: 'bike',
    label: 'Bicicleta',
    description: 'Estacionária ou outdoor',
    icon: '🚴',
  },
  {
    id: 'running',
    label: 'Corrida',
    description: 'Em pista ou outdoor',
    icon: '🏃',
  },
  {
    id: 'swimming',
    label: 'Natação',
    description: 'Piscina',
    icon: '🏊',
  },
  {
    id: 'elliptical',
    label: 'Elíptico',
    description: 'Máquina elíptica',
    icon: '🚴‍♀️',
  },
  {
    id: 'rowing',
    label: 'Remo',
    description: 'Máquina de remo',
    icon: '🚣',
  },
  {
    id: 'walking',
    label: 'Caminhada',
    description: 'Baixa intensidade',
    icon: '🚶',
  },
  {
    id: 'treadmill',
    label: 'Esteira',
    description: 'Motorizada',
    icon: '🏃‍♂️',
  },
  {
    id: 'jump-rope',
    label: 'Pular Corda',
    description: 'Alta intensidade',
    icon: '⛹️',
  },
];

interface AerobicModalityPickerProps {
  selectedModality?: AerobicModality;
  onSelect: (modality: AerobicModality) => void;
  disabled?: boolean;
}

export function AerobicModalityPicker({
  selectedModality,
  onSelect,
  disabled = false,
}: AerobicModalityPickerProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Selecione a Modalidade</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Escolha a atividade aeróbica para ajustar os parâmetros específicos
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {MODALITIES.map((modality) => {
          const isSelected = selectedModality === modality.id;

          return (
            <Button
              key={modality.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(modality.id)}
              variant="outline"
              className={cn(
                'h-auto p-4 flex flex-col items-center justify-center gap-2 rounded-lg',
                'transition-all duration-200 cursor-pointer',
                'hover:border-primary hover:bg-primary/5',
                isSelected && 'border-primary bg-primary/10',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="text-3xl">{modality.icon}</div>
              <div className="text-center">
                <div className="text-xs font-semibold text-foreground line-clamp-1">
                  {modality.label}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {modality.description}
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="bg-primary rounded-full p-1">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                </div>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Retorna os campos específicos da modalidade selecionada
 */
export function getModalityFields(modality: AerobicModality) {
  const fieldsMap: Record<AerobicModality, string[]> = {
    bike: ['rpm', 'resistance', 'duration'],
    running: ['speed', 'incline', 'duration'],
    swimming: ['strokes', 'intensity', 'duration'],
    elliptical: ['rpm', 'resistance', 'duration'],
    rowing: ['spm', 'resistance', 'duration'],
    walking: ['speed', 'incline', 'duration'],
    treadmill: ['speed', 'incline', 'duration'],
    'jump-rope': ['rpd', 'intensity', 'duration'],
  };

  return fieldsMap[modality] || [];
}
