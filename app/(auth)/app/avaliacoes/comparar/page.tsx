import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { AssessmentCompareView } from "@/components/assessments/compare/AssessmentCompareView";

export default async function CompararAvaliacoesPage() {
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
          anthropometry: {
            select: {
              weight: true,
              height: true,
              bodyComposition: true,
              perimeters: true,
              diameters: true,
            },
          },
          anamnesis: {
            select: { framingham: true, basalParameters: true },
          },
          fitnessTests: {
            select: { vo2Max: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <MobileLayout title="Comparar Avaliações" showBack>
      <AssessmentCompareView assessments={assessments} />
    </MobileLayout>
  );
}
