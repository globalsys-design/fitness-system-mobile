"use client";

/**
 * Parâmetros Basais — captura de sinais vitais com inteligência clínica.
 *
 * Design Spells (mobile + a11y first):
 *
 *  ✦ Zone-aware gauge
 *     Cada parâmetro tem faixas de referência (baixo / normal / elevado / alto).
 *     Uma barra de 3–4 zonas é desenhada abaixo do input, com um marcador
 *     (ponteiro) que desliza pra posição do valor atual em 400ms. GPU-only.
 *
 *  ✦ Status badge reativo
 *     Badge "Normal/Elevado/Alto" aparece com zoom-in quando o valor cai em
 *     uma zona. Cor do badge = cor da zona. `aria-live="polite"` para leitor
 *     de tela anunciar mudanças.
 *
 *  ✦ Stepper de toque amplo (+ / −)
 *     Botões 44x44 pra fine-tune sem teclado. Respeita `prefers-reduced-motion`.
 *
 *  ✦ BP Pair (pressão)
 *     Quando sistólica + diastólica estão ambos preenchidos, aparece uma pill
 *     compacta "120/80" embaixo do par com classificação combinada.
 *
 *  ✦ Progress chip no topo
 *     "X de 6 preenchidos" com Sparkles twinkle ao aproximar 100%.
 *
 *  ✦ Save button adaptativo
 *     - Todos vazios → disabled em opacity 60.
 *     - Algum preenchido + anormal → botão em primary com anel de alerta sutil.
 *     - Todos preenchidos e normais → shimmer sweep no botão, CTA "pronto".
 *
 *  ✦ Load + skeleton
 *     Carrega valores existentes da API no mount. Skeletons enquanto carrega
 *     (nunca tela em branco, conforme CLAUDE.md).
 *
 *  ✦ Acessibilidade
 *     - aria-describedby liga input → texto de referência.
 *     - aria-live nas badges.
 *     - inputMode="decimal" e pattern pra teclado numérico.
 *     - Touch targets ≥ 44px.
 *     - `prefers-reduced-motion` desliga keyframes decorativos.
 */

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Activity,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { cn } from "@/lib/utils";
import { ParametrosBasaisView } from "@/components/assessments/parametros-basais/parametros-basais-view";
import { ParameterCard } from "@/components/assessments/parameter-card";
import {
  BASAL_PARAMS,
  BASAL_TONE_CLASSES,
  classifyBloodPressure,
  parseBasalNumber,
  zoneFor,
  type BasalParam,
  type BasalTone,
} from "@/lib/data/parametros-basais";

// Tipos e dados clínicos vêm de @/lib/data/parametros-basais
// Componentes (ParameterCard, StepperButton, ParameterGauge) vêm de
// @/components/assessments/parameter-card


// ─── Página ─────────────────────────────────────────────────────────────

