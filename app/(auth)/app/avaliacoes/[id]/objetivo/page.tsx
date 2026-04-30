"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ObjectiveRatingCard } from "@/components/ui/objective-rating-card";
import { ObjectiveView } from "@/components/assessments/objective-view";
import { cn } from "@/lib/utils";

/**
 * Categorias dos objetivos, espelhando a organização do Backoffice.
 * A chave persistida em `goals` é o label do item (ex.: "Hipertrofia"),
 * mantendo compatibilidade com relatórios/legacy.
 */
const OBJECTIVE_CATEGORIES: { title: string; items: string[] }[] = [
  {
    title: "Performance e Condicionamento",
    items: ["Condicionamento físico", "Competições", "Hipertrofia"],
  },
  {
    title: "Estética e Composição Corporal",
    items: ["Emagrecimento", "Estética", "Autoestima"],
  },
  {
    title: "Saúde e Bem-estar",
    items: ["Orientação médica", "Saúde", "Desestresse"],
  },
  {
    title: "Reabilitação e Prevenção",
    items: ["Reabilitação", "Cuidado postural"],
  },
  {
    title: "Lazer e Social",
    items: ["Recreação"],
  },
];

const WEEKDAYS = [
  { key: "sun", label: "Dom" },
  { key: "mon", label: "Seg" },
  { key: "tue", label: "Ter" },
  { key: "wed", label: "Qua" },
  { key: "thu", label: "Qui" },
  { key: "fri", label: "Sex" },
  { key: "sat", label: "Sáb" },
];

const DURATIONS = ["15min", "30min", "45min", "1h", "1h30", "2h", "Outro"];
const ALL_OBJECTIVES = OBJECTIVE_CATEGORIES.flatMap((c) => c.items);

