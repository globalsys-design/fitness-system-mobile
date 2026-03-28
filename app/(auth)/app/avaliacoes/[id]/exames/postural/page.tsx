"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const POSTURE_SECTIONS = [
  {
    title: "Vista Anterior",
    items: [
      { key: "head_anterior", label: "Cabeça" },
      { key: "shoulders_anterior", label: "Ombros" },
      { key: "chest", label: "Tórax" },
      { key: "hips_anterior", label: "Quadril" },
      { key: "knees_anterior", label: "Joelhos (valgo/varo)" },
      { key: "feet_anterior", label: "Pés (pronação/supinação)" },
    ],
  },
  {
    title: "Vista Posterior",
    items: [
      { key: "head_posterior", label: "Cabeça" },
      { key: "shoulders_posterior", label: "Ombros" },
      { key: "scapulae", label: "Escápulas (alada/retraída)" },
      { key: "spine_posterior", label: "Coluna (escoliose)" },
      { key: "hips_posterior", label: "Quadril" },
      { key: "calcaneus", label: "Calcâneo (valgo/varo)" },
    ],
  },
  {
    title: "Vista Lateral",
    items: [
      { key: "head_lateral", label: "Projeção da cabeça" },
      { key: "cervical", label: "Lordose cervical" },
      { key: "thoracic", label: "Cifose torácica" },
      { key: "lumbar", label: "Lordose lombar" },
      { key: "pelvis", label: "Inclinação pélvica" },
      { key: "knees_lateral", label: "Joelhos (recurvatum/flexo)" },
    ],
  },
];

type PosturalStatus = "normal" | "altered" | "significant";

const STATUS_OPTIONS: { value: PosturalStatus; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "altered", label: "Alterado" },
  { value: "significant", label: "Significativo" },
];

const STATUS_COLORS: Record<PosturalStatus, { text: string; bg: string }> = {
  normal: { text: "text-primary", bg: "bg-primary text-primary-foreground" },
  altered: { text: "text-warning", bg: "bg-warning text-warning-foreground" },
  significant: { text: "text-destructive", bg: "bg-destructive text-destructive-foreground" },
};

interface PosturalData {
  assessments: Record<string, { status: PosturalStatus; notes: string }>;
  generalNotes: string;
}

export default function PosturalPage() {
  const params = useParams();
  const [data, setData] = useState<PosturalData>({
    assessments: {},
    generalNotes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/assessments/${params.id}/clinical-exams`);
        if (res.ok) {
          const d = await res.json();
          if (d?.posturalExam) {
            const pd = d.posturalExam as PosturalData;
            setData({
              assessments: pd.assessments ?? {},
              generalNotes: pd.generalNotes ?? "",
            });
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

  function setItemStatus(key: string, status: PosturalStatus) {
    setData((d) => ({
      ...d,
      assessments: {
        ...d.assessments,
        [key]: { ...(d.assessments[key] ?? { notes: "" }), status },
      },
    }));
    setSaved(false);
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      await fetch(`/api/assessments/${params.id}/clinical-exams`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posturalExam: data }),
      });
      toast.success("Avaliação postural salva!");
      setSaved(true);
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <MobileLayout title="Avaliação Postural" showBack>
        <div className="p-4 flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Avaliação Postural" showBack>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <User className="size-6 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">Avaliação Postural</p>
            <p className="text-xs text-muted-foreground mt-0.5">Análise estática em 3 vistas</p>
          </div>
        </div>

        {POSTURE_SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground text-sm mt-2 px-1">{section.title}</h3>
            {section.items.map((item) => {
              const current = data.assessments[item.key]?.status;
              return (
                <Card key={item.key}>
                  <CardContent className="p-4">
                    <Label className="text-sm font-medium mb-2 block">{item.label}</Label>
                    <div className="flex gap-2">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setItemStatus(item.key, opt.value)}
                          className={cn(
                            "flex-1 h-10 rounded-xl text-xs font-medium transition-colors",
                            current === opt.value
                              ? STATUS_COLORS[opt.value].bg
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))}

        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-2 block">Observações gerais</Label>
            <textarea
              placeholder="Desvios posturais relevantes, recomendações..."
              value={data.generalNotes}
              onChange={(e) => { setData((d) => ({ ...d, generalNotes: e.target.value })); setSaved(false); }}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[5rem] resize-none"
            />
          </CardContent>
        </Card>

        <Button className="h-12 w-full" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <Loader2 className="size-4 mr-2 animate-spin" /> : saved ? <CheckCircle2 className="size-4 mr-2" /> : null}
          {saved ? "Salvo" : "Salvar avaliação postural"}
        </Button>
      </div>
    </MobileLayout>
  );
}
