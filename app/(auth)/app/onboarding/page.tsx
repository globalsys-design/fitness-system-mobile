import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ProfessionalOnboardingFlow } from "@/components/professional/onboarding/ProfessionalOnboardingFlow";

/**
 * Professional first-session onboarding.
 * Triggered from dashboard when professional.specialty is null.
 * Can be skipped — always redirects to /app after completion.
 */
export default async function ProfessionalOnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true, specialty: true, photo: true },
  });

  // If no professional record or onboarding already done → redirect to app
  if (!professional) redirect("/login");
  if (professional.specialty && professional.photo) redirect("/app");

  return (
    <ProfessionalOnboardingFlow initialName={professional.name ?? ""} />
  );
}
