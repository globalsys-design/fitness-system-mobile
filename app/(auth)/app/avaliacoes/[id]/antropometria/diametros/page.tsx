"use client";

/**
 * Diâmetros Ósseos — captura de diâmetros antropométricos com paquímetro.
 *
 * Reusa o ParameterCard (slider + stepper +/- + guia técnico) com
 * `zones` omitidas e `secondaryUnit` ativado para conversão mm → cm
 * em tempo real abaixo do input.
 *
 * **Unidade primária: mm** (natural do paquímetro). Persistência em cm
 * pra preservar dados antigos e manter consistência com perímetros —
 * conversão acontece no boundary do `/api/assessments/[id]/anthropometry`.
 *
 * Layout (alinhado ao padrão Globalsys 2026-04-30):
 *  - Header com instruções + contador X/N preenchidos
 *  - Seção: Diâmetros do Tronco (5 medidas)
 *  - Seção: Diâmetros das Articulações (4 medidas)
 *  - Observações livres
 *  - Salvar
 */

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Maximize2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { ParameterCard } from "@/components/assessments/parameter-card";
import { guideImages } from "@/components/assessments/guide-images";
import {
  DIAMETRO_TRONCO,
  DIAMETRO_ARTICULACOES,
  countFilled,
  getNumeric,
  type DiametroValues,
} from "@/lib/data/diametros";

export default function DiametrosPage() {
  const params = useParams();
  const assessmentId = params.id as string;

  const [values, setValues] = useState<DiametroValues>({});
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  /* Carregamento — converte cm (storage) → mm (state) */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${assessmentId}/anthropometry`);
        if (res.ok) {
          const data = await res.json();
          if (data?.diameters && typeof data.diameters === "object") {
            const cmStored = data.diameters as Record<string, string>;
            const mmState: DiametroValues = {};
            for (const [key, cmRaw] of Object.entries(cmStored)) {
              if (typeof cmRaw !== "string" || cmRaw.trim() === "") continue;
              const cmNum = Number(cmRaw.replace(",", "."));
              if (Number.isFinite(cmNum)) {
                mmState[key] = String(Math.round(cmNum * 10));
              }
            }
            setValues(mmState);
          }
          if (data?.notes && typeof data.notes === "string") {
            setNotes(data.notes);
          }
        }
      } catch {
        /* empty */
      } finally {
        setIsFetching(false);
      }
    }
    load();
  }, [assessmentId]);

  /* Handlers — state em mm */
  function handleChange(key: string, raw: string) {
    setValues((v) => ({ ...v, [key]: raw }));
    setSaved(false);
  }

  function handleStep(key: string, dir: 1 | -1) {
    const current = getNumeric(values, key);
    const next = Math.round((current ?? 0) + dir * 1);
    handleChange(key, String(next));
  }

  /* Cálculo de progresso */
  const { filled, total } = useMemo(() => countFilled(values), [values]);

  /* Save — converte mm (state) → cm (storage) */
  async function handleSave() {
    setIsLoading(true);
    try {
      const cmPayload: Record<string, string> = {};
      for (const [key, mmRaw] of Object.entries(values)) {
        if (typeof mmRaw !== "string" || mmRaw.trim() === "") continue;
        const mmNum = Number(mmRaw.replace(",", "."));
        if (Number.isFinite(mmNum)) {
          cmPayload[key] = (mmNum / 10).toFixed(2);
        }
      }
      await fetch(`/api/assessments/${assessmentId}/anthropometry`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diameters: cmPayload,
          notes: notes.trim() || undefined,
        }),
      });
      toast.success("Diâmetros salvos!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Diâmetros" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Diâmetros" showBack>
      <div className="p-4 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Maximize2 className="size-6 text-primary shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">
              Diâmetros Ósseos
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Medidas com paquímetro em mm · conversão automática para cm · {filled}/{total} preenchidos
            </p>
          </div>
        </div>

        {/* Diâmetros do Tronco */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
            Diâmetros do Tronco
          </h2>
          {DIAMETRO_TRONCO.map((param, idx) => {
            const guide = guideImages[param.key];
            return (
              <ParameterCard
                key={param.key}
                param={param}
                raw={values[param.key] ?? ""}
                onChange={(raw) => handleChange(param.key, raw)}
                onStep={(dir) => handleStep(param.key, dir)}
                index={idx}
                guideImage={guide?.image}
                guideTip={guide?.tip}
                secondaryUnit={{ unit: "cm", factor: 0.1, decimals: 2 }}
              />
            );
          })}
        </section>

        {/* Diâmetros das Articulações */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
            Diâmetros das Articulações
          </h2>
          {DIAMETRO_ARTICULACOES.map((param, idx) => {
            const guide = guideImages[param.key];
            return (
              <ParameterCard
                key={param.key}
                param={param}
                raw={values[param.key] ?? ""}
                onChange={(raw) => handleChange(param.key, raw)}
                onStep={(dir) => handleStep(param.key, dir)}
                index={idx}
                guideImage={guide?.image}
                guideTip={guide?.tip}
                secondaryUnit={{ unit: "cm", factor: 0.1, decimals: 2 }}
              />
            );
          })}
        </section>

        {/* Observações */}
        <section className="flex flex-col gap-2">
          <Label
            htmlFor="diametros-notes"
            className="text-sm font-bold uppercase tracking-wide text-foreground"
          >
            Observações
          </Label>
          <textarea
            id="diametros-notes"
            placeholder="Adicione observações relevantes sobre os resultados obtidos"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={[
              "w-full rounded-xl border border-border bg-card",
              "px-3 py-3 text-sm text-foreground",
              "placeholder:text-muted-foreground/70",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "min-h-[6rem] resize-none",
            ].join(" ")}
          />
        </section>

        {/* Save */}
        <Button
          className="w-full h-12"
          onClick={handleSave}
          disabled={isLoading || filled === 0}
        >
          {isLoading ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="size-4 mr-2" />
          ) : null}
          {saved ? "Salvo" : "Salvar diâmetros"}
        </Button>
      </div>
    </MobileLayout>
  );
}
