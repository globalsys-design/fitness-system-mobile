"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Layers, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { MeasurementInput } from "@/components/assessments/measurement-input";
import { guideImages } from "@/components/assessments/guide-images";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SKINFOLD_SECTIONS = [
  {
    title: "Dobras Cutâneas",
    fields: [
      { key: "tricipital", label: "Tríceps" },
      { key: "subescapular", label: "Subescapular" },
      { key: "bicipital", label: "Bíceps" },
      { key: "peitoral", label: "Peitoral" },
      { key: "axilar_media", label: "Axilar Média" },
      { key: "suprailiaca", label: "Supra-ilíaca" },
      { key: "abdominal", label: "Abdominal" },
      { key: "coxa_medial_dc", label: "Coxa Medial" },
      { key: "perna_medial", label: "Perna Medial" },
    ],
  },
];

const PROTOCOLS = [
  { key: "jackson_pollock_7", label: "Jackson & Pollock 7 dobras", folds: 7 },
  { key: "jackson_pollock_3m", label: "Jackson & Pollock 3 (Masc)", folds: 3 },
  { key: "jackson_pollock_3f", label: "Jackson & Pollock 3 (Fem)", folds: 3 },
  { key: "petroski", label: "Petroski", folds: 7 },
  { key: "guedes", label: "Guedes", folds: 3 },
  { key: "durnin_womersley", label: "Durnin & Womersley", folds: 4 },
];

export default function ComposicaoCorporalPage() {
  const params = useParams();
  const [values, setValues] = useState<Record<string, string>>({});
  const [protocol, setProtocol] = useState("jackson_pollock_7");
  const [showProtocols, setShowProtocols] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Dobras Cutâneas": true,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/anthropometry`);
        if (res.ok) {
          const data = await res.json();
          if (data?.bodyComposition) {
            const bc = data.bodyComposition as Record<string, unknown>;
            setValues((bc.skinfolds as Record<string, string>) ?? {});
            if (bc.protocol) setProtocol(bc.protocol as string);
          }
        }
      } catch {
        /* empty */
      } finally {
        setIsFetching(false);
      }
    }
    load();
  }, [params.id]);

  const filledCount = SKINFOLD_SECTIONS[0].fields.filter(
    (f) => values[f.key] && values[f.key] !== ""
  ).length;

  const totalSkinfolds = useMemo(() => {
    return SKINFOLD_SECTIONS[0].fields.reduce((sum, f) => {
      const val = parseFloat(values[f.key] ?? "");
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [values]);

  function toggleSection(title: string) {
    setExpandedSections((s) => ({ ...s, [title]: !s[title] }));
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/anthropometry`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyComposition: {
            skinfolds: values,
            protocol,
            totalSkinfolds: totalSkinfolds || null,
          },
        }),
      });
      toast.success("Composição corporal salva!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Composição Corporal" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Composição Corporal" showBack>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Layers className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">
              Dobras Cutâneas
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Medidas com adipômetro em milímetros
            </p>
          </div>
        </div>

        {/* Protocol selector */}
        <Card>
          <CardContent className="p-4">
            <button
              type="button"
              onClick={() => setShowProtocols(!showProtocols)}
              className="flex items-center justify-between w-full"
            >
              <div>
                <Label className="text-sm font-medium block text-left">
                  Protocolo
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {PROTOCOLS.find((p) => p.key === protocol)?.label}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  showProtocols && "rotate-180"
                )}
              />
            </button>
            {showProtocols && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                {PROTOCOLS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => {
                      setProtocol(p.key);
                      setShowProtocols(false);
                      setSaved(false);
                    }}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                      protocol === p.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skinfold sections */}
        {SKINFOLD_SECTIONS.map((section) => (
          <div key={section.title}>
            <button
              type="button"
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between w-full py-2 px-1"
            >
              <h3 className="font-semibold text-foreground text-sm">
                {section.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {filledCount}/{section.fields.length}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    expandedSections[section.title] && "rotate-180"
                  )}
                />
              </div>
            </button>

            {expandedSections[section.title] && (
              <div className="flex flex-col gap-3 mt-2">
                {section.fields.map((f) => {
                  const guide = guideImages[f.key];
                  return (
                    <MeasurementInput
                      key={f.key}
                      label={f.label}
                      unit="mm"
                      value={values[f.key] ?? ""}
                      onChange={(val) => {
                        setValues((v) => ({ ...v, [f.key]: val }));
                        setSaved(false);
                      }}
                      guideImage={guide?.image}
                      guideTip={guide?.tip}
                      min={0}
                      max={80}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Summary */}
        {totalSkinfolds > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Somatório de Dobras</Label>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {PROTOCOLS.find((p) => p.key === protocol)?.label}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-foreground mt-2">
                {totalSkinfolds.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  mm
                </span>
              </p>
            </CardContent>
          </Card>
        )}

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="size-4 mr-2" />
          ) : null}
          {saved ? "Salvo" : "Salvar composição corporal"}
        </Button>
      </div>
    </MobileLayout>
  );
}
