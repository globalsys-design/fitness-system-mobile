"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Calendar, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelectSheet } from "@/components/ui/multi-select-sheet";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { POPULATION_OPTIONS, MODALITY_OPTIONS } from "@/lib/constants/assessment";

interface Client {
  id: string;
  name: string;
}

export default function NovaAvaliacaoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parâmetros do Calendário
  const appointmentId = searchParams.get("appointmentId");
  const clientIdFromCalendar = searchParams.get("clientId");

  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clientId, setClientId] = useState("");
  const [population, setPopulation] = useState("NORMAL");
  const [modalities, setModalities] = useState<string[]>([]);

  // Agendar próxima avaliação
  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextDate, setNextDate] = useState("");
  const [nextStartTime, setNextStartTime] = useState("");
  const [nextEndTime, setNextEndTime] = useState("");

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClients(data);
          // Se vindo do calendário, pré-preencher cliente
          if (clientIdFromCalendar) {
            setClientId(clientIdFromCalendar);
          }
        }
      })
      .catch(() => {});
  }, [clientIdFromCalendar]);

  async function handleSubmit() {
    if (!clientId) {
      toast.error("Selecione um cliente");
      return;
    }
    if (scheduleNext) {
      if (!nextDate || !nextStartTime || !nextEndTime) {
        toast.error("Preencha data, hora de início e hora de fim do agendamento");
        return;
      }
      if (nextStartTime >= nextEndTime) {
        toast.error("Hora de fim deve ser posterior à hora de início");
        return;
      }
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          population,
          modalities,
          scheduleNext,
          ...(scheduleNext && { nextDate, nextStartTime, nextEndTime }),
          // Opcional: se vindo de um agendamento, enviar appointmentId
          ...(appointmentId && { appointmentId }),
        }),
      });
      if (!response.ok) throw new Error();
      const assessment = await response.json();
      toast.success("Avaliação criada!");
      router.push(`/app/avaliacoes/${assessment.id}`);
    } catch {
      toast.error("Erro ao criar avaliação.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col bg-background" style={{ height: "100dvh" }}>
      <MobileHeader title="Nova Avaliação" showBack />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {/* Info banner se vindo de agendamento */}
        {appointmentId && (
          <div className="px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Vinculado a um agendamento</span>
          </div>
        )}

        <div>
          <Label>Cliente avaliado *</Label>
          <Select value={clientId} onValueChange={(v) => { if (v !== null) setClientId(v); }}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>População</Label>
          <Select value={population} onValueChange={(v) => { if (v !== null) setPopulation(v); }}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POPULATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="modalities">Modalidades</Label>
          <div className="mt-1.5">
            <MultiSelectSheet
              id="modalities"
              options={MODALITY_OPTIONS}
              value={modalities}
              onChange={setModalities}
              placeholder="Selecione uma ou mais (opcional)"
              sheetTitle="Modalidades"
              searchPlaceholder="Buscar modalidade..."
              emptyMessage="Nenhuma modalidade encontrada"
            />
          </div>
        </div>

        {/* Bloco: agendar próxima avaliação */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
          <label className="flex items-start justify-between gap-3 cursor-pointer">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 text-primary shrink-0">
                <CalendarPlus className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Agendar próxima avaliação</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cria um evento no calendário após salvar
                </p>
              </div>
            </div>
            <Switch
              checked={scheduleNext}
              onCheckedChange={(v) => setScheduleNext(Boolean(v))}
              className="mt-0.5 shrink-0"
            />
          </label>

          {scheduleNext && (
            <div className="flex flex-col gap-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <Label htmlFor="nextDate">Data *</Label>
                <Input
                  id="nextDate"
                  type="date"
                  className="mt-1.5"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nextStartTime">Hora início *</Label>
                  <Input
                    id="nextStartTime"
                    type="time"
                    className="mt-1.5"
                    value={nextStartTime}
                    onChange={(e) => setNextStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nextEndTime">Hora fim *</Label>
                  <Input
                    id="nextEndTime"
                    type="time"
                    className="mt-1.5"
                    value={nextEndTime}
                    onChange={(e) => setNextEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="px-4 py-4 border-t border-border bg-background"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <Button className="w-full text-base" onClick={handleSubmit} disabled={isLoading || !clientId}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Criar avaliação
        </Button>
      </div>
    </div>
  );
}
