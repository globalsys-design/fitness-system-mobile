"use client";

/**
 * ParqHistorySheet — BottomSheet "Histórico de avaliações PAR-Q+".
 *
 * Lista as avaliações anteriores (arquivadas) em ordem cronológica
 * decrescente (mais recente primeiro). Cada item mostra data, nível de
 * risco e permite expandir para revisar todas as respostas daquela versão.
 */

import { useState } from "react";
import { History, ChevronRight } from "lucide-react";

import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ParqPlusHistoryEntry } from "@/lib/data/parq-plus";
import { ParqAnswersSheet } from "./parq-answers-sheet";

interface ParqHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: ParqPlusHistoryEntry[];
}

export function ParqHistorySheet({
  open,
  onOpenChange,
  entries,
}: ParqHistorySheetProps) {
  const [selected, setSelected] = useState<ParqPlusHistoryEntry | null>(null);

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        srOnlyTitle="Histórico de avaliações PAR-Q+"
        srOnlyDescription="Lista das versões anteriores arquivadas da avaliação PAR-Q+."
      >
        <div className="flex items-center gap-3 px-5 pt-1 pb-3 border-b border-border/60">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <History className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              Histórico de avaliações
            </h2>
            <p className="text-xs text-muted-foreground">
              {entries.length}{" "}
              {entries.length === 1 ? "versão anterior" : "versões anteriores"}
            </p>
          </div>
        </div>

        <ScrollArea className="max-h-[70dvh]">
          <div className="px-5 py-4 space-y-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {entries.map((entry, i) => {
              const version = entries.length - i;
              return (
                <button
                  key={`${entry.archivedAt}-${i}`}
                  type="button"
                  onClick={() => setSelected(entry)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl",
                    "border border-border bg-card hover:bg-muted/40",
                    "transition-colors text-left"
                  )}
                >
                  <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    v{version}
                  </span>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-medium text-foreground truncate">
                      {formatDate(entry.completedAt ?? entry.archivedAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Arquivada em {formatDate(entry.archivedAt)}
                    </p>
                  </div>
                  <RiskBadge risk={entry.riskLevel} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </BottomSheet>

      {selected && (
        <ParqAnswersSheet
          open={!!selected}
          onOpenChange={(o) => !o && setSelected(null)}
          answers={selected.answers ?? {}}
          followUpOptions={selected.followUpOptions ?? {}}
          followUpText={selected.followUpText ?? {}}
        />
      )}
    </>
  );
}

function RiskBadge({ risk }: { risk?: "low" | "moderate" | "high" }) {
  if (!risk) return null;
  const config = {
    low: { label: "Baixo", cls: "bg-primary/10 text-primary" },
    moderate: {
      label: "Moderado",
      cls: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    },
    high: { label: "Alto", cls: "bg-destructive/10 text-destructive" },
  }[risk];
  return (
    <span
      className={cn(
        "shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        config.cls
      )}
    >
      {config.label}
    </span>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
