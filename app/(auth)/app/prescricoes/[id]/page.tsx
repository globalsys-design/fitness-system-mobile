import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Activity } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function PrescricaoDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const prescription = await db.prescription.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { name: true, photo: true } },
      trainingSheet: true,
    },
  });

  if (!prescription) notFound();

  return (
    <MobileLayout title="Prescrição" showBack>
      <div className="p-4 flex flex-col gap-4">
        {/* Client Card */}
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={prescription.client.photo ?? undefined} />
              <AvatarFallback className="bg-orange-500/10 text-orange-600 font-bold">
                {prescription.client.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{prescription.client.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-xs">
                  {prescription.type === "TRAINING" ? "Ficha de Treino" : "Aeróbicos"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(prescription.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {prescription.type === "TRAINING" ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-foreground text-sm">Exercícios de musculação</h3>
            </div>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  {prescription.trainingSheet
                    ? "Ficha de treino disponível"
                    : "Nenhum exercício cadastrado ainda."}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Treino aeróbico</h3>
            </div>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Nenhum treino aeróbico cadastrado ainda.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
