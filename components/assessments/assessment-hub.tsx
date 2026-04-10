"use client";

import Link from "next/link";
import {
  Target,
  Heart,
  Ruler,
  Stethoscope,
  Activity,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// ── Progress Ring SVG ────────────────────────────────────────────────────────
function ProgressRing({
  progress,
  size = 44,
  strokeWidth = 3,
}: {
  progress: number; // 0–100
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/60"
      />
      {/* Indicator */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={cn(
          "transition-all duration-700 ease-out",
          progress === 100 ? "text-success" : "text-primary"
        )}
      />
    </svg>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────
interface AssessmentData {
  id: string;
  status: string;
  population: string;
  modality: string | null;
  createdAt: string;
  client: {
    id: string;
    name: string;
    photo: string | null;
    gender: string | null;
    birthDate: string | null;
  };
  objective: any | null;
  anamnesis: any | null;
  anthropometry: any | null;
  clinicalExams: any | null;
  fitnessTests: any | null;
}

// ── Section config ───────────────────────────────────────────────────────────
function getSections(assessment: AssessmentData) {
  // Anamnese has 6 sub-modules
  const anamnesisFields = assessment.anamnesis
    ? [
        assessment.anamnesis.basalParameters,
        assessment.anamnesis.parq,
        assessment.anamnesis.coronaryRisk,
        assessment.anamnesis.framingham,
        assessment.anamnesis.advancedQuestionnaire,
        assessment.anamnesis.fullQuestionnaire,
      ].filter(Boolean).length
    : 0;

  // Anthropometry has 5 sub-modules
  const anthropometryFields = assessment.anthropometry
    ? [
        assessment.anthropometry.perimeters,
        assessment.anthropometry.diameters,
        assessment.anthropometry.weight || assessment.anthropometry.height,
        assessment.anthropometry.bodyComposition,
        assessment.anthropometry.somatotype,
      ].filter(Boolean).length
    : 0;

  // Clinical has 4 sub-modules
  const clinicalFields = assessment.clinicalExams
    ? [
        assessment.clinicalExams.cardiacExam,
        assessment.clinicalExams.bloodCount,
        assessment.clinicalExams.posturalExam,
        assessment.clinicalExams.otherExams,
      ].filter(Boolean).length
    : 0;

  // Tests has 2 sub-modules
  const testFields = assessment.fitnessTests
    ? [
        assessment.fitnessTests.vo2Predictive,
        assessment.fitnessTests.vo2Max,
      ].filter(Boolean).length
    : 0;

  return [
    {
      id: "objetivo",
      label: "Objetivo",
      description: "Metas e disponibilidade",
      icon: Target,
      href: `/app/avaliacoes/${assessment.id}/objetivo`,
      progress: assessment.objective ? 100 : 0,
      color: "text-info bg-info/10",
    },
    {
      id: "anamnese",
      label: "Anamnese",
      description: `${anamnesisFields}/6 modulos`,
      icon: Heart,
      href: `/app/avaliacoes/${assessment.id}/anamnese`,
      progress: Math.round((anamnesisFields / 6) * 100),
      color: "text-rose-500 bg-rose-500/10",
    },
    {
      id: "antropometria",
      label: "Antropometria",
      description: `${anthropometryFields}/5 modulos`,
      icon: Ruler,
      href: `/app/avaliacoes/${assessment.id}/antropometria`,
      progress: Math.round((anthropometryFields / 5) * 100),
      color: "text-warning bg-warning/10",
    },
    {
      id: "exames",
      label: "Exames Clinicos",
      description: `${clinicalFields}/4 modulos`,
      icon: Stethoscope,
      href: `/app/avaliacoes/${assessment.id}/exames`,
      progress: Math.round((clinicalFields / 4) * 100),
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      id: "testes",
      label: "Testes Fisicos",
      description: `${testFields}/2 testes`,
      icon: Activity,
      href: `/app/avaliacoes/${assessment.id}/testes`,
      progress: Math.round((testFields / 2) * 100),
      color: "text-primary bg-primary/10",
    },
  ];
}

const POPULATION_LABELS: Record<string, string> = {
  NORMAL: "Normal",
  ATHLETE: "Atleta",
  ELDERLY: "Idoso",
  CHILD: "Crianca",
  PREGNANT: "Gestante",
};

// ── Component ────────────────────────────────────────────────────────────────
export function AssessmentHub({ assessment }: { assessment: AssessmentData }) {
  const sections = getSections(assessment);

  const totalProgress = Math.round(
    sections.reduce((sum, s) => sum + s.progress, 0) / sections.length
  );

  const age = assessment.client.birthDate
    ? differenceInYears(new Date(), new Date(assessment.client.birthDate))
    : null;

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* ── Client Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
        <Avatar className="size-12">
          <AvatarImage src={assessment.client.photo ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
            {assessment.client.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {assessment.client.name}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            <Badge variant="outline" className="text-[0.65rem] px-1.5 py-0">
              {POPULATION_LABELS[assessment.population] ?? assessment.population}
            </Badge>
            {age && (
              <span className="text-xs text-muted-foreground">{age} anos</span>
            )}
            {assessment.modality && (
              <span className="text-xs text-muted-foreground">· {assessment.modality}</span>
            )}
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <ProgressRing progress={totalProgress} size={48} strokeWidth={3.5} />
          <span className="absolute text-[0.6rem] font-bold text-foreground">
            {totalProgress}%
          </span>
        </div>
      </div>

      {/* ── Status ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Modulos da avaliacao
        </p>
        <Badge
          variant="outline"
          className={cn(
            "text-[0.65rem]",
            assessment.status === "COMPLETE"
              ? "border-success/30 text-success"
              : "border-warning/30 text-warning"
          )}
        >
          {assessment.status === "COMPLETE" ? "Completa" : "Rascunho"}
        </Badge>
      </div>

      {/* ── Section Cards ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.id}
              href={section.href}
              className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card active:bg-accent transition-colors"
            >
              {/* Progress Ring with Icon */}
              <div className="relative flex items-center justify-center">
                <ProgressRing progress={section.progress} size={52} strokeWidth={3} />
                <div className={cn("absolute flex items-center justify-center size-8 rounded-lg", section.color)}>
                  <Icon className="size-4" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{section.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {section.description}
                </p>
              </div>

              {/* Percentage + Arrow */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    "text-xs font-bold tabular-nums",
                    section.progress === 100 ? "text-success" : "text-muted-foreground"
                  )}
                >
                  {section.progress}%
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Metadata ──────────────────────────────────────────────────── */}
      <p className="text-xs text-muted-foreground text-center">
        Criada em{" "}
        {format(new Date(assessment.createdAt), "dd 'de' MMMM 'de' yyyy", {
          locale: ptBR,
        })}
      </p>
    </div>
  );
}
