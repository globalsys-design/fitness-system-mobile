"use client";

/**
 * Perímetros Corporais — captura de circunferências antropométricas.
 *
 * Reusa o ParameterCard de Parâmetros Basais (mesmo comportamento de
 * input + stepper +/- + slider drag) com `zones` omitidas (perímetros
 * não têm classificação clínica universal) e `guideImage`/`guideTip`
 * habilitados (modal de técnica de medição).
 *
 * Layout (alinhado ao protótipo Globalsys 2026-04-29):
 *  - Header com instruções
 *  - Seção: Medidas Superiores (singletons)
 *  - Seção: Medidas dos Braços (paired D/E + assimetria)
 *  - Seção: Medidas Inferiores (paired D/E + assimetria)
 *  - Seção: Protocolos antropométricos derivados (cards read-only)
 *  - Observações livres
 *  - Salvar
 */

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Ruler, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { ParameterCard } from "@/components/assessments/parameter-card";
import { PairedParameterCard } from "@/components/assessments/perimetros/paired-parameter-card";
import { ProtocolCard } from "@/components/assessments/perimetros/protocol-card";
import { guideImages } from "@/components/assessments/guide-images";
import {
  PERIMETRO_SUPERIORES,
  PERIMETRO_BRACOS,
  PERIMETRO_INFERIORES,
  countFilled,
  getNumeric,
  type PerimetroValues,
} from "@/lib/data/perimetros";
import {
  computeAllProtocols,
  type ProfileInputs,
} from "@/lib/calculations/perimetros-protocols";

export default function PerimetrosPage() {
  const params = useParams();
  const assessmentId = params.id as string;

  const [values, setValues] = useState<PerimetroValues>({});
  const [notes, setNotes] = useState("");
  const [profile, setProfile] = useState<ProfileInputs>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  /* Carregamento */
  useEffect(() => {
    async function load() {
      try {
        const [anthroRes, anamRes] = await Promise.all([
          fetch(`/api/assessments/${assessmentId}/anthropometry`),
          fetch(`/api/assessments/${assessmentId}/anamnesis`),
        ]);

        if (anthroRes.ok) {
          const data = await anthroRes.json();
          if (data?.perimeters && typeof data.perimeters === "object") {
            // Aceita tanto formato novo (com chaves _d/_e) quanto legado
            setValues(data.perimeters as PerimetroValues);
          }
          if (data?.height != null) {
            setProfile((p) => ({ ...p, heightCm: data.height as number }));
          }
          if (data?.notes && typeof data.notes === "string") {
            setNotes(data.notes);
          }
        }

        if (anamRes.ok) {
          const data = await anamRes.json();
          // Gênero/idade do cliente para protocolos
          const gender = data?.client?.gender;
          if (gender === "M" || gender === "F") {
            setProfile((p) => ({ ...p, gender }));
          }
          const birth = data?.client?.birthDate;
          if (birth) {
            const d = new Date(birth);
            if (!Number.isNaN(d.getTime())) {
              const age = Math.floor(
                (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000)
              );
              setProfile((p) => ({ ...p, age }));
            }
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

  /* Handlers */
  function handleChange(key: string, raw: string) {
    setValues((v) => ({ ...v, [key]: raw }));
    setSaved(false);
  }

  function handleStep(key: string, dir: 1 | -1) {
    // Usa step base de 0.5 e clamp via campos da lib (mesmo comportamento)
    const current = getNumeric(values, key);
    const next = (current ?? 0) + dir * 0.5;
    handleChange(key, next.toFixed(1).replace(".", ","));
  }

  /* Cálculo de progresso */
  const { filled, total } = useMemo(() => countFilled(values), [values]);

  /* Protocolos calculados */
  const protocols = useMemo(
    () => computeAllProtocols(values, profile),
    [values, profile]
  );

  /* Save */
  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${assessmentId}/anthropometry`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          perimeters: values,
          notes: notes.trim() || undefined,
        }),
      });
      toast.success("Perímetros salvos!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Perímetros" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Perímetros" showBack>
      <div className="p-4 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Ruler className="size-6 text-primary shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">
              Perímetros Corporais
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Circunferências em centímetros · {filled}/{total} preenchidos
            </p>
          </div>
        </div>

        {/* Medidas Superiores */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
            Medidas Superiores
          </h2>
          {PERIMETRO_SUPERIORES.map((param, idx) => {
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
              />
            );
          })}
        </section>

        {/* Medidas dos Braços */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
            Medidas dos Braços
          </h2>
          {PERIMETRO_BRACOS.map((param, idx) => (
            <PairedParameterCard
              key={param.key}
              param={param}
              values={values}
              onChange={handleChange}
              onStep={handleStep}
              index={idx}
            />
          ))}
        </section>

        {/* Medidas Inferiores */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
            Medidas Inferiores
          </h2>
          {PERIMETRO_INFERIORES.map((param, idx) => (
            <PairedParameterCard
              key={param.key}
              param={param}
              values={values}
              onChange={handleChange}
              onStep={handleStep}
              index={idx}
            />
          ))}
        </section>

        {/* Protocolos derivados */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
            Protocolos Antropométricos Derivados
          </h2>
          <p className="text-xs text-muted-foreground -mt-1">
            Cálculos automáticos a partir das circunferências preenchidas + perfil do cliente.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {protocols.map((p, idx) => (
              <ProtocolCard
                key={p.protocol.id}
                protocol={p.protocol}
                result={p.result}
                index={idx}
              />
            ))}
          </div>
        </section>

        {/* Observações */}
        <section className="flex flex-col gap-2">
          <Label
            htmlFor="perimetros-notes"
            className="text-sm font-bold uppercase tracking-wide text-foreground"
          >
            Observações
          </Label>
          <textarea
            id="perimetros-notes"
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
          {saved ? "Salvo" : "Salvar perímetros"}
        </Button>
      </div>
    </MobileLayout>
  );
}
