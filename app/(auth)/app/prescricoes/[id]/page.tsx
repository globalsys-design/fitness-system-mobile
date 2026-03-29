import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { PrescriptionDetail } from "@/components/prescriptions/prescription-detail";

export default async function PrescricaoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const prescription = await db.prescription.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, photo: true, gender: true } },
      trainingSheet: true,
      professional: {
        select: { user: { select: { name: true } } },
      },
    },
  });

  if (!prescription) notFound();

  const professionalName =
    prescription.professional?.user?.name || "Profissional";

  return (
    <MobileLayout title="Prescrição" showBack>
      <PrescriptionDetail
        prescription={prescription}
        professionalName={professionalName}
      />
    </MobileLayout>
  );
}
