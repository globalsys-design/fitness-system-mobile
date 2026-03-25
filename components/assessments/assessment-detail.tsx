"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Target, Heart, Ruler, Stethoscope, Activity,
  CheckCircle2, Circle, ChevronRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    id: "objetivo",
    label: "Objetivo e Disponibilidade",
    icon: Target,
    href: (id: string) => `/app/avaliacoes/${id}/objetivo`,
    fieldKey: "objective",
  },
  {
    id: "anamnese",
    label: "Anamnese",
    icon: Heart,
    href: (id: string) => `/app/avaliacoes/${id}/anamnese`,
    fieldKey: "anamnesis",
  },
  {
    id: "antropometria",
    label: "Antropometria",
    icon: Ruler,
    href: (id: string) => `/app/avaliacoes/${id}/antropometria`,
    fieldKey: "anthropometry",
  },
  {
    id: "exames",
    label: "Exames Clínicos",
    icon: Stethoscope,
    href: (id: string) => `/app/avaliacoes/${id}/exames`,
    fieldKey: "clinicalExams",
  },
  {
    id: "testes",
    label: "Testes",
    icon: Activity,
    href: (id: string) => `/app/avaliacoes/${id}/testes`,
    fieldKey: "fitnessTests",
  },
];

export function AssessmentDetail({ assessment }: { assessment: any }) {
  const birthDate = assessment.client.birthDate;
  const age = birthDate
    ? Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const populationLabels: Record<string, string> = {
    NORMAL: "Normal", ATHLETE: "Atleta", ELDERLY: "Idoso", CHILD: "Criança", PREGNANT: "Gestante",
  };

  return (
    <div className="flex flex-col bg-background" style={{ minHeight: "100dvh" }}>
      <MobileHeader
        title="Avaliação"
        showBack
        actions={
          <Badge variant="outline" className={assessment.status === "COMPLETE" ? "border-green-200 text-green-700" : ""}>
            {assessment.status === "COMPLETE" ? "Completa" : "Rascunho"}
          </Badge>
        }
      />

      {/* Client Header Card */}
      <div className="px-4 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={assessment.client.photo ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {assessment.client.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">{assessment.client.name}</p>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-xs text-muted-foreground">
                {populationLabels[assessment.population]}
              </span>
              {assessment.modality && (
                <span className="text-xs text-muted-foreground">· {assessment.modality}</span>
              )}
              {age && <span className="text-xs text-muted-foreground">· {age} anos</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {format(new Date(assessment.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="p-4 flex flex-col gap-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Módulos da avaliação
        </p>
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
          {SECTIONS.map((section, index) => {
            const Icon = section.icon;
            const hasData = assessment[section.fieldKey] !== null;
            return (
              <Link
                key={section.id}
                href={section.href(assessment.id)}
                className="flex items-center gap-3 px-4 py-4 bg-card hover:bg-accent transition-colors"
              >
                <div className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-xl",
                  hasData ? "bg-primary/10" : "bg-muted"
                )}>
                  <Icon className={cn("w-4 h-4", hasData ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{index + 1}.</span>
                    <p className="text-sm font-medium text-foreground">{section.label}</p>
                  </div>
                </div>
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
    </div>
  );
}
