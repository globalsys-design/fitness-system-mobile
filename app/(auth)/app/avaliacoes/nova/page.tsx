"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileHeader } from "@/components/mobile/mobile-header";

export default function NovaAvaliacaoPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Array<{id: string; name: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clientId, setClientId] = useState("");
  const [population, setPopulation] = useState("NORMAL");
  const [modality, setModality] = useState("");

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients).catch(() => {});
  }, []);

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
        body: JSON.stringify({ clientId, population, modality }),
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
        <div>
          <Label>Cliente avaliado *</Label>
          <Select value={clientId} onValueChange={(v) => { if (v !== null) setClientId(v); }}>
            <SelectTrigger className="h-12 mt-1.5">
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
            <SelectTrigger className="h-12 mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="ATHLETE">Atleta</SelectItem>
              <SelectItem value="ELDERLY">Idoso</SelectItem>
              <SelectItem value="CHILD">Criança</SelectItem>
              <SelectItem value="PREGNANT">Gestante</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Modalidade</Label>
          <Select value={modality} onValueChange={(v) => { if (v !== null) setModality(v); }}>
            <SelectTrigger className="h-12 mt-1.5">
              <SelectValue placeholder="Selecione (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Atletismo">Atletismo</SelectItem>
              <SelectItem value="Futebol">Futebol</SelectItem>
              <SelectItem value="Musculação">Musculação</SelectItem>
              <SelectItem value="Basquete">Basquete</SelectItem>
              <SelectItem value="Beach Tênis">Beach Tênis</SelectItem>
              <SelectItem value="Natação">Natação</SelectItem>
              <SelectItem value="Outras">Outras modalidades</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className="px-4 py-4 border-t border-border bg-background"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <Button className="h-12 w-full text-base" onClick={handleSubmit} disabled={isLoading || !clientId}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Criar avaliação
        </Button>
      </div>
    </div>
  );
}
