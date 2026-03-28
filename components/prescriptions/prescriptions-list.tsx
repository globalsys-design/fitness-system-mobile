"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dumbbell, Wind, ChevronRight, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListHeader, ListEmptyState } from "@/components/lists/list-header";
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

  const filtered = prescriptions.filter((p) =>
    p.client.name.toLowerCase().includes(search.toLowerCase())
  );

  const training = filtered.filter((p) => p.type === "TRAINING");
  const aerobic = filtered.filter((p) => p.type === "AEROBIC");

  /* ── Prescription Card ────────────────────────────────────────────── */
  /*
   * Layout Strategy:
   * - Link is flex container (items-center for vertical alignment)
   * - Avatar: flex-shrink-0 (never compress, 44px target)
   * - Info: flex-1 min-w-0 (grows to fill, allows truncate)
   * - Badge+Chevron: flex-shrink-0 (never compress, prevents cutoff)
   *
   * This ensures the card always spans full width and all
   * elements are visible without cutoff, even with long names.
   */
  const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => {
    const isTraining = prescription.type === "TRAINING";
    const TypeIcon = isTraining ? Dumbbell : Wind;

    return (
      <Link
        href={`/app/prescricoes/${prescription.id}`}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-accent/50 active:bg-accent transition-colors"
      >
        {/* Avatar — usando token semântico primary */}
        <Avatar className="w-11 h-11 flex-shrink-0">
          <AvatarImage src={prescription.client.photo ?? undefined} />
          <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
            {prescription.client.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Info — flex-1 com min-w-0 para truncate funcionar */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm truncate">
            {prescription.client.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(prescription.createdAt), "dd 'de' MMM, yyyy", {
              locale: ptBR,
            })}
          </p>
        </div>

        {/* Badge + Chevron — flex-shrink-0 para nunca comprimir */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge
            variant="outline"
            className="text-xs gap-1"
          >
            <TypeIcon className="w-3 h-3" />
            {isTraining ? "Treino" : "Aeróbico"}
          </Badge>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </Link>
    );
  };

  /* ── Empty State (usando componente padronizado) ───────────────────── */
  const EmptyState = ({ message }: { message?: string }) => (
    <ListEmptyState
      icon={<Dumbbell className="w-8 h-8 text-muted-foreground" />}
      message={message || "Nenhuma prescrição encontrada"}
      isFiltered={!!search}
    />
  );

  /* ── Card List ─────────────────────────────────────────────────────── */
  const CardList = ({ items }: { items: Prescription[] }) => (
    <div className="w-full flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
      {items.map((p) => (
        <PrescriptionCard key={p.id} prescription={p} />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col">
      <ListHeader
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar prescrições..."
        count={filtered.length}
        countLabelSingular="prescrição"
        countLabelPlural="prescrições"
      />

      <div className="px-4 pb-4">
      {/*
       * FIX: Adicionamos `className="flex-col"` no Tabs para forçar
       * layout vertical. O variant `data-horizontal:flex-col` do
       * componente base não está sendo aplicado corretamente no
       * Tailwind CSS 4 + Base UI.
       */}
      <Tabs defaultValue="todas" className="w-full flex-col">
        <TabsList className="w-full h-10">
          <TabsTrigger value="todas" className="flex-1 text-xs">
            Todas ({filtered.length})
          </TabsTrigger>
          <TabsTrigger value="treino" className="flex-1 text-xs">
            Treino ({training.length})
          </TabsTrigger>
          <TabsTrigger value="aerobico" className="flex-1 text-xs">
            Aeróbico ({aerobic.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="w-full mt-3">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <CardList items={filtered} />
          )}
        </TabsContent>

        <TabsContent value="treino" className="w-full mt-3">
          {training.length === 0 ? (
            <EmptyState message="Nenhuma ficha de treino encontrada" />
          ) : (
            <CardList items={training} />
          )}
        </TabsContent>

        <TabsContent value="aerobico" className="w-full mt-3">
          {aerobic.length === 0 ? (
            <EmptyState message="Nenhuma prescrição aeróbica encontrada" />
          ) : (
            <CardList items={aerobic} />
          )}
        </TabsContent>
      </Tabs>
      </div>

      {/* FAB — mesmo padrão de Usuários e Avaliações */}
      <FAB
        icon={Plus}
        onClick={() => router.push("/app/prescricoes/nova")}
        label="Nova Prescrição"
      />
    </div>
  );
}
