import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarioPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const events = professional
    ? await db.calendarEvent.findMany({
        where: {
          professionalId: professional.id,
          startAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 1),
          },
        },
        include: { client: { select: { name: true } } },
        orderBy: { startAt: "asc" },
      })
    : [];

  return (
    <MobileLayout title="Calendário" showBack>
      <CalendarView events={events} />
    </MobileLayout>
  );
}
