import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import Link from "next/link";
import { ChevronRight, Heart } from "lucide-react";

const SUB_SECTIONS = [
  { label: "Parâmetros Basais", href: "parametros-basais" },
  { label: "PAR-Q+", href: "parq" },
  { label: "Risco Coronariano", href: "risco-coronariano" },
  { label: "Framingham", href: "framingham" },
  { label: "Questionário Avançado", href: "questionario-avancado" },
  { label: "Questionário Completo", href: "questionario-completo" },
];

export default async function AnamnesePage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const assessment = await db.assessment.findUnique({
    where: { id: params.id },
    select: { id: true, anamnesis: true },
  });

  if (!assessment) notFound();

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
          {SUB_SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={`/app/avaliacoes/${params.id}/anamnese/${s.href}`}
              className="flex items-center gap-3 px-4 py-4 bg-card hover:bg-accent transition-colors"
            >
              <p className="flex-1 text-sm font-medium text-foreground">{s.label}</p>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
