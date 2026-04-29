"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Activity,
  CheckCircle2,
  Mars,
  Venus,
  User as UserIcon,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { YesNoButtons } from "@/components/ui/yes-no-buttons";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  CHOLESTEROL_OPTIONS,
  HDL_OPTIONS,
  SYSTOLIC_OPTIONS,
  buildFraminghamBreakdown,
  calcAge,
  calcFraminghamV2,
  isFraminghamComplete,
  type FraminghamDataV2,
  type FraminghamGender,
} from "@/lib/data/framingham";
import {
  FraminghamView,
  type FraminghamRiskLevel,
} from "@/components/assessments/framingham/framingham-view";

const INITIAL: FraminghamDataV2 = {
  version: "v2",
  cholesterol: undefined,
  hdl: undefined,
  systolic: undefined,
  isSmoker: undefined,
  isTreatedBP: undefined,
  hasDiabetes: undefined,
};

/* Mapeia faixas de range para valores numéricos representativos —
 * usado apenas pelo modo de visualização (FraminghamView), que mostra
 * cards clínicos com números individuais. */
const CHOLESTEROL_NUMERIC: Record<string, number> = {
  "ch-lt160": 150,
  "ch-160-199": 180,
  "ch-200-239": 220,
  "ch-240-279": 260,
  "ch-gte280": 290,
};
const HDL_NUMERIC: Record<string, number> = {
  "hdl-gte60": 65,
  "hdl-50-59": 55,
  "hdl-40-49": 45,
  "hdl-lt40": 35,
};
const SYSTOLIC_NUMERIC: Record<string, number> = {
  "sbp-lt120": 110,
  "sbp-120-129": 125,
  "sbp-130-139": 135,
  "sbp-140-159": 150,
  "sbp-gte160": 170,
};

function genderFromClient(g: string | null | undefined): FraminghamGender | null {
  if (!g) return null;
  const norm = g.toLowerCase().trim();
  if (norm.startsWith("m") || norm === "masculino" || norm === "male") return "M";
  if (norm.startsWith("f") || norm === "feminino" || norm === "female") return "F";
  return null;
}

