"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Dumbbell, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Prescription {
  id: string;
  type: string;
  createdAt: Date;
  client: { id: string; name: string; photo: string | null };
}

interface PrescriptionsListProps {
  prescriptions: Prescription[];
}

export function PrescriptionsList({ prescriptions }: PrescriptionsListProps) {
  const [search, setSearch] = useState("");

  const filtered = prescriptions.filter((p) =>
    p.client.name.toLowerCase().includes(search.toLowerCase())
  );

  const training = filtered.filter((p) => p.type === "TRAINING");
  const aerobic = filtered.filter((p) => p.type === "AEROBIC");

  const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => (
    <Link
      href={`/app/prescricoes/${prescription.id}`}
      className="flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-accent transition-colors"
    >
      <Avatar className="w-11 h-11 flex-shrink-0">
        <AvatarImage src={prescription.client.photo ?? undefined} />
        <AvatarFallback className="text-sm font-semibold bg-orange-500/10 text-orange-600">
          {prescription.client.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm truncate">{prescription.client.name}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(prescription.createdAt), "dd/MM/yyyy", { locale: ptBR })}
        </p>
      </div>
      <Badge variant="outline" className="text-xs flex-shrink-0">
        {prescription.type === "TRAINING" ? "Treino" : "Aeróbico"}
      </Badge>
    </Link>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
        <Dumbbell className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">Nenhuma prescrição encontrada</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar prescrições..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      <Tabs defaultValue="todas">
        <TabsList className="w-full h-10">
          <TabsTrigger value="todas" className="flex-1 text-xs">Todas ({filtered.length})</TabsTrigger>
          <TabsTrigger value="treino" className="flex-1 text-xs">Treino ({training.length})</TabsTrigger>
          <TabsTrigger value="aerobico" className="flex-1 text-xs">Aeróbico ({aerobic.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="mt-3">
          {filtered.length === 0 ? <EmptyState /> : (
            <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
              {filtered.map((p) => <PrescriptionCard key={p.id} prescription={p} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="treino" className="mt-3">
          {training.length === 0 ? <EmptyState /> : (
            <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
              {training.map((p) => <PrescriptionCard key={p.id} prescription={p} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="aerobico" className="mt-3">
          {aerobic.length === 0 ? <EmptyState /> : (
            <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
              {aerobic.map((p) => <PrescriptionCard key={p.id} prescription={p} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
