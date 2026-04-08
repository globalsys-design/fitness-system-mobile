import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { ExerciseCatalog } from "@/components/exercises/exercise-catalog";

export default async function ExercisesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!professional) redirect("/app");

  const exercises = await db.exercise.findMany({
    where: { professionalId: professional.id },
    orderBy: { name: "asc" },
  });

  return (
    <MobileLayout title="Exercicios" showBack>
      <ExerciseCatalog initialExercises={exercises} />
    </MobileLayout>
  );
}
