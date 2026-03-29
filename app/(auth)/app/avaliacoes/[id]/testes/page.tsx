import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import Link from "next/link";
import { ChevronRight, CheckCircle2, Activity } from "lucide-react";

const SUB_SECTIONS = [
  { label: "VO₂ Preditivo", href: "vo2-preditivo", description: "Estimativa de condicionamento aeróbico", field: "vo2Predictive" },
  { label: "VO₂ Máx.", href: "vo2-max", description: "Consumo máximo de oxigênio", field: "vo2Max" },
];

export default async function TestesPage({
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
      fitnessTests: {
        select: {
          vo2Predictive: true,
          vo2Max: true,
        },
      },
    },
  });

  if (!assessment) notFound();

  const tests = assessment.fitnessTests;

  return (
    <MobileLayout title="Testes" showBack>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Activity className="size-8 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">Testes de Aptidão</p>
            <p className="text-xs text-muted-foreground">Avaliação do condicionamento físico</p>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
          {SUB_SECTIONS.map((s) => {
            const hasData =
              tests != null &&
              tests[s.field as keyof typeof tests] != null;
            return (
              <Link
                key={s.href}
                href={`/app/avaliacoes/${id}/testes/${s.href}`}
                className="flex items-center gap-3 px-4 py-4 bg-card hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
                {hasData ? (
                  <CheckCircle2 className="size-4 text-green-500 shrink-0" />
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
