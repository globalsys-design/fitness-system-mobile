"use client";

import { differenceInYears } from "date-fns";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Target,
  Heart,
  Ruler,
  Stethoscope,
  Activity,
  Download,
  User,
  Scale,
  Percent,
  TrendingUp,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// ── Progress Bar ─────────────────────────────────────────────────────────────
function ResultBar({
  label,
  value,
  max,
  unit,
  color = "bg-primary",
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-xs font-bold text-foreground tabular-nums">
          {value} {unit}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: typeof Scale;
  label: string;
  value: string | number | null;
  unit: string;
  color: string;
}) {
  if (value == null) return null;
  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl border border-border bg-card">
      <div className={cn("size-9 rounded-xl flex items-center justify-center", color)}>
        <Icon className="size-4" />
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-[0.6rem] font-medium text-muted-foreground">{unit}</p>
      </div>
    </div>
  );
}

// ── Classification Badge ─────────────────────────────────────────────────────
function ClassificationBadge({ classification }: { classification: string | null }) {
  if (!classification) return null;

  const colorMap: Record<string, string> = {
    Superior: "bg-success/10 text-success border-success/20",
    Excelente: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Bom: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    Regular: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Fraco: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    "Muito Fraco": "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border",
        colorMap[classification] ?? "bg-muted text-muted-foreground border-border"
      )}
    >
      {classification}
    </span>
  );
}

