"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Dumbbell, Wind, ChevronRight, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListEmptyState } from "@/components/lists/list-header";
import { FAB } from "@/components/mobile/fab";
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
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("todas");

  const filtered = prescriptions.filter((p) =>
    p.client.name.toLowerCase().includes(search.toLowerCase())
  );
  const training = filtered.filter((p) => p.type === "TRAINING");
  const aerobic  = filtered.filter((p) => p.type === "AEROBIC");

  const countByTab = { todas: filtered.length, treino: training.length, aerobico: aerobic.length };
  const countLabel = countByTab[tab as keyof typeof countByTab];

  /* ── Prescription Card ─────────────────────────────────────────── */
  const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => {
    const isTraining = prescription.type === "TRAINING";
    const TypeIcon   = isTraining ? Dumbbell : Wind;
    return (
      <Link
        href={`/app/prescricoes/${prescription.id}`}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-accent/50 active:bg-accent transition-colors"
      >
        <Avatar className="w-11 h-11 flex-shrink-0">
          <AvatarImage src={prescription.client.photo ?? undefined} />
          <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
            {prescription.client.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm truncate">
            {prescription.client.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(prescription.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className="text-xs gap-1">
            <TypeIcon className="w-3 h-3" />
            {isTraining ? "Treino" : "Aeróbico"}
          </Badge>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </Link>
    );
  };

  const EmptyState = ({ message }: { message?: string }) => (
    <ListEmptyState
      icon={<Dumbbell className="w-8 h-8 text-muted-foreground" />}
      message={message ?? "Nenhuma prescrição encontrada"}
      isFiltered={!!search}
    />
  );

  const CardList = ({ items }: { items: Prescription[] }) => (
    <div className="w-full flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
      {items.map((p) => <PrescriptionCard key={p.id} prescription={p} />)}
    </div>
  );

  return (
    /* CONTAINER PAI: h-full + overflow-hidden âncora a altura para flex-1 funcionar */
    <div className="flex flex-col h-full overflow-hidden">
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col h-full overflow-hidden">

        {/* CABEÇALHO FIXO: shrink-0 = nunca encolhe, é o "teto" inamovível */}
        <div className="shrink-0 bg-background z-10 px-4 pt-4 pb-2 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar prescrições..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
          <TabsList className="w-full h-10">
            <TabsTrigger value="todas"    className="flex-1 text-xs">Todas ({filtered.length})</TabsTrigger>
            <TabsTrigger value="treino"   className="flex-1 text-xs">Treino ({training.length})</TabsTrigger>
            <TabsTrigger value="aerobico" className="flex-1 text-xs">Aeróbico ({aerobic.length})</TabsTrigger>
          </TabsList>
          {countLabel > 0 && (
            <p className="text-xs text-muted-foreground px-1">
              {countLabel} {countLabel === 1 ? "prescrição" : "prescrições"}
            </p>
          )}
        </div>

        {/* SCROLL ISOLADO: flex-1 ocupa só o espaço restante, pb-32 = segurança bottom nav */}
        <TabsContent value="todas"    className="flex-1 overflow-y-auto min-h-0 mt-0 px-4 pt-2 pb-32">
          {filtered.length === 0 ? <EmptyState /> : <CardList items={filtered} />}
        </TabsContent>
        <TabsContent value="treino"   className="flex-1 overflow-y-auto min-h-0 mt-0 px-4 pt-2 pb-32">
          {training.length === 0 ? <EmptyState message="Nenhuma ficha de treino encontrada" /> : <CardList items={training} />}
        </TabsContent>
        <TabsContent value="aerobico" className="flex-1 overflow-y-auto min-h-0 mt-0 px-4 pt-2 pb-32">
          {aerobic.length === 0 ? <EmptyState message="Nenhuma prescrição aeróbica encontrada" /> : <CardList items={aerobic} />}
        </TabsContent>

      </Tabs>

      <FAB icon={Plus} onClick={() => router.push("/app/prescricoes/nova")} label="Nova Prescrição" />
    </div>
  );
}
