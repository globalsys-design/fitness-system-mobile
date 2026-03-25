import { MobileLayout } from "@/components/mobile/mobile-layout";
import Link from "next/link";
import { ChevronRight, Activity } from "lucide-react";

const SUB_SECTIONS = [
  { label: "VO₂ Preditivo", href: "vo2-preditivo", description: "Estimativa de condicionamento aeróbico" },
  { label: "VO₂ Máx.", href: "vo2-max", description: "Consumo máximo de oxigênio" },
];

export default function TestesPage({ params }: { params: { id: string } }) {
  return (
    <MobileLayout title="Testes" showBack>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Activity className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">Testes de Aptidão</p>
            <p className="text-xs text-muted-foreground">Avaliação do condicionamento físico</p>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
          {SUB_SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={`/app/avaliacoes/${params.id}/testes/${s.href}`}
              className="flex items-center gap-3 px-4 py-4 bg-card hover:bg-accent transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
