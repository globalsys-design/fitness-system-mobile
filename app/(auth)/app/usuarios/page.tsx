import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { UsersContent } from "@/components/users/users-content";

export default async function UsuariosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { professional: { select: { id: true } } },
  });

  if (!user?.professional) {
    return (
      <MobileLayout title="Usuários">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <p className="text-muted-foreground text-sm">Perfil profissional não configurado.</p>
        </div>
      </MobileLayout>
    );
  }

  const [assistants, clients] = await Promise.all([
    db.assistant.findMany({
      where: { professionalId: user.professional.id },
      orderBy: { name: "asc" },
    }),
    db.client.findMany({
      where: { professionalId: user.professional.id },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <MobileLayout title="Usuários">
      <UsersContent assistants={assistants} clients={clients} />
    </MobileLayout>
  );
}
