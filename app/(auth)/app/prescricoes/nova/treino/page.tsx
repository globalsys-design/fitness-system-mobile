'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Wand2, PlusCircle, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';

type CreationMethod = 'manual' | 'ai' | 'clone' | null;

export default function NewTrainingSheetPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<CreationMethod>(null);

  const handleSelectMethod = (method: CreationMethod) => {
    if (method === 'manual') {
      router.push('/app/prescricoes/nova/treino/manual');
    } else if (method === 'ai') {
      router.push('/app/prescricoes/nova/treino/ia');
    } else if (method === 'clone') {
      router.push('/app/prescricoes/nova/treino/clonar');
    }
  };

  return (
    <div className="space-y-6">
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
          <h1 className="text-2xl font-bold text-foreground">Nova Ficha de Treino</h1>
          <p className="text-sm text-muted-foreground">
            Escolha como deseja criar a ficha
          </p>
        </div>
      </div>

      {/* Selection Cards */}
      <div className="grid grid-cols-1 gap-3 mt-8">
        {/* Criar Manualmente */}
        <button
          onClick={() => handleSelectMethod('manual')}
          className="group text-left"
        >
          <Card className="bg-card border-border hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 group-hover:bg-primary/20 rounded-lg transition-colors mt-0.5">
                  <PlusCircle className="w-6 h-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                    Criar Manualmente
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Crie do zero com total controle sobre cada exercício, série e carga
                  </p>
                </div>

                <div className="text-muted-foreground group-hover:text-primary transition-colors mt-0.5">
                  →
                </div>
              </div>
            </CardContent>
          </Card>
        </button>

        {/* Criar com IA */}
        <button
          onClick={() => handleSelectMethod('ai')}
          className="group text-left"
        >
          <Card className="bg-card border-border hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 group-hover:bg-primary/20 rounded-lg transition-colors mt-0.5">
                  <Wand2 className="w-6 h-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                    Gerar com IA
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Deixe a inteligência artificial criar uma ficha personalizada baseada
                    no perfil do cliente
                  </p>
                </div>

                <div className="text-muted-foreground group-hover:text-primary transition-colors mt-0.5">
                  →
                </div>
              </div>
            </CardContent>
          </Card>
        </button>

        {/* Clonar Ficha Existente */}
        <button
          onClick={() => handleSelectMethod('clone')}
          className="group text-left"
        >
          <Card className="bg-card border-border hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 group-hover:bg-primary/20 rounded-lg transition-colors mt-0.5">
                  <Copy className="w-6 h-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                    Clonar Ficha
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Utilize uma ficha anterior como base e adapte conforme necessário
                  </p>
                </div>

                <div className="text-muted-foreground group-hover:text-primary transition-colors mt-0.5">
                  →
                </div>
              </div>
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Info Box */}
      <Card className="bg-accent/5 border-border mt-8">
        <CardContent className="p-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            <strong className="text-foreground">Dica:</strong> Use a opção "Gerar com IA" para
            criar fichas personalizadas rapidamente baseadas no perfil do cliente. Você sempre
            poderá editar e ajustar depois.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
