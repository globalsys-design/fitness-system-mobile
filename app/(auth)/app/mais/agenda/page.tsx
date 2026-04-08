import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { AgendaView } from "@/components/calendar/agenda-view";
import { startOfDay, addDays } from "date-fns";

export default async function AgendaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!professional) redirect("/app");

  // Fetch events for next 30 days
  const now = startOfDay(new Date());
  const rangeEnd = addDays(now, 30);

  const events = await db.calendarEvent.findMany({
    where: {
      professionalId: professional.id,
      startAt: { gte: now, lte: rangeEnd },
    },
    include: { client: { select: { id: true, name: true } } },
    orderBy: { startAt: "asc" },
  });

  // Fetch clients for the event creation form
  const clients = await db.client.findMany({
    where: { professionalId: professional.id, status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <MobileLayout title="Agenda" showBack>
      <AgendaView
        events={events.map((e) => ({
          ...e,
          startAt: e.startAt.toISOString(),
          endAt: e.endAt.toISOString(),
        }))}
        clients={clients}
        professionalId={professional.id}
      />
    </MobileLayout>
  );
}
