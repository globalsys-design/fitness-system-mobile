"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    photo: string | null;
    status: string;
    gender: string | null;
  };
}

export function ClientCard({ client }: ClientCardProps) {
  const genderLabel =
    client.gender === "M"
      ? "Masculino"
      : client.gender === "F"
        ? "Feminino"
        : client.gender === "OTHER"
          ? "Outro"
          : null;

  return (
    <Link
      href={`/app/usuarios/clientes/${client.id}`}
      className="flex items-center gap-3 px-4 py-3.5 bg-card active:bg-muted/50 transition-colors"
    >
      <Avatar className="size-12 shrink-0">
        <AvatarImage src={client.photo ?? undefined} />
        <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
          {client.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground text-sm truncate">
            {client.name}
          </p>
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] px-1.5 py-0 h-5 shrink-0",
              client.status === "ACTIVE"
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted text-muted-foreground"
            )}
          >
            {client.status === "ACTIVE" ? "Ativo" : "Inativo"}
          </Badge>
        </div>

        {genderLabel && (
          <p className="text-xs text-muted-foreground mt-0.5">{genderLabel}</p>
        )}

        <div className="flex items-center gap-3 mt-1">
          {client.email && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Mail className="size-3" />
              <span className="truncate max-w-32">{client.email}</span>
            </span>
          )}
          {client.phone && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Phone className="size-3" />
              {client.phone}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="size-5 text-muted-foreground shrink-0" />
    </Link>
  );
}
