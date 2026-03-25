import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { CalendarView } from "@/components/calendar/calendar-view";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    <MobileLayout
      title="Calendário"
      showBack
      actions={
        <Link href="/app/mais/calendario/novo">
          <Button size="sm" className="h-8 px-3 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Novo
          </Button>
        </Link>
      }
    >
      <CalendarView events={events} />
    </MobileLayout>
  );
}
