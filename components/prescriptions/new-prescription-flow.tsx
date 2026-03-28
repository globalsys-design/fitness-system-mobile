"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dumbbell,
  Wind,
  Plus,
  Trash2,
  Loader2,
  ChevronRight,
  Check,
} from "lucide-react";
import {
  AEROBIC_MODALITY_OPTIONS,
  INTENSITY_OPTIONS,
  FREQUENCY_OPTIONS,
} from "@/lib/constants/prescription";

interface Client {
  id: string;
  name: string;
  photo: string | null;
}

interface Exercise {
  name: string;
  series: number;
  repetitions: string;
  load: string;
  rest: string;
  observations?: string;
}

type Step = "client" | "type" | "training" | "aerobic";

interface NewPrescriptionFlowProps {
  clients: Client[];
  appointmentId?: string;
  preSelectedClientId?: string;
}


export function NewPrescriptionFlow({
  clients,
  appointmentId,
  preSelectedClientId,
}: NewPrescriptionFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("client");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [prescriptionType, setPrescriptionType] = useState<"TRAINING" | "AEROBIC" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-select client if coming from calendar with preSelectedClientId
  useEffect(() => {
    if (preSelectedClientId && clients.length > 0) {
      const client = clients.find((c) => c.id === preSelectedClientId);
      if (client) {
        setSelectedClient(client);
        setStep("type");
      }
    }
  }, [preSelectedClientId, clients]);

  // Training state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newExercise, setNewExercise] = useState<Exercise>({
    name: "",
    series: 3,
    repetitions: "12",
    load: "10kg",
    rest: "60s",
    observations: "",
  });
  const [showExerciseForm, setShowExerciseForm] = useState(false);

  // Aerobic state
  const [aerobicData, setAerobicData] = useState<{
    modality: string;
    intensity: string;
    duration: number;
    frequency: string;
    speed: string;
    rpm: string;
    notes: string;
  }>({
    modality: "running",
    intensity: "moderate",
    duration: 30,
    frequency: "3x-week",
    speed: "",
    rpm: "",
    notes: "",
  });

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setStep("type");
  };

  const handleSelectType = (type: "TRAINING" | "AEROBIC") => {
    setPrescriptionType(type);
    setStep(type === "TRAINING" ? "training" : "aerobic");
  };

  const handleAddExercise = () => {
    if (!newExercise.name.trim()) return;
    setExercises([...exercises, { ...newExercise }]);
    setNewExercise({
      name: "",
      series: 3,
      repetitions: "12",
      load: "10kg",
      rest: "60s",
      observations: "",
    });
    setShowExerciseForm(false);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedClient || !prescriptionType) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const body: any = {
        clientId: selectedClient.id,
        type: prescriptionType,
        ...(appointmentId && { appointmentId }),
      };

      if (prescriptionType === "TRAINING") {
        body.exercises = exercises;
      } else {
        body.aerobicData = {
          ...aerobicData,
          duration: Number(aerobicData.duration),
          speed: aerobicData.speed ? Number(aerobicData.speed) : undefined,
          rpm: aerobicData.rpm ? Number(aerobicData.rpm) : undefined,
        };
      }

      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar prescrição");
      }

      const prescription = await res.json();
      router.push(`/app/prescricoes/${prescription.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar prescrição");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Step indicators ───
  const steps = ["client", "type", prescriptionType === "AEROBIC" ? "aerobic" : "training"];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="p-4 flex flex-col gap-4 pb-32">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {["Cliente", "Tipo", "Detalhes"].map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                i <= currentStepIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < currentStepIndex ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span
              className={`text-xs ${
                i <= currentStepIndex ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < 2 && <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />}
          </div>
        ))}
      </div>

      {/* ─── STEP 1: Select Client ─── */}
      {step === "client" && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">Selecione o Cliente</h2>
          {clients.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">Nenhum cliente cadastrado</p>
                <Button size="sm" onClick={() => router.push("/app/usuarios/clientes/novo")}>
                  <Plus className="w-4 h-4 mr-1" /> Cadastrar Cliente
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  className="flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-accent transition-colors text-left"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={client.photo ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {client.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground text-sm flex-1">{client.name}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── STEP 2: Select Type ─── */}
      {step === "type" && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">Tipo de Prescrição</h2>
          <p className="text-sm text-muted-foreground">
            Para <strong>{selectedClient?.name}</strong>
          </p>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button onClick={() => handleSelectType("TRAINING")} className="group">
              <Card className="bg-card border-border hover:border-primary/50 transition-all h-full">
                <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                  <div className="p-3 bg-primary/10 group-hover:bg-primary/20 rounded-lg transition-colors">
                    <Dumbbell className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Ficha de Treino</h3>
                    <p className="text-xs text-muted-foreground mt-1">Musculação</p>
                  </div>
                </CardContent>
              </Card>
            </button>

            <button onClick={() => handleSelectType("AEROBIC")} className="group">
              <Card className="bg-card border-border hover:border-primary/50 transition-all h-full">
                <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                  <div className="p-3 bg-primary/10 group-hover:bg-primary/20 rounded-lg transition-colors">
                    <Wind className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Aeróbico</h3>
                    <p className="text-xs text-muted-foreground mt-1">Cardio</p>
                  </div>
                </CardContent>
              </Card>
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 3A: Training Exercises ─── */}
      {step === "training" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Exercícios</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedClient?.name} · Ficha de Treino
              </p>
            </div>
            <Badge variant="outline">{exercises.length} exercícios</Badge>
          </div>

          {/* Exercise List */}
          {exercises.map((exercise, index) => (
            <Card key={index}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full shrink-0">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {exercise.series}x{exercise.repetitions} · {exercise.load} · {exercise.rest}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={() => handleRemoveExercise(index)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Exercise Form */}
          {showExerciseForm ? (
            <Card className="border-primary/30">
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label className="text-xs">Nome do Exercício</Label>
                  <Input
                    placeholder="Ex: Supino Reto"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Séries</Label>
                    <Input
                      type="number"
                      value={newExercise.series}
                      onChange={(e) =>
                        setNewExercise({ ...newExercise, series: Number(e.target.value) })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Repetições</Label>
                    <Input
                      placeholder="12"
                      value={newExercise.repetitions}
                      onChange={(e) =>
                        setNewExercise({ ...newExercise, repetitions: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Carga</Label>
                    <Input
                      placeholder="10kg"
                      value={newExercise.load}
                      onChange={(e) => setNewExercise({ ...newExercise, load: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Descanso</Label>
                    <Input
                      placeholder="60s"
                      value={newExercise.rest}
                      onChange={(e) => setNewExercise({ ...newExercise, rest: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Observações (opcional)</Label>
                  <Input
                    placeholder="Ex: Pegada pronada..."
                    value={newExercise.observations}
                    onChange={(e) =>
                      setNewExercise({ ...newExercise, observations: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setShowExerciseForm(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleAddExercise} className="flex-1" disabled={!newExercise.name.trim()}>
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button variant="outline" className="border-dashed" onClick={() => setShowExerciseForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Exercício
            </Button>
          )}
        </div>
      )}

      {/* ─── STEP 3B: Aerobic Config ─── */}
      {step === "aerobic" && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Prescrição Aeróbica</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedClient?.name} · Aeróbico
            </p>
          </div>

          {/* Modality */}
          <div>
            <Label className="text-xs font-semibold mb-2 block">Modalidade</Label>
            <div className="grid grid-cols-4 gap-2">
              {AEROBIC_MODALITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAerobicData({ ...aerobicData, modality: opt.value })}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all text-center ${
                    aerobicData.modality === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span className="text-[0.6rem] font-medium leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Intensidade</Label>
              <Select
                value={aerobicData.intensity || "moderate"}
                onValueChange={(v) => setAerobicData({ ...aerobicData, intensity: v || "moderate" })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTENSITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Frequência</Label>
              <Select
                value={aerobicData.frequency}
                onValueChange={(v) => setAerobicData({ ...aerobicData, frequency: v || "3x-week" })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Duração: {aerobicData.duration} min</Label>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={aerobicData.duration}
              onChange={(e) =>
                setAerobicData({ ...aerobicData, duration: Number(e.target.value) })
              }
              className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer mt-2"
            />
          </div>

          <div>
            <Label className="text-xs">Observações (opcional)</Label>
            <textarea
              placeholder="Notas adicionais..."
              value={aerobicData.notes}
              onChange={(e) => setAerobicData({ ...aerobicData, notes: e.target.value })}
              rows={2}
              className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Sticky Submit */}
      {(step === "training" || step === "aerobic") && (
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 bg-background/80 backdrop-blur-sm border-t border-border pt-3">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Button
              variant="outline"
              onClick={() => setStep("type")}
            >
              Voltar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting || (step === "training" && exercises.length === 0)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Finalizar Prescrição"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
