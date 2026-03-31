"use client";

import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientCard } from "./client-card";
import { ListEmptyState } from "@/components/lists/list-header";
import Link from "next/link";

interface ClientsListProps {
  clients: Array<{
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    photo: string | null;
    status: string;
    gender: string | null;
  }>;
  /** Search string gerenciado pelo pai (UsersContent) */
  search: string;
}

export function ClientsList({ clients, search }: ClientsListProps) {
  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? "").includes(search)
  );

  // Estado vazio — Hero CTA (sem clientes cadastrados)
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 gap-5">
        <div className="flex items-center justify-center size-20 rounded-full bg-primary/10">
          <Users className="size-10 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">
            Nenhum cliente cadastrado
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-64 mx-auto leading-relaxed">
            Cadastre seu primeiro cliente para começar a criar avaliações e
            prescrições.
          </p>
        </div>
        <Link href="/app/usuarios/clientes/novo">
          <Button className="h-12 px-6 text-base font-medium">
            <UserPlus className="size-5 mr-2" />
            Cadastrar primeiro cliente
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 pt-2 pb-32">
      {filtered.length === 0 ? (
        <ListEmptyState
          icon={<Users className="size-8 text-muted-foreground" />}
          message={`Nenhum cliente encontrado para "${search}"`}
          isFiltered
        />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