export default function ParametrosBasaisPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = params.id as string;

  const [values, setValues] = useState<Record<string, string>>({});
  const [savedValues, setSavedValues] = useState<Record<string, string> | null>(
    null
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [forceEdit, setForceEdit] = useState(false);
  const isEditQuery = searchParams.get("mode") === "edit";

  // Carrega valores existentes.
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/anamnesis`);
        if (res.ok) {
          const data = await res.json();
          const basal = data?.basalParameters ?? data?.anamnesis?.basalParameters;
          if (basal && typeof basal === "object") {
            const next: Record<string, string> = {};
            for (const p of BASAL_PARAMS) {
              const v = basal[p.key];
              if (v !== null && v !== undefined && v !== "") {
                next[p.key] = String(v);
              }
            }
            setValues(next);
            if (Object.keys(next).length > 0) {
              setSavedValues(next);
              setSavedAt(
                data?.basalParametersAt ?? data?.updatedAt ?? null
              );
            }
          }
        }
      } catch {
        // silently ignore — form starts empty
      } finally {
        setIsFetching(false);
      }
    }
    load();
  }, [params.id]);

  const numericValues = useMemo(() => {
    const out: Record<string, number | null> = {};
    for (const p of BASAL_PARAMS) out[p.key] = parseBasalNumber(values[p.key] ?? "");
    return out;
  }, [values]);

  const filledCount = Object.values(numericValues).filter((v) => v !== null).length;
  const totalCount = BASAL_PARAMS.length;
  const anyAbnormal = BASAL_PARAMS.some((p) => {
    const v = numericValues[p.key];
    if (v === null) return false;
    const z = zoneFor(v, p.zones);
    return z?.tone === "warn" || z?.tone === "bad";
  });
  const allFilledAndNormal =
    filledCount === totalCount &&
    BASAL_PARAMS.every((p) => {
      const v = numericValues[p.key];
      if (v === null) return false;
      return zoneFor(v, p.zones)?.tone === "ok";
    });

  function setValue(key: string, raw: string) {
    setValues((v) => ({ ...v, [key]: raw }));
  }

  function step(param: BasalParam, dir: 1 | -1) {
    const current = numericValues[param.key];
    const stepSize = param.step ?? 1;
    const decimals = param.decimals ?? 0;
    // Se não tem valor, começa no meio da zona "ok" para orientar.
    const base = current ?? Math.round((param.scaleMin + param.scaleMax) / 2);
    const next = Math.max(
      param.scaleMin,
      Math.min(param.scaleMax, base + dir * stepSize)
    );
    setValue(param.key, next.toFixed(decimals));
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      // Só envia numéricos válidos — backend não se preocupa com strings vazias.
      const payload: Record<string, number> = {};
      for (const p of BASAL_PARAMS) {
        const n = numericValues[p.key];
        if (n !== null) payload[p.key] = n;
      }
      const res = await fetch(`/api/assessments/${params.id}/anamnesis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ basalParameters: payload }),
      });
      if (!res.ok) throw new Error();
      toast.success("Parâmetros salvos!");
      setSavedValues(values);
      setSavedAt(new Date().toISOString());
      setForceEdit(false);
      if (isEditQuery) {
        router.replace(
          `/app/avaliacoes/${assessmentId}/anamnese/parametros-basais`
        );
      }
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit() {
    setForceEdit(true);
  }

  function handleStartNew() {
    setValues({});
    setForceEdit(true);
  }

  if (isFetching) {
    return (
      <MobileLayout title="Parâmetros Basais" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  /* Modo leitura: há dados salvos e usuário não pediu edição. */
  const hasSavedData = savedValues != null && Object.keys(savedValues).length > 0;
  const isViewMode = hasSavedData && !isEditQuery && !forceEdit;

  if (isViewMode && savedValues) {
    return (
      <MobileLayout title="Parâmetros Basais" showBack>
        <ParametrosBasaisView
          values={savedValues}
          completedAt={savedAt}
          onEdit={handleEdit}
          onStartNew={handleStartNew}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Parâmetros Basais" showBack>
      <div className="p-4 flex flex-col gap-4">
        {/* Progress chip no topo */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Preencha os sinais vitais de repouso do cliente.
          </p>
          {filledCount > 0 && (
            <span
              key={filledCount}
              className={cn(
                "shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full",
                "text-[11px] font-semibold tabular-nums border",
                "animate-in zoom-in-95 fade-in duration-200",
                filledCount === totalCount
                  ? "text-primary-foreground bg-primary border-primary"
                  : "text-primary bg-primary/10 border-primary/30"
              )}
              aria-live="polite"
            >
              <Sparkles
                className={cn(
                  "size-3",
                  filledCount === totalCount ? "" : "text-primary"
                )}
                style={
                  filledCount >= totalCount - 1
                    ? { animation: "twinkle 2.4s ease-in-out infinite" }
                    : undefined
                }
              />
              {filledCount}/{totalCount}
            </span>
          )}
        </div>

        {/* Cards dos parâmetros */}
        {BASAL_PARAMS.map((param, idx) => (
          <ParameterCard
            key={param.key}
            param={param}
            raw={values[param.key] ?? ""}
            onChange={(raw) => setValue(param.key, raw)}
            onStep={(dir) => step(param, dir)}
            index={idx}
          />
        ))}

        {/* Combo PAS/PAD — aparece quando os dois estão preenchidos */}
        <BloodPressureCombo
          systolic={numericValues.systolic}
          diastolic={numericValues.diastolic}
        />

        {/* Save button adaptativo */}
        <Button
          className={cn(
            "w-full h-12 relative overflow-hidden",
            "transition-[transform,box-shadow] duration-200 active:scale-[0.98]",
            filledCount === 0 && "opacity-60",
            anyAbnormal &&
              filledCount > 0 &&
              "shadow-[0_0_0_3px_oklch(from_var(--color-destructive)_l_c_h/0.2)]"
          )}
          onClick={handleSave}
          disabled={isLoading || filledCount === 0}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {filledCount === 0
            ? "Preencha ao menos um parâmetro"
            : anyAbnormal
              ? "Salvar com alertas"
              : "Salvar parâmetros"}

          {/* Shimmer sweep quando todos preenchidos e normais */}
          {allFilledAndNormal && !isLoading && (
            <span
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                animation: "shimmer-sweep 2.8s ease-in-out infinite",
              }}
            />
          )}
        </Button>
      </div>

      {/* Keyframes locais — respeitam reduced-motion */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
          50%      { transform: scale(1.2) rotate(15deg); opacity: 1; }
        }
        @keyframes shimmer-sweep {
          0%        { transform: translateX(-100%); }
          60%, 100% { transform: translateX(250%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="twinkle"], [style*="shimmer-sweep"] { animation: none !important; }
        }
      `}</style>
    </MobileLayout>
  );
}

// ─── BloodPressureCombo ──────────────────────────────────────────────────

function BloodPressureCombo({
  systolic,
  diastolic,
}: {
  systolic: number | null;
  diastolic: number | null;
}) {
  if (systolic === null || diastolic === null) return null;

  // Classificação combinada conforme SBC — função unificada na lib.
  const cls = classifyBloodPressure(systolic, diastolic);
  if (!cls) return null;
  const toneCls = BASAL_TONE_CLASSES[cls.tone];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        toneCls.bg,
        toneCls.border
      )}
      aria-live="polite"
    >
      <div className={cn("flex items-center justify-center size-10 rounded-xl shrink-0", toneCls.bg)}>
        <Activity className={cn("size-5", toneCls.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Pressão arterial
        </p>
        <p className="text-base font-bold tabular-nums">
          <span className={toneCls.text}>
            {systolic}/{diastolic}
          </span>{" "}
          <span className="text-xs font-semibold text-muted-foreground">mmHg</span>
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border",
          toneCls.text,
          toneCls.bg,
          toneCls.border
        )}
      >
        {cls.label}
      </span>
    </div>
  );
}
