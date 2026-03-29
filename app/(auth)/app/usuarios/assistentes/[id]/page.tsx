import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { AssistantDetail } from "@/components/users/assistant-detail";

export default async function AssistantDetailPage({
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

  const assistant = await db.assistant.findFirst({
    where: {
      id,
      professionalId: user.professional.id,
    },
    include: {
      assessments: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { client: { select: { name: true } } },
      },
      prescriptions: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!assistant) notFound();

  return (
    <MobileLayout title={assistant.name} showBack>
      <AssistantDetail assistant={JSON.parse(JSON.stringify(assistant))} />
    </MobileLayout>
  );
}
