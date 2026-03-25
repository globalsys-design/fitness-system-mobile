import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { PrescriptionsList } from "@/components/prescriptions/prescriptions-list";

export default async function PrescricoesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const prescriptions = professional
    ? await db.prescription.findMany({
        where: { professionalId: professional.id },
        include: {
          client: {
            select: { id: true, name: true, photo: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <MobileLayout title="Prescrições">
      <PrescriptionsList prescriptions={prescriptions} />
    </MobileLayout>
  );
}