export default function FraminghamPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = params.id as string;

  /* ── perfil do cliente (auto-preenchimento) ─────────────────── */
  const [clientGender, setClientGender] = useState<FraminghamGender | null>(null);
  const [clientAge, setClientAge] = useState<number | null>(null);
  const [clientName, setClientName] = useState<string>("");

  const [data, setData] = useState<FraminghamDataV2>(INITIAL);
  const [savedData, setSavedData] = useState<FraminghamDataV2 | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [forceEdit, setForceEdit] = useState(false);
  const isEditQuery = searchParams.get("mode") === "edit";

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${assessmentId}/anamnesis`);
        if (res.ok) {
          const d = await res.json();

          // Auto-preenchimento do perfil
          if (d?.client) {
            setClientName(d.client.name ?? "");
            setClientGender(genderFromClient(d.client.gender));
            setClientAge(calcAge(d.client.birthDate));
          }

          // Carrega Framingham apenas se for v2
          if (d?.framingham?.version === "v2") {
            const v2 = d.framingham as FraminghamDataV2;
            setData({ ...INITIAL, ...v2 });
            setSavedData(v2);
            setSavedAt(v2.completedAt ?? d?.updatedAt ?? null);
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

  /* ── cálculo do score em tempo real ─────────────────────────── */
  const result = useMemo(() => {
    if (!clientGender || clientAge == null) return null;
    if (!isFraminghamComplete(data)) return null;
    return calcFraminghamV2(data, clientGender, clientAge);
  }, [data, clientGender, clientAge]);

  const riskLevel: FraminghamRiskLevel | null = result
    ? result.risk10Year < 10
      ? "low"
      : result.risk10Year < 20
        ? "moderate"
        : "high"
    : null;

  function update<K extends keyof FraminghamDataV2>(
    key: K,
    value: FraminghamDataV2[K]
  ) {
    setData((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    if (!clientGender || clientAge == null) {
      toast.error(
        "Cadastre data de nascimento e gênero do cliente antes de calcular Framingham."
      );
      return;
    }
    setIsLoading(true);
    try {
      const payload: FraminghamDataV2 = {
        ...data,
        version: "v2",
        completedAt: new Date().toISOString(),
        score: result?.score,
        risk10Year: result?.risk10Year,
      };
      await fetch(`/api/assessments/${assessmentId}/anamnesis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ framingham: payload }),
      });
      toast.success("Framingham salvo!");
      setSaved(true);
      setSavedData(payload);
      setSavedAt(payload.completedAt ?? null);
      setForceEdit(false);
      if (isEditQuery) {
        router.replace(`/app/avaliacoes/${assessmentId}/anamnese/framingham`);
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
    setData(INITIAL);
    setSaved(false);
    setForceEdit(true);
  }

  if (isFetching) {
    return (
      <MobileLayout title="Framingham" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  /* ── modo leitura ──────────────────────────────────────────── */
  const hasSavedData =
    savedData != null &&
    savedData.version === "v2" &&
    isFraminghamComplete(savedData) &&
    clientGender != null &&
    clientAge != null;
  const isViewMode = hasSavedData && !isEditQuery && !forceEdit;

  if (
    isViewMode &&
    savedData &&
    clientGender &&
    clientAge != null
  ) {
    const savedResult = calcFraminghamV2(savedData, clientGender, clientAge);
    const savedRisk: FraminghamRiskLevel =
      savedResult.risk10Year < 10
        ? "low"
        : savedResult.risk10Year < 20
          ? "moderate"
          : "high";
    const breakdown = buildFraminghamBreakdown(
      savedData,
      clientGender,
      clientAge
    ).map((b) => ({ ...b, icon: "chol" as const }));

    return (
      <MobileLayout title="Framingham" showBack>
        <FraminghamView
          data={{
            gender: clientGender,
            age: clientAge,
            totalCholesterol: savedData.cholesterol
              ? CHOLESTEROL_NUMERIC[savedData.cholesterol] ?? 0
              : 0,
            hdl: savedData.hdl ? HDL_NUMERIC[savedData.hdl] ?? 0 : 0,
            systolic: savedData.systolic
              ? SYSTOLIC_NUMERIC[savedData.systolic] ?? 0
              : 0,
            isTreatedBP: !!savedData.isTreatedBP,
            isSmoker: !!savedData.isSmoker,
            hasDiabetes: !!savedData.hasDiabetes,
          }}
          score={savedResult.score}
          risk10Year={savedResult.risk10Year}
          riskLevel={savedRisk}
          breakdown={breakdown}
          completedAt={savedAt}
          onEdit={handleEdit}
          onStartNew={handleStartNew}
        />
      </MobileLayout>
    );
  }

  /* ── modo edição ───────────────────────────────────────────── */
  const profileMissing = !clientGender || clientAge == null;

  return (
    <MobileLayout title="Framingham" showBack>
      <div className="p-4 flex flex-col gap-4">
        {/* Header informativo */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Activity className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">
              Escore de Risco de Framingham
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Estimativa de risco cardiovascular em 10 anos
            </p>
          </div>
        </div>

        {/* Resultado preview */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            Resultado
          </Label>
          {!result || !riskLevel ? (
            <div className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-5 space-y-1">
              <div className="flex items-center gap-2 text-foreground/80">
                <Info className="size-4" />
                <p className="text-sm font-semibold">
                  Nenhuma classificação de risco
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Preencha e salve o formulário para obter uma estimativa do
                nível de risco cardiovascular em 10 anos.
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "rounded-xl border-2 px-4 py-4 space-y-1.5",
                riskLevel === "low"
                  ? "bg-primary/5 border-primary/30"
                  : riskLevel === "moderate"
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-destructive/10 border-destructive/30"
              )}
            >
              <div className="flex items-center justify-between">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    riskLevel === "low"
                      ? "text-primary"
                      : riskLevel === "moderate"
                        ? "text-amber-600 dark:text-amber-300"
                        : "text-destructive"
                  )}
                >
                  {riskLevel === "low"
                    ? "Risco Baixo"
                    : riskLevel === "moderate"
                      ? "Risco Moderado"
                      : "Risco Alto"}
                </p>
                <span
                  className={cn(
                    "text-xs font-bold tabular-nums px-2 py-0.5 rounded-full",
                    riskLevel === "low"
                      ? "bg-primary/15 text-primary"
                      : riskLevel === "moderate"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                        : "bg-destructive/15 text-destructive"
                  )}
                >
                  {result.risk10Year}% · {result.score} pts
                </span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                Estimativa de evento cardiovascular em 10 anos.
              </p>
            </div>
          )}
        </div>

        {/* Profile auto-fill alert */}
        {profileMissing && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2">
            <Info className="size-4 text-amber-600 dark:text-amber-300 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 dark:text-amber-200 leading-relaxed">
              <p className="font-semibold">Dados do perfil incompletos</p>
              <p className="mt-0.5">
                Cadastre <strong>data de nascimento</strong> e{" "}
                <strong>gênero</strong> do cliente para calcular o Framingham.
              </p>
            </div>
          </div>
        )}

        {/* Idade + Gênero (read-only do perfil) */}
        <div className="grid grid-cols-2 gap-3">
          <ProfileChip
            label="Idade"
            value={clientAge != null ? `${clientAge} anos` : "Não informada"}
            placeholder={clientAge == null}
            icon={UserIcon}
          />
          <ProfileChip
            label="Gênero"
            value={
              clientGender === "M"
                ? "Masculino"
                : clientGender === "F"
                  ? "Feminino"
                  : "Não informado"
            }
            placeholder={!clientGender}
            icon={clientGender === "F" ? Venus : Mars}
          />
        </div>
        <p className="text-[11px] text-muted-foreground -mt-2 pl-1">
          Idade e gênero são puxados automaticamente do perfil
          {clientName ? ` de ${clientName}` : ""}.
        </p>

        {/* Dropdowns de faixas */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="framingham-cholesterol"
                className="text-sm font-medium"
              >
                Colesterol
              </Label>
              <NativeSelect
                id="framingham-cholesterol"
                value={data.cholesterol ?? ""}
                onChange={(e) =>
                  update("cholesterol", e.target.value || undefined)
                }
              >
                <option value="" disabled>
                  Selecione uma opção
                </option>
                {CHOLESTEROL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="framingham-hdl" className="text-sm font-medium">
                HDL Colesterol
              </Label>
              <NativeSelect
                id="framingham-hdl"
                value={data.hdl ?? ""}
                onChange={(e) => update("hdl", e.target.value || undefined)}
              >
                <option value="" disabled>
                  Selecione uma opção
                </option>
                {HDL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="framingham-systolic"
                className="text-sm font-medium"
              >
                Pressão Arterial Sistólica
              </Label>
              <NativeSelect
                id="framingham-systolic"
                value={data.systolic ?? ""}
                onChange={(e) =>
                  update("systolic", e.target.value || undefined)
                }
              >
                <option value="" disabled>
                  Selecione uma opção
                </option>
                {SYSTOLIC_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </CardContent>
        </Card>

        {/* Booleanos — usa componente padrão do design system */}
        <BoolField
          label="Tabagismo?"
          value={data.isSmoker}
          onChange={(v) => update("isSmoker", v === "yes")}
          dangerYes
        />
        <BoolField
          label="Pressão Arterial Sistólica Tratada?"
          value={data.isTreatedBP}
          onChange={(v) => update("isTreatedBP", v === "yes")}
        />
        <BoolField
          label="Diabetes?"
          value={data.hasDiabetes}
          onChange={(v) => update("hasDiabetes", v === "yes")}
          dangerYes
        />

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={
            isLoading || !isFraminghamComplete(data) || profileMissing
          }
        >
          {isLoading ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="size-4 mr-2" />
          ) : null}
          {saved ? "Salvo" : "Salvar Framingham"}
        </Button>
      </div>
    </MobileLayout>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Sub-componentes
 * ────────────────────────────────────────────────────────────────────── */

function ProfileChip({
  label,
  value,
  icon: Icon,
  placeholder,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  placeholder?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-2.5">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          placeholder
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-300"
            : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "text-sm font-semibold tabular-nums truncate",
            placeholder ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function BoolField({
  label,
  value,
  onChange,
  dangerYes,
}: {
  label: string;
  value: boolean | undefined;
  onChange: (v: "yes" | "no") => void;
  dangerYes?: boolean;
}) {
  const yesNoValue: "yes" | "no" | null =
    value === true ? "yes" : value === false ? "no" : null;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card">
      <p className="text-sm text-foreground">{label}</p>
      <YesNoButtons
        value={yesNoValue}
        onChange={onChange}
        dangerYes={dangerYes}
        ariaLabel={label}
      />
    </div>
  );
}
