"use client";

import { useState } from "react";
import { Search, Plus, Users, UserX } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { FAB } from "@/components/mobile/fab";
import { ListEmptyState } from "@/components/lists/list-header";
import { AssistantsList } from "./assistants-list";
import { ClientsList } from "./clients-list";
import { useSearchParams, useRouter } from "next/navigation";

interface UsersContentProps {
  assistants: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    photo: string | null;
    status: string;
    profession: string | null;
  }>;
  clients: Array<{
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    photo: string | null;
    status: string;
    gender: string | null;
  }>;
}

export function UsersContent({ assistants, clients }: UsersContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultTab = searchParams.get("tab") === "assistentes" ? "assistentes" : "clientes";
  const [tab, setTab] = useState(defaultTab);
  const [search, setSearch] = useState("");

  // Reset busca ao trocar de aba
  function handleTabChange(value: string) {
    setTab(value);
    setSearch("");
  }

  function handleAdd() {
    if (tab === "assistentes") {
      router.push("/app/usuarios/assistentes/novo");
    } else {
      router.push("/app/usuarios/clientes/novo");
    }
  }

  const isClientes = tab === "clientes";
  const count = isClientes
    ? clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (c.phone ?? "").includes(search)
      ).length
    : assistants.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        (a.profession ?? "").toLowerCase().includes(search.toLowerCase())
      ).length;

  const countLabel = isClientes
    ? count === 1 ? "cliente" : "clientes"
    : count === 1 ? "assistente" : "assistentes";

  return (
    /* ── CONTAINER PAI ─────────────────────────────────────────────────
       flex flex-col + h-full + overflow-hidden:
       Garante que o filho com flex-1 overflow-y-auto funcione
       corretamente dentro da altura disponível.
    ─────────────────────────────────────────────────────────────────── */
    <div className="flex flex-col h-full overflow-hidden">
      <Tabs value={tab} onValueChange={handleTabChange} className="flex flex-col h-full overflow-hidden">

        {/* ── BLOCO CABEÇALHO FIXO ───────────────────────────────────────
            shrink-0: nunca encolhe — é o "teto" da interface.
            Contém tabs + busca + contador.
        ─────────────────────────────────────────────────────────────── */}
        <div className="shrink-0 bg-background z-10 px-4 pt-4 pb-2 flex flex-col gap-3">

          {/* Tabs: Clientes / Assistentes */}
          <TabsList className="w-full h-11">
            <TabsTrigger value="clientes" className="flex-1 text-sm">
              Clientes ({clients.length})
            </TabsTrigger>
            <TabsTrigger value="assistentes" className="flex-1 text-sm">
              Assistentes ({assistants.length})
            </TabsTrigger>
          </TabsList>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={isClientes ? "Buscar por nome, email ou telefone..." : "Buscar assistentes..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11"
            />
          </div>

          {/* Contador */}
          {count > 0 && (
            <p className="text-xs text-muted-foreground px-1">
              {count} {countLabel}
            </p>
          )}
        </div>

        {/* ── BLOCO LISTA (SCROLL ISOLADO) ───────────────────────────────
            flex-1: ocupa apenas o espaço restante abaixo do cabeçalho.
            overflow-y-auto: scroll exclusivamente aqui — cabeçalho não se move.
            pb-32: espaço de segurança para Bottom Nav + FAB.
        ─────────────────────────────────────────────────────────────── */}
        <TabsContent value="clientes" className="flex-1 overflow-y-auto mt-0 min-h-0">
          <ClientsList clients={clients} search={search} />
        </TabsContent>

        <TabsContent value="assistentes" className="flex-1 overflow-y-auto mt-0 min-h-0">
          <AssistantsList assistants={assistants} search={search} />
        </TabsContent>

      </Tabs>

      {/* FAB */}
      <FAB
        icon={Plus}
        onClick={handleAdd}
        label={`Adicionar ${tab === "assistentes" ? "assistente" : "cliente"}`}
      />
    </div>
  );
}
