"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  const filtered = assistants.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar assistentes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
            <UserX className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {search ? "Nenhum assistente encontrado" : "Nenhum assistente cadastrado"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
          {filtered.map((assistant) => (
            <Link
              key={assistant.id}
              href={`/app/usuarios/assistentes/${assistant.id}`}
              className="flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-accent transition-colors"
            >
              <Avatar className="w-11 h-11 flex-shrink-0">
                <AvatarImage src={assistant.photo ?? undefined} />
                <AvatarFallback className="text-sm font-semibold bg-purple-500/10 text-purple-600">
                  {assistant.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{assistant.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {assistant.profession ?? assistant.email}
                </p>
              </div>
              <Badge
                variant={assistant.status === "ACTIVE" ? "default" : "secondary"}
                className={cn(
                  "text-xs flex-shrink-0",
                  assistant.status === "ACTIVE"
                    ? "bg-green-500/10 text-green-700 border-green-200"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {assistant.status === "ACTIVE" ? "Ativo" : "Inativo"}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
