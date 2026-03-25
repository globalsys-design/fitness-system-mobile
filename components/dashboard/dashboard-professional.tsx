import Link from "next/link";
import {
  Users,
  ClipboardList,
  Dumbbell,
  UserCheck,
  TrendingUp,
  CalendarPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardProfessionalProps {
  professional: {
    id: string;
    name: string | null;
    _count: {
      clients: number;
      assistants: number;
      assessments: number;
      prescriptions: number;
    };
  };
  recentAssessments: number;
  recentPrescriptions: number;
}

export function DashboardProfessional({
  professional,
  recentAssessments,
  recentPrescriptions,
}: DashboardProfessionalProps) {
  const kpis = [
    {
      label: "Clientes",
      value: professional._count.clients,
      icon: Users,
      href: "/app/usuarios?tab=clientes",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Assistentes",
      value: professional._count.assistants,
      icon: UserCheck,
      href: "/app/usuarios?tab=assistentes",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Avaliações",
      value: professional._count.assessments,
      icon: ClipboardList,
      href: "/app/avaliacoes",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Prescrições",
      value: professional._count.prescriptions,
      icon: Dumbbell,
      href: "/app/prescricoes",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Olá, {professional.name?.split(" ")[0] ?? "Profissional"} 👋
        </h2>
        <p className="text-sm text-muted-foreground">Visão geral do seu sistema</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.label} href={kpi.href}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${kpi.bg}`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Últimos 30 dias */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Últimos 30 dias
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">Novas avaliações</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{recentAssessments}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-foreground">Novas prescrições</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{recentPrescriptions}</span>
          </div>
        </div>
      </div>

      {/* Atalhos */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Ações rápidas</h3>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/app/usuarios?tab=clientes">
            <Button variant="outline" className="h-11 w-full text-xs">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Ver clientes
            </Button>
          </Link>
          <Link href="/app/avaliacoes">
            <Button variant="outline" className="h-11 w-full text-xs">
              <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
              Avaliações
            </Button>
          </Link>
          <Link href="/app/prescricoes">
            <Button variant="outline" className="h-11 w-full text-xs">
              <Dumbbell className="w-3.5 h-3.5 mr-1.5" />
              Prescrições
            </Button>
          </Link>
          <Link href="/app/mais/calendario">
            <Button variant="outline" className="h-11 w-full text-xs">
              <CalendarPlus className="w-3.5 h-3.5 mr-1.5" />
              Agenda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
