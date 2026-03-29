"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [modality, setModality] = useState("");

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
    setIsLoading(true);
    try {
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          population,
          modality,
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
          <Label>Modalidade</Label>
          <Select value={modality} onValueChange={(v) => { if (v !== null) setModality(v); }}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Selecione (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {MODALITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
