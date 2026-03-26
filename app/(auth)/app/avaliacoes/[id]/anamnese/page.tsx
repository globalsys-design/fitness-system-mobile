import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import Link from "next/link";
import { ChevronRight, Heart, CheckCircle2, Circle } from "lucide-react";

const SUB_SECTIONS = [
  { label: "Parâmetros Basais", href: "parametros-basais", fieldKey: "basalParameters" },
  { label: "PAR-Q+", href: "parq", fieldKey: "parq" },
  { label: "Risco Coronariano", href: "risco-coronariano", fieldKey: "coronaryRisk" },
  { label: "Framingham", href: "framingham", fieldKey: "framingham" },
  { label: "Questionário Avançado", href: "questionario-avancado", fieldKey: "advancedQuestionnaire" },
  { label: "Questionário Completo", href: "questionario-completo", fieldKey: "fullQuestionnaire" },
];

export default async function AnamnesePage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const assessment = await db.assessment.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      anamnesis: {
        select: {
          basalParameters: true,
          parq: true,
          coronaryRisk: true,
          framingham: true,
          advancedQuestionnaire: true,
          fullQuestionnaire: true,
        },
      },
    },
  });

  if (!assessment) notFound();

  const anamnesis = assessment.anamnesis;

  return (
    <MobileLayout title="Anamnese" showBack>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Heart className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">Anamnese Clínica</p>
            <p className="text-xs text-muted-foreground">Avaliação do histórico e estado de saúde</p>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
          {SUB_SECTIONS.map((s) => {
            const hasData = anamnesis != null && anamnesis[s.fieldKey as keyof typeof anamnesis] != null;
            return (
              <Link
                key={s.href}
                href={`/app/avaliacoes/${params.id}/anamnese/${s.href}`}
                className="flex items-center gap-3 px-4 py-4 bg-card hover:bg-accent transition-colors"
              >
                <p className="flex-1 text-sm font-medium text-foreground">{s.label}</p>
                {hasData ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
}
