import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { NewPrescriptionFlow } from "@/components/prescriptions/new-prescription-flow";

interface NovaPrescricaoPageProps {
  searchParams: Promise<{
    appointmentId?: string;
    clientId?: string;
  }>;
}

export default async function NovaPrescricaoPage({
  searchParams,
}: NovaPrescricaoPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { appointmentId, clientId: clientIdFromCalendar } = await searchParams;

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const clients = professional
    ? await db.client.findMany({
        where: { professionalId: professional.id },
        select: { id: true, name: true, photo: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <MobileLayout title="Nova Prescrição" showBack>
      <NewPrescriptionFlow
        clients={clients}
        appointmentId={appointmentId}
        preSelectedClientId={clientIdFromCalendar}
      />
    </MobileLayout>
  );
}
