import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import Link from "next/link";
import { ChevronRight, CheckCircle2, Ruler } from "lucide-react";

const SUB_SECTIONS = [
  { label: "Perímetros", href: "perimetros", description: "Circunferências corporais", field: "perimeters" },
  { label: "Diâmetros", href: "diametros", description: "Medidas ósseas e estruturais", field: "diameters" },
  { label: "Peso e Estatura", href: "peso-estatura", description: "IMC, ICQ e indicadores", field: "weight" },
  { label: "Composição Corporal", href: "composicao-corporal", description: "Dobras cutâneas e protocolo", field: "bodyComposition" },
  { label: "Somatotipo", href: "somatotipo", description: "Classificação Heath-Carter", field: "somatotype" },
];

export default async function AntropometriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const assessment = await db.assessment.findUnique({
    where: { id },
    select: {
      id: true,
      anthropometry: {
        select: {
          perimeters: true,
          diameters: true,
          weight: true,
          height: true,
          bodyComposition: true,
          somatotype: true,
        },
      },
    },
  });

  if (!assessment) notFound();

  const anthro = assessment.anthropometry;

  return (
    <MobileLayout title="Antropometria" showBack>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Ruler className="size-8 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">Medidas Antropométricas</p>
            <p className="text-xs text-muted-foreground">Avaliação corporal completa</p>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
          {SUB_SECTIONS.map((s) => {
            const hasData =
              anthro != null &&
              anthro[s.field as keyof typeof anthro] != null;
            return (
              <Link
                key={s.href}
                href={`/app/avaliacoes/${id}/antropometria/${s.href}`}
                className="flex items-center gap-3 px-4 py-4 bg-card hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
                {hasData ? (
                  <CheckCircle2 className="size-4 text-success shrink-0" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
}
