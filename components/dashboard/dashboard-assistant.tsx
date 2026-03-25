import Link from "next/link";
import { Users, ClipboardList, Dumbbell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardAssistantProps {
  assistant: {
    id: string;
    name: string;
    professional: {
      name: string;
      email: string;
      photo: string | null;
      profession: string | null;
    };
    _count: {
      assessments: number;
      prescriptions: number;
    };
  };
}

export function DashboardAssistant({ assistant }: DashboardAssistantProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Olá, {assistant.name.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-muted-foreground">Painel do assistente</p>
      </div>

      {/* Profissional responsável */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
            Profissional responsável
          </p>
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={assistant.professional.photo ?? undefined} />
              <AvatarFallback>
                {assistant.professional.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{assistant.professional.name}</p>
              <p className="text-xs text-muted-foreground">{assistant.professional.profession ?? "Profissional"}</p>
              <p className="text-xs text-muted-foreground">{assistant.professional.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{assistant._count.assessments}</p>
              <p className="text-xs text-muted-foreground">Avaliações</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10">
              <Dumbbell className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{assistant._count.prescriptions}</p>
              <p className="text-xs text-muted-foreground">Prescrições</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atalhos */}
      <div className="grid grid-cols-1 gap-2">
        <Link href="/app/usuarios?tab=clientes">
          <Button variant="outline" className="h-11 w-full justify-start">
            <Users className="w-4 h-4 mr-2" />
            Ver clientes
          </Button>
        </Link>
        <Link href="/app/avaliacoes">
          <Button variant="outline" className="h-11 w-full justify-start">
            <ClipboardList className="w-4 h-4 mr-2" />
            Ver avaliações
          </Button>
        </Link>
        <Link href="/app/prescricoes">
          <Button variant="outline" className="h-11 w-full justify-start">
            <Dumbbell className="w-4 h-4 mr-2" />
            Ver prescrições
          </Button>
        </Link>
      </div>
    </div>
  );
}
