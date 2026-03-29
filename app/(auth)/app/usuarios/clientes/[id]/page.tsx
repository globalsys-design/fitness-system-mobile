import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { ClientDetail } from "@/components/users/client-detail";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { professional: { select: { id: true } } },
  });

  if (!user?.professional) redirect("/login");

  const client = await db.client.findFirst({
    where: {
      id,
      professionalId: user.professional.id,
    },
    include: {
      assessments: {
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          population: true,
          modality: true,
          status: true,
          createdAt: true,
        },
      },
      prescriptions: {
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          createdAt: true,
        },
      },
    },
  });

  if (!client) notFound();

  return (
    <MobileLayout title={client.name} showBack>
      <ClientDetail client={JSON.parse(JSON.stringify(client))} />
    </MobileLayout>
  );
}
