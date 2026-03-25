import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { AssessmentsList } from "@/components/assessments/assessments-list";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AvaliacoesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const assessments = professional
    ? await db.assessment.findMany({
        where: { professionalId: professional.id },
        include: {
          client: {
            select: { id: true, name: true, photo: true, gender: true },
          },
          assistant: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <MobileLayout
      title="Avaliações"
      actions={
        <Link href="/app/avaliacoes/nova">
          <Button size="sm" className="h-8 px-3 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Nova
          </Button>
        </Link>
      }
    >
      <AssessmentsList assessments={assessments} />
    </MobileLayout>
  );
}
