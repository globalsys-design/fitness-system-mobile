'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AIGenerationForm } from '@/components/prescriptions/ai-generation-form';
import { AIGenerationParams } from '@/lib/validations/prescription';

export default function AIGenerationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId') || '';
  const assessmentId = searchParams.get('assessmentId');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: AIGenerationParams) => {
    setIsLoading(true);
    try {
      console.log('AI Generation Data:', data);
      alert('Ficha gerada com sucesso!');
      router.push('/app/prescricoes');
    } catch (error) {
      console.error('Error generating prescription:', error);
      throw error;
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold text-foreground">Gerar com IA</h1>
          <p className="text-sm text-muted-foreground">
            Crie uma ficha personalizada com inteligência artificial
          </p>
        </div>
      </div>

      {/* Form */}
      <AIGenerationForm
        clientId={clientId}
        assessmentId={assessmentId || undefined}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {/* Info Box */}
      <div className="bg-accent/5 border border-border rounded-lg p-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground block mb-2">Como funciona:</strong>
          A IA analisará os parâmetros fornecidos e criará uma ficha personalizada com
          exercícios, séries, repetições e cargas adequadas. Você poderá editar todos os
          detalhes após a geração.
        </p>
      </div>
    </div>
  );
}
