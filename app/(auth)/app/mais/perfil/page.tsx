import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { ProfileContent } from "@/components/profile/profile-content";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      plan: true,
      professional: {
        select: {
          name: true,
          email: true,
          phone: true,
          profession: true,
          specialty: true,
          photo: true,
          address: true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <MobileLayout title="Meu Perfil" showBack>
      <ProfileContent user={user} />
    </MobileLayout>
  );
}
