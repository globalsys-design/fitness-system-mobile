"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowLeft, Search, Dumbbell, Wind } from "lucide-react";
import { MUSCLE_GROUPS } from "@/lib/constants/exercises";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
}

interface ExerciseSearchProps {
  exercises: Exercise[];
  onClose: () => void;
  onSelect?: (exercise: Exercise) => void;
}

export function ExerciseSearch({ exercises, onClose, onSelect }: ExerciseSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  // Autofocus input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  // Filtered results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return exercises.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.muscleGroups.some(
          (g) =>
            MUSCLE_GROUPS.find((m) => m.value === g)
              ?.label.toLowerCase()
              .includes(q)
        )
    );
  }, [query, exercises]);

  const showRecent = query.trim().length === 0;

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col" style={{ height: "100dvh" }}>
      {/* ── Search Header ──────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2 border-b border-border">
        <button
          type="button"
          onClick={onClose}
          className="size-10 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors active:scale-90 shrink-0"
        >
          <ArrowLeft className="size-5 text-foreground" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar exercicio ou grupo muscular..."
            className="w-full h-12 bg-muted/40 rounded-xl pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
      </div>

      {/* ── Results ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-8">
        {showRecent ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Search className="size-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground text-center">
              Digite para buscar exercicios
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Dumbbell className="size-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground text-center">
              Nenhum exercicio encontrado
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {results.length} resultado{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => {
                  onSelect?.(exercise);
                  onClose();
                }}
                className="flex items-center gap-3 p-3 rounded-xl active:bg-muted transition-colors text-left w-full"
              >
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0",
                    exercise.category === "STRENGTH"
                      ? "bg-primary/10"
                      : "bg-orange-500/10"
                  )}
                >
                  {exercise.category === "STRENGTH" ? (
                    <Dumbbell className="size-5 text-primary" />
                  ) : (
                    <Wind className="size-5 text-orange-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {exercise.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {exercise.muscleGroups
                      .map((g) => MUSCLE_GROUPS.find((m) => m.value === g)?.label ?? g)
                      .join(", ")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
