"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssistantCardProps {
  assistant: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    photo: string | null;
    status: string;
    profession: string | null;
  };
}

export function AssistantCard({ assistant }: AssistantCardProps) {
  return (
    <Link
      href={`/app/usuarios/assistentes/${assistant.id}`}
      className="flex items-center gap-3 px-4 py-3.5 bg-card active:bg-muted/50 transition-colors"
    >
      <Avatar className="size-12 shrink-0">
        <AvatarImage src={assistant.photo ?? undefined} />
        <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
          {assistant.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground text-sm truncate">
            {assistant.name}
          </p>
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] px-1.5 py-0 h-5 shrink-0",
              assistant.status === "ACTIVE"
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted text-muted-foreground"
            )}
          >
            {assistant.status === "ACTIVE" ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {assistant.profession ?? "Sem profissão definida"}
        </p>
        <div className="flex items-center gap-3 mt-1">
          {assistant.email && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Mail className="size-3" />
              <span className="truncate max-w-32">{assistant.email}</span>
            </span>
          )}
          {assistant.phone && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Phone className="size-3" />
              {assistant.phone}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="size-5 text-muted-foreground shrink-0" />
    </Link>
  );
}
