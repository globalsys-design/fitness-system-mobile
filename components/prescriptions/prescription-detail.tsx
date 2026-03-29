"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Activity, Trash2, Copy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PDFDownloadButton } from "./pdf-download-button";

interface Exercise {
  name: string;
  series: number;
  repetitions: string;
  load: string;
  rest: string;
  observations?: string;
}

interface PrescriptionDetailProps {
  prescription: {
    id: string;
    type: string;
    content: any;
    createdAt: Date;
    client: { id: string; name: string; photo: string | null; gender: string | null };
    trainingSheet: { id: string; exercises: any; aerobics: any } | null;
  };
  professionalName?: string;
}

export function PrescriptionDetail({
  prescription,
  professionalName = "Profissional",
}: PrescriptionDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const exercises: Exercise[] = Array.isArray(prescription.trainingSheet?.exercises)
    ? prescription.trainingSheet.exercises
    : [];

  const aerobicData = prescription.content as Record<string, any> | null;

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta prescrição?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/prescriptions/${prescription.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/app/prescricoes");
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: prescription.client.id,
          type: prescription.type,
          exercises: exercises.length > 0 ? exercises : undefined,
          aerobicData: aerobicData || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/app/prescricoes/${data.id}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Error duplicating:", error);
    }
  };

  const intensityLabels: Record<string, string> = {
    low: "Baixa", moderate: "Moderada", high: "Alta", "very-high": "Muito Alta",
  };
  const frequencyLabels: Record<string, string> = {
    daily: "Diária", "3x-week": "3x/semana", "4x-week": "4x/semana",
    "5x-week": "5x/semana", "6x-week": "6x/semana",
  };
  const modalityLabels: Record<string, string> = {
    bike: "Bicicleta", running: "Corrida", swimming: "Natação",
    elliptical: "Elíptico", rowing: "Remo", walking: "Caminhada",
    treadmill: "Esteira", "jump-rope": "Pular Corda",
  };

  return (
    <div className="p-4 flex flex-col gap-4 pb-24">
      {/* Client Info */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={prescription.client.photo ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {prescription.client.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{prescription.client.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-xs">
                {prescription.type === "TRAINING" ? "Ficha de Treino" : "Aeróbico"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(prescription.createdAt), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Exercises */}
      {prescription.type === "TRAINING" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">
                Exercícios ({exercises.length})
              </h3>
            </div>
          </div>
          {exercises.length > 0 ? (
            <div className="flex flex-col gap-3">
              {exercises.map((exercise, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 bg-primary/10 rounded-full">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">{exercise.name}</h4>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <p className="text-[0.65rem] font-medium text-muted-foreground uppercase">Séries</p>
                        <p className="text-sm font-bold text-foreground">{exercise.series}x</p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] font-medium text-muted-foreground uppercase">Reps</p>
                        <p className="text-sm font-bold text-foreground">{exercise.repetitions}</p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] font-medium text-muted-foreground uppercase">Carga</p>
                        <p className="text-sm font-bold text-foreground">{exercise.load}</p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] font-medium text-muted-foreground uppercase">Desc.</p>
                        <p className="text-sm font-bold text-foreground">{exercise.rest}</p>
                      </div>
                    </div>
                    {exercise.observations && (
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                        {exercise.observations}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Nenhum exercício cadastrado</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Aerobic Info */}
      {prescription.type === "AEROBIC" && aerobicData && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Treino Aeróbico</h3>
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {aerobicData.modality && (
                  <div>
                    <p className="text-[0.65rem] font-medium text-muted-foreground uppercase">Modalidade</p>
                    <p className="text-sm font-semibold text-foreground">
                      {modalityLabels[aerobicData.modality] || aerobicData.modality}
                    </p>
                  </div>
                )}
                {aerobicData.intensity && (
                  <div>
                    <p className="text-[0.65rem] font-medium text-muted-foreground uppercase">Intensidade</p>
                    <p className="text-sm font-semibold text-foreground">
                      {intensityLabels[aerobicData.intensity] || aerobicData.intensity}
                    </p>
                  </div>
                )}
                {aerobicData.duration && (
                  <div>
                    <p className="text-[0.65rem] font-medium text-muted-foreground uppercase">Duração</p>
                    <p className="text-sm font-semibold text-foreground">{aerobicData.duration} min</p>
                  </div>
                )}
                {aerobicData.frequency && (
                  <div>
                    <p className="text-[0.65rem] font-medium text-muted-foreground uppercase">Frequência</p>
                    <p className="text-sm font-semibold text-foreground">
                      {frequencyLabels[aerobicData.frequency] || aerobicData.frequency}
                    </p>
                  </div>
                )}
              </div>
              {aerobicData.notes && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[0.65rem] font-medium text-muted-foreground uppercase mb-1">Observações</p>
                  <p className="text-sm text-foreground">{aerobicData.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons — Sticky bar */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 bg-background/80 backdrop-blur-sm border-t border-border pt-3">
        <div className="flex gap-2 max-w-4xl mx-auto">
          {/* PDF Download */}
          <PDFDownloadButton
            prescription={prescription}
            professionalName={professionalName}
            variant="default"
            size="sm"
            className="h-10 flex-1"
          />
          {/* Duplicate */}
          <Button
            variant="outline"
            size="sm"
            className="h-10 text-xs gap-1.5 flex-1"
            onClick={handleDuplicate}
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicar
          </Button>
          {/* Delete */}
          <Button
            variant="destructive"
            size="sm"
            className="h-10 text-xs gap-1.5 px-4"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? "..." : "Excluir"}
          </Button>
        </div>
      </div>
    </div>
  );
}
