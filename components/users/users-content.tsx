"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FAB } from "@/components/mobile/fab";
import { AssistantsList } from "./assistants-list";
import { ClientsList } from "./clients-list";
import { useSearchParams, useRouter } from "next/navigation";

interface UsersContentProps {
  assistants: any[];
  clients: any[];
}

export function UsersContent({ assistants, clients }: UsersContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultTab = searchParams.get("tab") === "assistentes" ? "assistentes" : "clientes";
  const [tab, setTab] = useState(defaultTab);

  function handleAdd() {
    if (tab === "assistentes") {
      router.push("/app/usuarios/assistentes/novo");
    } else {
      router.push("/app/usuarios/clientes/novo");
    }
  }

  return (
    <div className="flex flex-col">
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1">
        {/* Tabs Navigation — Sticky no topo, z-20 acima do ListHeader */}
        <div className="sticky top-0 z-20 bg-background px-4 pt-4 pb-2">
          <TabsList className="w-full h-11">
            <TabsTrigger value="clientes" className="flex-1 text-sm">
              Clientes ({clients.length})
            </TabsTrigger>
            <TabsTrigger value="assistentes" className="flex-1 text-sm">
              Assistentes ({assistants.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content — Com scroll seguro */}
        <TabsContent value="clientes" className="flex-1 mt-0">
          <ClientsList clients={clients} />
        </TabsContent>

        <TabsContent value="assistentes" className="flex-1 mt-0">
          <AssistantsList assistants={assistants} />
        </TabsContent>
      </Tabs>

      {/* FAB — Padrão consistente */}
      <FAB icon={Plus} onClick={handleAdd} label={`Adicionar ${tab === "assistentes" ? "assistente" : "cliente"}`} />
    </div>
  );
}
