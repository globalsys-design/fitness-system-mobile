import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { ClientDetail } from "@/components/users/client-detail";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const client = await db.client.findUnique({
    where: { id: params.id },
    include: {
      assessments: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, population: true, modality: true, status: true, createdAt: true },
      },
      prescriptions: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, type: true, createdAt: true },
      },
    },
  });

  if (!client) notFound();

  return (
    <MobileLayout title={client.name} showBack>
      <ClientDetail client={client} />
    </MobileLayout>
  );
}
