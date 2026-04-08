import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PublicReportView } from "@/components/reports/public-report-view";

/**
 * Public assessment report — no auth required.
 * Accessible via shareable link: /reports/[assessmentId]
 */
export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const assessment = await db.assessment.findUnique({
    where: { id, status: "COMPLETE" },
    include: {
      client: {
        select: {
          name: true,
          gender: true,
          birthDate: true,
          photo: true,
        },
      },
      professional: {
        select: {
          name: true,
          specialty: true,
          cref: true,
          photo: true,
        },
      },
      objective: true,
      anamnesis: true,
      anthropometry: true,
      clinicalExams: true,
      fitnessTests: true,
    },
  });

  // Only show completed assessments
  if (!assessment) notFound();

  // Serialize dates for client component
  const serialized = {
    ...assessment,
    createdAt: assessment.createdAt.toISOString(),
    updatedAt: assessment.updatedAt.toISOString(),
    scheduledNextAt: assessment.scheduledNextAt?.toISOString() ?? null,
    client: {
      ...assessment.client,
      birthDate: assessment.client.birthDate?.toISOString() ?? null,
    },
    objective: assessment.objective
      ? {
          ...assessment.objective,
          createdAt: assessment.objective.createdAt.toISOString(),
          updatedAt: assessment.objective.updatedAt.toISOString(),
        }
      : null,
    anamnesis: assessment.anamnesis
      ? {
          ...assessment.anamnesis,
          createdAt: assessment.anamnesis.createdAt.toISOString(),
          updatedAt: assessment.anamnesis.updatedAt.toISOString(),
        }
      : null,
    anthropometry: assessment.anthropometry
      ? {
          ...assessment.anthropometry,
          createdAt: assessment.anthropometry.createdAt.toISOString(),
          updatedAt: assessment.anthropometry.updatedAt.toISOString(),
        }
      : null,
    clinicalExams: assessment.clinicalExams
      ? {
          ...assessment.clinicalExams,
          createdAt: assessment.clinicalExams.createdAt.toISOString(),
          updatedAt: assessment.clinicalExams.updatedAt.toISOString(),
        }
      : null,
    fitnessTests: assessment.fitnessTests
      ? {
          ...assessment.fitnessTests,
          createdAt: assessment.fitnessTests.createdAt.toISOString(),
          updatedAt: assessment.fitnessTests.updatedAt.toISOString(),
        }
      : null,
  };

  return <PublicReportView assessment={serialized} />;
}
