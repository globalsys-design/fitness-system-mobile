"use client";

import { UserX } from "lucide-react";
import { AssistantCard } from "./assistant-card";
import { ListEmptyState } from "@/components/lists/list-header";

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
  /** Search string gerenciado pelo pai (UsersContent) */
  search: string;
}

export function AssistantsList({ assistants, search }: AssistantsListProps) {
  const filtered = assistants.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.profession ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col px-4 pt-2 pb-32">
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
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
          {filtered.map((assistant) => (
            <AssistantCard key={assistant.id} assistant={assistant} />
          ))}
        </div>
      )}
    </div>
  );
}
