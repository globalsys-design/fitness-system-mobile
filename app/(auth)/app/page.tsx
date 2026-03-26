import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { DashboardProfessional } from "@/components/dashboard/dashboard-professional";
import { DashboardAssistant } from "@/components/dashboard/dashboard-assistant";
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

  const trialActive = isTrialActive(user as any);
  const daysLeft = daysLeftInTrial(user as any);

  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  let recentAssessments = 0;
  let recentPrescriptions = 0;

  if (user.professional) {
    recentAssessments = await db.assessment.count({
      where: {
        professionalId: user.professional.id,
        createdAt: { gte: last30Days },
      },
    });
    recentPrescriptions = await db.prescription.count({
      where: {
        professionalId: user.professional.id,
        createdAt: { gte: last30Days },
      },
    });
  }

  return (
    <MobileLayout title="Dashboard">
      {trialActive && <TrialBanner daysLeft={daysLeft} />}
      <div className="p-4">
        {user.role === "PROFESSIONAL" && user.professional ? (
          <DashboardProfessional
            professional={user.professional}
            recentAssessments={recentAssessments}
            recentPrescriptions={recentPrescriptions}
          />
        ) : user.assistant ? (
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
