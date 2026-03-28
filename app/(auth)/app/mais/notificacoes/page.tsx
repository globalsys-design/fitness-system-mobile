import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Bell, BellOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function NotificacoesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <MobileLayout
      title="Notificações"
      showBack
      actions={
        unreadCount > 0 ? (
          <Badge className="bg-primary text-primary-foreground">{unreadCount}</Badge>
        ) : undefined
      }
    >
      <div className="p-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted">
              <BellOff className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Nenhuma notificação ainda</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "flex items-start gap-3 p-4",
                  !notif.read && "bg-primary/5"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 mt-0.5",
                    notif.priority === "CRITICAL"
                      ? "bg-destructive/10"
                      : notif.priority === "ATTENTION"
                      ? "bg-warning/10"
                      : "bg-primary/10"
                  )}
                >
                  <Bell
                    className={cn(
                      "w-4 h-4",
                      notif.priority === "CRITICAL"
                        ? "text-destructive"
                        : notif.priority === "ATTENTION"
                        ? "text-warning"
                        : "text-primary"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