// ── Section Header ───────────────────────────────────────────────────────────
function SectionIcon({
  icon: Icon,
  color,
}: {
  icon: typeof Target;
  color: string;
}) {
  return (
    <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0 mr-3", color)}>
      <Icon className="size-4" />
    </div>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────
interface ReportAssessment {
  id: string;
  population: string;
  modality: string | null;
  status: string;
  createdAt: string;
  client: {
    name: string;
    gender: string | null;
    birthDate: string | null;
    photo: string | null;
  };
  professional: {
    name: string;
    specialty: string | null;
    cref: string | null;
    photo: string | null;
  };
  objective: any | null;
  anamnesis: any | null;
  anthropometry: any | null;
  clinicalExams: any | null;
  fitnessTests: any | null;
}

// ── Main Component ───────────────────────────────────────────────────────────
export function PublicReportView({ assessment }: { assessment: ReportAssessment }) {
  const age = assessment.client.birthDate
    ? differenceInYears(new Date(), new Date(assessment.client.birthDate))
    : null;

  const anthro = assessment.anthropometry;
  const tests = assessment.fitnessTests;
  const anamnesis = assessment.anamnesis;
  const clinical = assessment.clinicalExams;
  const objective = assessment.objective;

  // Extract key metrics
  const weight = anthro?.weight ?? null;
  const height = anthro?.height ?? null;
  const bmi = weight && height ? (weight / ((height / 100) ** 2)).toFixed(1) : null;
  const bodyComp = anthro?.bodyComposition as any;
  const fatPct = bodyComp?.fatPercentage ? parseFloat(bodyComp.fatPercentage) : null;
  const leanMass = bodyComp?.leanMass ? parseFloat(bodyComp.leanMass) : null;

  const vo2Max = tests?.vo2Max as any;
  const vo2Pred = tests?.vo2Predictive as any;
  const vo2Value = vo2Max?.vo2Result ?? vo2Pred?.result ?? null;
  const vo2Classification = vo2Max?.classification ?? vo2Pred?.classification ?? null;

  const perimeters = anthro?.perimeters as any;

  const handleDownloadPDF = () => {
    alert("A gerar PDF... Esta funcionalidade sera implementada em breve.");
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      {/* ── Hero Header ────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-primary/10 to-background px-4 pt-8 pb-6">
        {/* Professional branding */}
        <div className="flex items-center gap-2 mb-6">
          <Avatar className="size-8">
            <AvatarImage src={assessment.professional.photo ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {assessment.professional.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-semibold text-foreground">
              {assessment.professional.name}
            </p>
            <p className="text-[0.6rem] text-muted-foreground">
              {[assessment.professional.specialty, assessment.professional.cref]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>

        {/* Client info */}
        <div className="flex items-center gap-4">
          <Avatar className="size-16 border-2 border-primary/20">
            <AvatarImage src={assessment.client.photo ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              {assessment.client.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {assessment.client.name}
            </h1>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              {age && (
                <Badge variant="outline" className="text-[0.6rem]">
                  {age} anos
                </Badge>
              )}
              {assessment.client.gender && (
                <Badge variant="outline" className="text-[0.6rem]">
                  {assessment.client.gender === "M" ? "Masculino" : "Feminino"}
                </Badge>
              )}
              <Badge variant="outline" className="text-[0.6rem]">
                {assessment.population}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {format(new Date(assessment.createdAt), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Summary ────────────────────────────────────────── */}
      {(weight || fatPct || vo2Value) && (
        <div className="px-4 pb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Resumo
          </p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Scale}
              label="Peso"
              value={weight}
              unit="kg"
              color="text-blue-500 bg-blue-500/10"
            />
            {bmi && (
              <StatCard
                icon={TrendingUp}
                label="IMC"
                value={bmi}
                unit="kg/m2"
                color="text-amber-500 bg-amber-500/10"
              />
            )}
            {fatPct != null && (
              <StatCard
                icon={Percent}
                label="Gordura"
                value={fatPct.toFixed(1)}
                unit="%"
                color="text-rose-500 bg-rose-500/10"
              />
            )}
            {vo2Value && (
              <StatCard
                icon={Activity}
                label="VO2"
                value={parseFloat(vo2Value).toFixed(1)}
                unit="ml/kg/min"
                color="text-primary bg-primary/10"
              />
            )}
          </div>
        </div>
      )}

      {/* ── Progressive Disclosure Sections ─────────────────────────────── */}
      <div className="px-4">
        <Accordion>
          {/* ── Objetivo ──────────────────────────────────────────────── */}
          {objective && (
            <AccordionItem value="objetivo" className="border-b border-border">
              <AccordionTrigger className="py-4">
                <SectionIcon icon={Target} color="text-blue-500 bg-blue-500/10" />
                <span className="flex-1 text-sm font-semibold">Objetivo e Disponibilidade</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-11 pb-4 flex flex-col gap-3">
                  {objective.goals && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Metas</p>
                      <p className="text-sm text-foreground">
                        {typeof objective.goals === "string"
                          ? objective.goals
                          : JSON.stringify(objective.goals)}
                      </p>
                    </div>
                  )}
                  {objective.availability && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Disponibilidade
                      </p>
                      <p className="text-sm text-foreground">
                        {typeof objective.availability === "string"
                          ? objective.availability
                          : JSON.stringify(objective.availability)}
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* ── Anamnese ──────────────────────────────────────────────── */}
          {anamnesis && (
            <AccordionItem value="anamnese" className="border-b border-border">
              <AccordionTrigger className="py-4">
                <SectionIcon icon={Heart} color="text-rose-500 bg-rose-500/10" />
                <span className="flex-1 text-sm font-semibold">Anamnese</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-11 pb-4 flex flex-col gap-4">
                  {anamnesis.basalParameters && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Parametros Basais
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(anamnesis.basalParameters as Record<string, any>).map(
                          ([key, val]) =>
                            val != null && (
                              <div key={key} className="flex flex-col p-2 rounded-lg bg-muted/30">
                                <span className="text-[0.6rem] text-muted-foreground capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                  {String(val)}
                                </span>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  )}
                  {anamnesis.parq && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">PAR-Q+</p>
                      <Badge variant="outline" className="text-xs">
                        Preenchido
                      </Badge>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* ── Antropometria ─────────────────────────────────────────── */}
          {anthro && (
            <AccordionItem value="antropometria" className="border-b border-border">
              <AccordionTrigger className="py-4">
                <SectionIcon icon={Ruler} color="text-amber-500 bg-amber-500/10" />
                <span className="flex-1 text-sm font-semibold">Antropometria</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-11 pb-4 flex flex-col gap-5">
                  {/* Weight & Height */}
                  {(weight || height) && (
                    <div className="grid grid-cols-2 gap-3">
                      {weight && (
                        <div className="p-3 rounded-xl bg-muted/30 border border-border">
                          <p className="text-[0.6rem] text-muted-foreground">Peso</p>
                          <p className="text-lg font-bold text-foreground">{weight} kg</p>
                        </div>
                      )}
                      {height && (
                        <div className="p-3 rounded-xl bg-muted/30 border border-border">
                          <p className="text-[0.6rem] text-muted-foreground">Estatura</p>
                          <p className="text-lg font-bold text-foreground">{height} cm</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Body composition */}
                  {bodyComp && (
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Composicao Corporal
                      </p>
                      {fatPct != null && (
                        <ResultBar
                          label="Gordura corporal"
                          value={fatPct}
                          max={40}
                          unit="%"
                          color="bg-rose-500"
                        />
                      )}
                      {leanMass != null && (
                        <ResultBar
                          label="Massa magra"
                          value={leanMass}
                          max={weight ?? 100}
                          unit="kg"
                          color="bg-emerald-500"
                        />
                      )}
                    </div>
                  )}

                  {/* Perimeters */}
                  {perimeters && (
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-semibold text-muted-foreground">Perimetros</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(perimeters as Record<string, any>).map(
                          ([key, val]) =>
                            val != null &&
                            typeof val === "number" && (
                              <div
                                key={key}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                              >
                                <span className="text-[0.6rem] text-muted-foreground capitalize truncate">
                                  {key.replace(/([A-Z])/g, " $1")}
                                </span>
                                <span className="text-xs font-bold text-foreground tabular-nums">
                                  {val} cm
                                </span>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* ── Exames Clinicos ────────────────────────────────────────── */}
          {clinical && (
            <AccordionItem value="exames" className="border-b border-border">
              <AccordionTrigger className="py-4">
                <SectionIcon icon={Stethoscope} color="text-emerald-500 bg-emerald-500/10" />
                <span className="flex-1 text-sm font-semibold">Exames Clinicos</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-11 pb-4 flex flex-col gap-3">
                  {clinical.cardiacExam && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Exame Cardiaco
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(clinical.cardiacExam as Record<string, any>).map(
                          ([key, val]) =>
                            val != null && (
                              <div key={key} className="p-2 rounded-lg bg-muted/30">
                                <span className="text-[0.6rem] text-muted-foreground capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}
                                </span>
                                <p className="text-sm font-medium text-foreground">{String(val)}</p>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  )}
                  {clinical.bloodCount && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Hemograma
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Preenchido
                      </Badge>
                    </div>
                  )}
                  {clinical.posturalExam && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Exame Postural
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Preenchido
                      </Badge>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* ── Testes Fisicos ─────────────────────────────────────────── */}
          {tests && (vo2Max || vo2Pred) && (
            <AccordionItem value="testes" className="border-b border-border">
              <AccordionTrigger className="py-4">
                <SectionIcon icon={Activity} color="text-primary bg-primary/10" />
                <span className="flex-1 text-sm font-semibold">Testes Fisicos</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-11 pb-4 flex flex-col gap-4">
                  {/* VO2 Max */}
                  {vo2Max && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-muted-foreground">VO2 Maximo</p>
                        <ClassificationBadge classification={vo2Max.classification ?? null} />
                      </div>
                      {vo2Max.vo2Result && (
                        <ResultBar
                          label="VO2max"
                          value={parseFloat(vo2Max.vo2Result)}
                          max={70}
                          unit="ml/kg/min"
                          color="bg-primary"
                        />
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        {vo2Max.protocol && (
                          <div className="p-2 rounded-lg bg-muted/30">
                            <span className="text-[0.6rem] text-muted-foreground">Protocolo</span>
                            <p className="text-sm font-medium text-foreground">{vo2Max.protocol}</p>
                          </div>
                        )}
                        {vo2Max.maxHR && (
                          <div className="p-2 rounded-lg bg-muted/30">
                            <span className="text-[0.6rem] text-muted-foreground">FC Max</span>
                            <p className="text-sm font-medium text-foreground">
                              {vo2Max.maxHR} bpm
                            </p>
                          </div>
                        )}
                        {vo2Max.testDuration && (
                          <div className="p-2 rounded-lg bg-muted/30">
                            <span className="text-[0.6rem] text-muted-foreground">Duracao</span>
                            <p className="text-sm font-medium text-foreground">
                              {vo2Max.testDuration}
                            </p>
                          </div>
                        )}
                        {vo2Max.ergometer && (
                          <div className="p-2 rounded-lg bg-muted/30">
                            <span className="text-[0.6rem] text-muted-foreground">Ergometro</span>
                            <p className="text-sm font-medium text-foreground">
                              {vo2Max.ergometer}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* VO2 Predictive */}
                  {vo2Pred && !vo2Max && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-muted-foreground">
                          VO2 Preditivo
                        </p>
                        <ClassificationBadge classification={vo2Pred.classification ?? null} />
                      </div>
                      {vo2Pred.result && (
                        <ResultBar
                          label="VO2 estimado"
                          value={parseFloat(vo2Pred.result)}
                          max={70}
                          unit="ml/kg/min"
                          color="bg-primary"
                        />
                      )}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>

      {/* ── Sticky CTA ─────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-md z-50"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="w-full h-14 rounded-full font-bold text-lg bg-primary text-primary-foreground active:scale-[0.97] transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
        >
          <Download className="size-5" />
          Baixar versao em PDF
        </button>
      </div>
    </div>
  );
}
