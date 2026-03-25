import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AssistantDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const assistant = await db.assistant.findUnique({
    where: { id: params.id },
    include: {
      assessments: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, population: true, status: true, createdAt: true },
      },
    },
  });

  if (!assistant) notFound();

  return (
    <MobileLayout title={assistant.name} showBack>
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 p-6 pb-4 border-b border-border">
          <Avatar className="w-20 h-20">
            <AvatarImage src={assistant.photo ?? undefined} />
            <AvatarFallback className="text-xl font-bold bg-purple-500/10 text-purple-600">
              {assistant.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-lg font-bold text-foreground">{assistant.name}</h2>
            <Badge
              className={cn(
                "text-xs mt-1",
                assistant.status === "ACTIVE"
                  ? "bg-green-500/10 text-green-700 border-green-200"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {assistant.status === "ACTIVE" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="flex-1">
          <div className="px-4 pt-4">
            <TabsList className="w-full h-10">
              <TabsTrigger value="info" className="flex-1 text-xs">Informações</TabsTrigger>
              <TabsTrigger value="avaliacoes" className="flex-1 text-xs">Avaliações</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="info" className="px-4 py-4 flex flex-col gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col gap-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contato</p>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{assistant.email}</span>
                </div>
                {assistant.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{assistant.phone}</span>
                  </div>
                )}
                {assistant.profession && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{assistant.profession}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="avaliacoes" className="px-4 py-4">
            {assistant.assessments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma avaliação realizada</p>
            ) : (
              <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
                {assistant.assessments.map((a: any, i: number) => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-3.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                      <span className="text-xs font-bold text-primary">{i + 1}ª</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{a.population}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {a.status === "COMPLETE" ? "Completa" : "Rascunho"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
