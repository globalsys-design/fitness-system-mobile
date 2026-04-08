"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Plus, Dumbbell, Wind, X } from "lucide-react";
import { MUSCLE_GROUPS } from "@/lib/constants/exercises";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { FAB } from "@/components/mobile/fab";
import { ExerciseSearch } from "./exercise-search";
import { NewExerciseFlow } from "./new-exercise-flow";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  videoUrl: string | null;
  thumbnail: string | null;
}

interface ExerciseCatalogProps {
  initialExercises: Exercise[];
}

// ── Component ────────────────────────────────────────────────────────────────
export function ExerciseCatalog({ initialExercises }: ExerciseCatalogProps) {
  const [exercises] = useState<Exercise[]>(initialExercises);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Filtered exercises
  const filtered = useMemo(() => {
    if (selectedGroups.length === 0) return exercises;
    return exercises.filter((e) =>
      e.muscleGroups.some((g) => selectedGroups.includes(g))
    );
  }, [exercises, selectedGroups]);

  const toggleGroup = (group: string) => {
    setSelectedGroups((prev) =>
      prev.includes(group)
        ? prev.filter((g) => g !== group)
        : [...prev, group]
    );
  };

  const clearFilters = () => setSelectedGroups([]);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* ── Search Bar + Filter ──────────────────────────────────────── */}
        <div className="shrink-0 px-4 pt-3 pb-2 flex gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex-1 flex items-center gap-3 h-12 bg-muted/50 rounded-xl px-4 active:bg-muted transition-colors"
          >
            <Search className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Buscar exercicio...</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className={cn(
              "flex items-center justify-center size-12 rounded-xl transition-colors",
              selectedGroups.length > 0
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground active:bg-muted"
            )}
          >
            <SlidersHorizontal className="size-5" />
          </button>
        </div>

        {/* Active filter chips */}
        {selectedGroups.length > 0 && (
          <div className="shrink-0 px-4 pb-2 flex gap-2 flex-wrap">
            {selectedGroups.map((g) => {
              const label = MUSCLE_GROUPS.find((m) => m.value === g)?.label ?? g;
              return (
                <button
                  key={g}
                  onClick={() => toggleGroup(g)}
                  className="flex items-center gap-1 h-8 px-3 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  {label}
                  <X className="size-3" />
                </button>
              );
            })}
            <button
              onClick={clearFilters}
              className="h-8 px-3 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpar
            </button>
          </div>
        )}

        {/* ── Exercise List ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-32">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Dumbbell className="size-12 text-muted-foreground/30" />
              <div className="text-center">
                <p className="font-semibold text-foreground">
                  {exercises.length === 0
                    ? "Nenhum exercicio cadastrado"
                    : "Nenhum resultado"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {exercises.length === 0
                    ? "Toque no + para criar o primeiro"
                    : "Tente alterar os filtros"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              {filtered.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center gap-4 p-4 h-20 rounded-2xl border border-border bg-card active:bg-accent transition-colors"
                >
                  {/* Thumbnail placeholder */}
                  <div
                    className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center shrink-0",
                      exercise.category === "STRENGTH"
                        ? "bg-primary/10"
                        : "bg-orange-500/10"
                    )}
                  >
                    {exercise.category === "STRENGTH" ? (
                      <Dumbbell className="size-6 text-primary" />
                    ) : (
                      <Wind className="size-6 text-orange-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm leading-tight truncate">
                      {exercise.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {exercise.muscleGroups
                        .map((g) => MUSCLE_GROUPS.find((m) => m.value === g)?.label ?? g)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── FAB ────────────────────────────────────────────────────────── */}
      <FAB
        icon={Plus}
        onClick={() => setCreateOpen(true)}
        label="Novo exercicio"
      />

      {/* ── Filter Drawer ──────────────────────────────────────────────── */}
      <BottomSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filtrar por grupo muscular"
      >
        <div className="flex flex-col gap-2 pb-4">
          {MUSCLE_GROUPS.map((group) => {
            const isSelected = selectedGroups.includes(group.value);
            return (
              <button
                key={group.value}
                type="button"
                onClick={() => toggleGroup(group.value)}
                className={cn(
                  "flex items-center justify-between min-h-[3rem] px-4 py-3 rounded-xl transition-all",
                  isSelected
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-muted/30 border-2 border-transparent"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {group.label}
                </span>
                <div
                  className={cn(
                    "size-6 rounded-md flex items-center justify-center transition-all",
                    isSelected
                      ? "bg-primary"
                      : "border-2 border-border"
                  )}
                >
                  {isSelected && (
                    <svg className="size-4 text-primary-foreground" viewBox="0 0 16 16" fill="none">
                      <path d="M3.5 8.5L6.5 11.5L12.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Apply */}
        <div
          className="sticky bottom-0 bg-background border-t border-border/50 p-4 -mx-4 z-10"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={() => setFilterOpen(false)}
            className="w-full h-14 rounded-full font-bold text-lg bg-primary text-primary-foreground active:scale-[0.97] transition-all shadow-lg shadow-primary/25"
          >
            Aplicar filtros
            {selectedGroups.length > 0 && ` (${selectedGroups.length})`}
          </button>
        </div>
      </BottomSheet>

      {/* ── Fullscreen Search ──────────────────────────────────────────── */}
      {searchOpen && (
        <ExerciseSearch
          exercises={exercises}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {/* ── Create Exercise OTPP ───────────────────────────────────────── */}
      {createOpen && (
        <NewExerciseFlow onClose={() => setCreateOpen(false)} />
      )}
    </>
  );
}
