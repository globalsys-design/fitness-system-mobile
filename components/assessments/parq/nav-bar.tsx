"use client";

/**
 * ParqNavBar — footer fixo com Voltar / Próximo / Salvar.
 *
 * Mobile-first:
 *  - fixed bottom, respeitando safe-area-inset-bottom
 *  - ChevronLeft à esquerda como botão ghost
 *  - Botão principal (Próximo/Salvar) à direita, min 48px height
 *  - Quando no último step, vira "Salvar" com shimmer (low risk) ou ring
 *    destructive (risco elevado)
 */

import { ChevronLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ParqNavBarProps {
  canGoBack: boolean;
  onBack: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  /** Tone do botão principal: padrão / alerta / sucesso. */
  primaryTone?: "primary" | "destructive" | "success";
}

export function ParqNavBar({
  canGoBack,
  onBack,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryLoading,
  primaryTone = "primary",
}: ParqNavBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 left-0 right-0 z-20",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "border-t border-border"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onBack}
          disabled={!canGoBack}
          className="h-11 px-3"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">Voltar</span>
        </Button>

        <Button
          type="button"
          size="lg"
          onClick={onPrimary}
          disabled={primaryDisabled || primaryLoading}
          className={cn(
            "relative h-12 px-6 text-sm font-semibold overflow-hidden",
            primaryTone === "destructive" &&
              "bg-destructive hover:bg-destructive/90 text-destructive-foreground ring-2 ring-destructive/40",
            primaryTone === "success" &&
              "shadow-[0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.4)]"
          )}
        >
          {primaryLoading && (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          )}
          {primaryTone === "success" && !primaryLoading && (
            <Save className="h-4 w-4 mr-2" />
          )}
          <span className="relative z-10">{primaryLabel}</span>

          {/* Shimmer para o botão Salvar quando low risk */}
          {primaryTone === "success" && !primaryLoading && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full"
              style={{
                animation: "parq-shimmer 2.4s ease-in-out infinite",
                background:
                  "linear-gradient(90deg, transparent 0%, oklch(from var(--color-primary-foreground) l c h / 0.25) 50%, transparent 100%)",
              }}
            />
          )}
        </Button>
      </div>

      <style jsx>{`
        @keyframes parq-shimmer {
          0% {
            transform: translateX(-100%);
          }
          60%,
          100% {
            transform: translateX(200%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global([style*="parq-shimmer"]) {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
