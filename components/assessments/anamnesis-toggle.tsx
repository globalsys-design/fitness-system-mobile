"use client";

import { cn } from "@/lib/utils";

interface AnamnesisToggleProps {
  question: string;
  questionNumber: number;
  value: boolean | null;
  onChange: (val: boolean) => void;
}

export function AnamnesisToggle({
  question,
  questionNumber,
  value,
  onChange,
}: AnamnesisToggleProps) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card">
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
          {questionNumber}
        </span>
        <p className="text-sm text-foreground leading-relaxed">{question}</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "flex-1 h-12 rounded-xl text-sm font-semibold transition-colors active:scale-[0.98]",
            value === true
              ? "bg-destructive text-destructive-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "flex-1 h-12 rounded-xl text-sm font-semibold transition-colors active:scale-[0.98]",
            value === false
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          Não
        </button>
      </div>
    </div>
  );
}
