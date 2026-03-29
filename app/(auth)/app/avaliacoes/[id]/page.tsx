import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AssessmentDetail } from "@/components/assessments/assessment-detail";

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const assessment = await db.assessment.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, photo: true, gender: true, birthDate: true } },
      objective: true,
      anamnesis: true,
      anthropometry: true,
      clinicalExams: true,
      fitnessTests: true,
    },
  });

  if (!assessment) notFound();

  return <AssessmentDetail assessment={assessment} />;
}
