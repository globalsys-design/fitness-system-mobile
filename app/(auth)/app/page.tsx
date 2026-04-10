import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { InteractiveMenu } from "@/components/mobile/interactive-menu";
import { ClientLayout } from "@/components/mobile/client-layout";
import { DashboardProfessional } from "@/components/dashboard/dashboard-professional";
import { DashboardAssistant } from "@/components/dashboard/dashboard-assistant";
import { CustomerDashboard } from "@/components/dashboard/customer-dashboard";
import { TrialBanner } from "@/components/paywall/trial-banner";
import { isTrialActive, daysLeftInTrial } from "@/lib/subscription";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      trialEndsAt: true,
      stripeCurrentPeriodEnd: true,
      role: true,
      professional: {
        select: {
          id: true,
          name: true,
          specialty: true,
          photo: true,
          _count: {
            select: {
              clients: true,
              assistants: true,
              assessments: true,
              prescriptions: true,
            },
          },
        },
      },
      assistant: {
        select: {
          id: true,
          name: true,
          professional: {
            select: { name: true, email: true, photo: true, profession: true },
          },
          _count: {
            select: { assessments: true, prescriptions: true },
          },
        },
      },
    },
  });

  if (!user) redirect("/login");

  // Garante registro Professional para usuários que logaram antes do onboarding automático
  if (user.role === "PROFESSIONAL" && !user.professional) {
    await db.professional.create({
      data: {
        userId: session.user.id,
        name: session.user.name ?? "Profissional",
        email: session.user.email ?? "",
      },
    });
    redirect("/app");
  }

  // Dispara onboarding para profissionais que ainda não definiram especialidade
  if (user.role === "PROFESSIONAL" && user.professional && !user.professional.specialty) {
    redirect("/app/onboarding");
  }

  // ── CLIENT role: Hub do Aluno ──────────────────────────────────────────
  if (user.role === "CLIENT") {
    // Find the client record linked to this user
    const client = await db.client.findFirst({
      where: { email: session.user.email ?? "" },
      select: {
        id: true,
        name: true,
        professional: { select: { name: true } },
        _count: {
          select: { prescriptions: true, assessments: true },
        },
      },
    });

    const latestPrescription = client
      ? await db.prescription.findFirst({
          where: { clientId: client.id },
          orderBy: { createdAt: "desc" },
          select: { id: true, type: true, createdAt: true },
        })
      : null;

    return (
      <ClientLayout title="Inicio" hideHeaderOnScroll>
        <CustomerDashboard
          clientName={client?.name ?? session.user.name ?? "Aluno"}
          professionalName={client?.professional?.name ?? null}
          totalPrescriptions={client?._count?.prescriptions ?? 0}
          totalAssessments={client?._count?.assessments ?? 0}
          latestPrescription={
            latestPrescription
              ? {
                  id: latestPrescription.id,
                  type: latestPrescription.type,
                  createdAt: latestPrescription.createdAt.toISOString(),
                }
              : null
          }
        />
      </ClientLayout>
    );
  }

  // ── PROFESSIONAL / ASSISTANT flow ──────────────────────────────────────
  const trialActive = isTrialActive(user as any);
  const daysLeft = daysLeftInTrial(user as any);

  // Fetch today's events for the professional dashboard agenda
  let todayEvents: {
    id: string;
    title: string;
    type: string;
    startAt: string;
    endAt: string;
    client: { name: string } | null;
  }[] = [];

  if (user.professional) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const events = await db.calendarEvent.findMany({
      where: {
        professionalId: user.professional.id,
        startAt: { gte: todayStart, lte: todayEnd },
      },
      include: { client: { select: { name: true } } },
      orderBy: { startAt: "asc" },
    });

    todayEvents = events.map((e) => ({
      id: e.id,
      title: e.title,
      type: e.type,
      startAt: e.startAt.toISOString(),
      endAt: e.endAt.toISOString(),
      client: e.client ? { name: e.client.name } : null,
    }));
  }

  // Professional dashboard uses custom layout (no MobileHeader — hero acts as header)
  if (user.role === "PROFESSIONAL" && user.professional) {
    return (
      <div className="flex flex-col bg-background" style={{ height: "100dvh" }}>
        <main
          className="flex-1 overflow-y-auto bg-background"
          style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
        >
          {trialActive && <TrialBanner daysLeft={daysLeft} />}
          <DashboardProfessional
            professional={user.professional}
            todayEvents={todayEvents}
          />
        </main>
        <InteractiveMenu />
      </div>
    );
  }

  return (
    <MobileLayout title="Dashboard" hideHeaderOnScroll>
      {trialActive && <TrialBanner daysLeft={daysLeft} />}
      <div className="p-4">
        {user.assistant ? (
          <DashboardAssistant assistant={user.assistant} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-muted-foreground text-sm">
              Complete seu perfil para continuar.
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
