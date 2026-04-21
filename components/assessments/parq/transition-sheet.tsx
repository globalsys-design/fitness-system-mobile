"use client";

/**
 * TransitionSheet — "Estamos quase finalizando…"
 *
 * Reproduz o modal do Figma (node 6064-50726) entre Etapa 1 e Etapa 2.
 * Mobile-first: BottomSheet (vaul). Desktop: centralizado com max-w-md.
 *
 * Mostra um stepper de 6 pontinhos (sections) como prévia do que vem a seguir.
 */

import { CheckCircle2 } from "lucide-react";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { Button } from "@/components/ui/button";

interface TransitionSheetProps {
  open: boolean;
  onContinue: () => void;
  onOpenChange: (open: boolean) => void;
  /** Quantas seções serão mostradas na Etapa 2 (default 10). */
  sectionsCount?: number;
}

export function TransitionSheet({
  open,
  onContinue,
  onOpenChange,
  sectionsCount = 10,
}: TransitionSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      srOnlyTitle="Transição para a Etapa 2 do PAR-Q+"
      srOnlyDescription="Você está próximo de finalizar a triagem. A próxima etapa traz perguntas de acompanhamento."
    >
      <div className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 space-y-5">
        {/* Mini stepper de preview */}
        <div
          className="flex items-center justify-center gap-1.5 pt-2"
          aria-hidden="true"
        >
          {Array.from({ length: Math.min(sectionsCount, 6) }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-8 rounded-full bg-primary/30 animate-in fade-in fill-mode-both"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>

        {/* Header com ícone */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <CheckCircle2 className="h-5 w-5 text-primary" strokeWidth={2.5} />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Estamos quase finalizando...
          </h2>
        </div>

        {/* Mensagem */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          Como você respondeu &ldquo;SIM&rdquo; a pelo menos uma das perguntas,
          será necessário que você responda a mais algumas para coletarmos
          informações adicionais antes de oferecer recomendações.
        </p>

        {/* CTA */}
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full h-12 text-base font-semibold"
        >
          Próximo
        </Button>
      </div>
    </BottomSheet>
  );
}
