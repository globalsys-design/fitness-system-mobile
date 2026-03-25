import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { BillingContent } from "@/components/billing/billing-content";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      trialEndsAt: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <MobileLayout title="Plano e Faturamento" showBack>
      <div className="p-4">
        <BillingContent user={user} />
      </div>
    </MobileLayout>
  );
}
