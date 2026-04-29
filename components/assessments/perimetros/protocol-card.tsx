"use client";

/**
 * ProtocolCard — exibe resultado de um protocolo derivado de perímetros.
 * Read-only: o card só mostra o valor calculado + status + dica.
 *
 * Estado visual:
 *  - complete  → valor em destaque, badge verde "Completo"
 *  - missing   → valor "—", badge âmbar listando o que falta
 *
 * Tooltip ?(?) → BottomSheet com a citação do protocolo + descrição.
 */

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import type {
  ProtocolDefinition,
  ProtocolResult,
} from "@/lib/calculations/perimetros-protocols";

interface ProtocolCardProps {
  protocol: ProtocolDefinition;
  result: ProtocolResult | null;
  index?: number;
}

export function ProtocolCard({ protocol, result, index = 0 }: ProtocolCardProps) {
  const [open, setOpen] = useState(false);
  const isComplete = result?.status === "complete";

  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 flex flex-col gap-3",
        "bg-card border-border",
        "transition-colors duration-300 ease-out",
        "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header — nome + ícone help */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground leading-snug">
            {protocol.name}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Sobre ${protocol.name}`}
          className={cn(
            "shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full",
            "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            "transition-colors active:scale-90"
          )}
        >
          <HelpCircle className="size-3.5" />
        </button>
      </div>

      {/* Métrica principal */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {protocol.metric}
        </p>
        <p
          className={cn(
            "text-2xl font-bold tabular-nums leading-none mt-1",
            isComplete ? "text-primary" : "text-muted-foreground/60"
          )}
        >
          {isComplete && result
            ? `${result.value.toFixed(2).replace(".", ",")}${result.unit}`
            : "—"}
        </p>
      </div>

      {/* Status badge + descrição */}
      <div className="space-y-1">
        {isComplete ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-primary">
            <CheckCircle2 className="size-3" />
            Completo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-orange-500">
            <AlertTriangle className="size-3" />
            Faltam dados
          </span>
        )}
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {isComplete
            ? "Protocolo calculado com sucesso."
            : `Faltando: ${(result?.missing ?? []).join(", ") || "campos obrigatórios"}.`}
        </p>
      </div>

      {/* Drawer com citação + descrição */}
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        srOnlyTitle={`Sobre o protocolo ${protocol.name}`}
      >
        <div className="px-1 pt-2 pb-1 space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              {protocol.name}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground italic">
            {protocol.citation}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/40 pl-3">
            {protocol.description}
          </p>
        </div>
      </BottomSheet>
    </div>
  );
}