export default function ObjetivoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  // `goals`: Record<objectiveLabel, 0..4> — 0 significa "não relevante".
  const [goals, setGoals] = useState<Record<string, number>>({});
  const [availability, setAvailability] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  // Força modo edição localmente (pelo botão de lápis na view).
  const [forceEdit, setForceEdit] = useState(false);

  const isEditQuery = searchParams.get("mode") === "edit";
  const hasAnyObjective = Object.values(goals).some((v) => v > 0);
  const hasAnyAvailability = Object.values(availability).some(
    (v) => v !== null && v !== undefined
  );
  const hasData = hasAnyObjective || hasAnyAvailability;
  const isViewMode = hasData && !isEditQuery && !forceEdit;

  // Easter-egg flag — só dispara uma vez por montagem.
  const ambitiousFired = useRef(false);

  useEffect(() => {
    async function loadObjective() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/objective`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (data.goals) {
              if (Array.isArray(data.goals)) {
                // Legacy: string[] (toggle simples) → cada selecionado vira 2 (Moderado).
                const next: Record<string, number> = {};
                for (const g of data.goals as string[]) next[g] = 2;
                setGoals(next);
              } else if (typeof data.goals === "object") {
                // Formato novo (ou antigo com números 0..4): usa direto, clampando.
                const next: Record<string, number> = {};
                for (const [k, v] of Object.entries(
                  data.goals as Record<string, unknown>
                )) {
                  const n = typeof v === "number" ? v : Number(v);
                  if (!isNaN(n)) next[k] = Math.max(0, Math.min(4, Math.round(n)));
                }
                setGoals(next);
              }
            }
            if (data.availability)
              setAvailability(data.availability as Record<string, string | null>);
          }
        }
      } catch {
        // silently ignore — form starts empty
      } finally {
        setIsFetching(false);
      }
    }
    loadObjective();
  }, [params.id]);

  // Totais por categoria para o badge "X/N" (spell: contador vivo).
  const categoryCounts = useMemo(() => {
    return OBJECTIVE_CATEGORIES.map((cat) => ({
      title: cat.title,
      filled: cat.items.filter((i) => (goals[i] ?? 0) > 0).length,
      total: cat.items.length,
    }));
  }, [goals]);

  const totalFilled = useMemo(
    () => Object.values(goals).filter((v) => v > 0).length,
    [goals]
  );

  function setGoalRating(obj: string, rating: number) {
    setGoals((prev) => {
      const next = { ...prev };
      if (rating === 0) {
        delete next[obj];
      } else {
        next[obj] = rating;
      }

      // Easter egg: todos os 12 objetivos com rating 4. Dispara uma vez.
      const allMax =
        ALL_OBJECTIVES.every((label) => (next[label] ?? 0) === 4) &&
        !ambitiousFired.current;
      if (allMax) {
        ambitiousFired.current = true;
        toast.success("Cliente ambicioso! Todas as metas no máximo.", {
          icon: "🔥",
          duration: 3500,
        });
      }
      return next;
    });
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/objective`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals, availability }),
      });
      toast.success("Objetivo salvo!");
      // Após salvar, volta ao modo visualização — sai do ?mode=edit se estiver.
      setForceEdit(false);
      if (isEditQuery) {
        router.replace(`/app/avaliacoes/${params.id}/objetivo`);
      }
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Objetivo e Disponibilidade" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  if (isViewMode) {
    return (
      <MobileLayout title="Objetivo e Disponibilidade" showBack>
        <ObjectiveView
          categories={OBJECTIVE_CATEGORIES}
          goals={goals}
          availability={availability}
          onEdit={() => setForceEdit(true)}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Objetivo e Disponibilidade" showBack>
      <div className="p-4 flex flex-col gap-6">
        {/* Objetivos — escala 0 a 4 por item, agrupados por categoria */}
        <div>
          <div className="flex items-end justify-between gap-3 mb-1">
            <h3 className="font-semibold text-foreground text-sm">
              Objetivos do cliente
            </h3>
            {/* Contador global: remonta no key pra pulsar a cada avanço. */}
            {totalFilled > 0 && (
              <span
                key={totalFilled}
                className="text-[11px] font-semibold text-primary flex items-center gap-1 animate-in zoom-in-95 fade-in duration-200"
              >
                <Sparkles className="size-3" />
                {totalFilled} de {ALL_OBJECTIVES.length}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Avalie a relevância de cada objetivo de 0 (não relevante) a 4 (muito alto)
          </p>

          <div className="flex flex-col gap-5">
            {OBJECTIVE_CATEGORIES.map((cat, idx) => {
              const { filled, total } = categoryCounts[idx];
              return (
                <div
                  key={cat.title}
                  className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
                  style={{ animationDelay: `${idx * 70}ms` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {cat.title}
                    </h4>
                    {/* Badge de progresso da categoria — cor vira primary quando completa */}
                    <span
                      key={`${cat.title}-${filled}`}
                      className={cn(
                        "text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full border transition-colors duration-300",
                        filled === 0
                          ? "text-muted-foreground/70 border-border bg-transparent"
                          : filled === total
                            ? "text-primary-foreground border-primary bg-primary animate-in zoom-in-95 duration-200"
                            : "text-primary border-primary/30 bg-primary/10"
                      )}
                    >
                      {filled}/{total}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {cat.items.map((item) => (
                      <ObjectiveRatingCard
                        key={item}
                        label={item}
                        value={goals[item] ?? 0}
                        onChange={(v) => setGoalRating(item, v)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disponibilidade */}
        <div>
          <h3 className="font-semibold text-foreground text-sm mb-3">
            Disponibilidade semanal
          </h3>
          <div className="flex flex-col gap-2">
            {WEEKDAYS.map((day, dayIdx) => {
              const isAvailable =
                availability[day.key] !== undefined &&
                availability[day.key] !== null;
              return (
                <Card
                  key={day.key}
                  className={cn(
                    "transition-[background-color,border-color] duration-300",
                    isAvailable && "bg-primary/5 border-primary/30"
                  )}
                  style={{ animationDelay: `${dayIdx * 40}ms` }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <Label
                        className={cn(
                          "text-sm font-medium transition-colors",
                          isAvailable && "text-primary"
                        )}
                      >
                        {day.label}
                      </Label>
                      <Switch
                        checked={isAvailable}
                        onCheckedChange={(checked) =>
                          setAvailability((a) => ({
                            ...a,
                            [day.key]: checked ? "1h" : null,
                          }))
                        }
                      />
                    </div>
                    {isAvailable && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {DURATIONS.map((dur, i) => {
                          const active = availability[day.key] === dur;
                          return (
                            <button
                              key={dur}
                              onClick={() =>
                                setAvailability((a) => ({ ...a, [day.key]: dur }))
                              }
                              style={{ animationDelay: `${i * 25}ms` }}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium",
                                "transition-[transform,background-color,color] duration-150 active:scale-[0.94]",
                                "animate-in fade-in slide-in-from-top-1 duration-300 fill-mode-both",
                                active
                                  ? "bg-primary text-primary-foreground shadow-[0_0_0_3px_var(--color-primary)/15]"
                                  : "bg-muted text-muted-foreground hover:bg-accent"
                              )}
                            >
                              {dur}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Button
          className={cn(
            "w-full transition-transform duration-150 active:scale-[0.98]",
            isLoading && "opacity-80"
          )}
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Salvar objetivo e disponibilidade
        </Button>
      </div>
    </MobileLayout>
  );
}
