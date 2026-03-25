"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Dumbbell, Mail, Phone, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function ClientDetail({ client }: { client: any }) {
  const [tab, setTab] = useState("info");

  const birthDate = client.birthDate
    ? format(new Date(client.birthDate), "dd/MM/yyyy", { locale: ptBR })
    : null;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 p-6 pb-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={client.photo ?? undefined} />
          <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
            {client.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">{client.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Badge
              className={cn(
                "text-xs",
                client.status === "ACTIVE"
                  ? "bg-green-500/10 text-green-700 border-green-200"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {client.status === "ACTIVE" ? "Ativo" : "Inativo"}
            </Badge>
            {client.gender && (
              <Badge variant="outline" className="text-xs">
                {client.gender === "M" ? "Masculino" : client.gender === "F" ? "Feminino" : client.gender}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ClipboardList className="w-4 h-4" />
            <span>{client.assessments.length} aval.</span>
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell className="w-4 h-4" />
            <span>{client.prescriptions.length} pres.</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="flex-1">
        <div className="px-4 sticky top-14 bg-background z-10 pb-2">
          <TabsList className="w-full h-10">
            <TabsTrigger value="info" className="flex-1 text-xs">Info</TabsTrigger>
            <TabsTrigger value="avaliacoes" className="flex-1 text-xs">Avaliações</TabsTrigger>
            <TabsTrigger value="prescricoes" className="flex-1 text-xs">Prescrições</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="info" className="px-4 pb-6 mt-4 flex flex-col gap-4">
          {/* Contato */}
          <Card>
            <CardContent className="p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contato</p>
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">{client.phone}</span>
                </div>
              )}
              {birthDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">{birthDate}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Endereço */}
          {client.address && (
            <Card>
              <CardContent className="p-4 flex flex-col gap-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Endereço</p>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    {[
                      client.address.street,
                      client.address.number,
                      client.address.city,
                      client.address.state,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="avaliacoes" className="px-4 pb-6 mt-4">
          {client.assessments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <ClipboardList className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhuma avaliação ainda</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
              {client.assessments.map((a: any, i: number) => (
                <Link
                  key={a.id}
                  href={`/app/avaliacoes/${a.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <span className="text-xs font-bold text-primary">{i + 1}ª</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{a.population}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(a.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {a.status === "COMPLETE" ? "Completa" : "Rascunho"}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="prescricoes" className="px-4 pb-6 mt-4">
          {client.prescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Dumbbell className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhuma prescrição ainda</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
              {client.prescriptions.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/app/prescricoes/${p.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-accent transition-colors"
                >
                  <Dumbbell className="w-4 h-4 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {p.type === "TRAINING" ? "Ficha de Treino" : "Aeróbicos"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(p.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
