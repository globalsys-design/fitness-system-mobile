"use client";

import { useState } from "react";
import { UserX } from "lucide-react";
import { AssistantCard } from "./assistant-card";
import { ListHeader, ListEmptyState } from "@/components/lists/list-header";

interface AssistantsListProps {
  assistants: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    photo: string | null;
    status: string;
    profession: string | null;
  }>;
}

export function AssistantsList({ assistants }: AssistantsListProps) {
  const [search, setSearch] = useState("");

  const filtered = assistants.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.profession ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      <ListHeader
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar assistentes..."
        count={filtered.length}
        countLabelSingular="assistente"
        countLabelPlural="assistentes"
      />

      {/* Lista ou estado vazio */}
      {filtered.length === 0 ? (
        <ListEmptyState
          icon={<UserX className="size-8 text-muted-foreground" />}
          message={
            search
              ? "Nenhum assistente encontrado"
              : "Nenhum assistente cadastrado"
          }
          subMessage={!search ? "Toque no botão + para adicionar" : undefined}
          isFiltered={!!search}
        />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden mx-4 mb-4">
          {filtered.map((assistant) => (
            <AssistantCard key={assistant.id} assistant={assistant} />
          ))}
        </div>
      )}
    </div>
  );
}
