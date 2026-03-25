import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import {
  CalendarDays,
  Bell,
  HelpCircle,
  UserCircle,
  ShieldCheck,
  CreditCard,
  LogOut,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  {
    section: "Ferramentas",
    items: [
      { label: "Calendário", href: "/app/mais/calendario", icon: CalendarDays },
      { label: "Notificações", href: "/app/mais/notificacoes", icon: Bell },
    ],
  },
  {
    section: "Conta",
    items: [
      { label: "Meu Perfil", href: "/app/mais/perfil", icon: UserCircle },
      { label: "Segurança", href: "/app/mais/seguranca", icon: ShieldCheck },
      { label: "Plano e Faturamento", href: "/app/settings/billing", icon: CreditCard },
    ],
  },
  {
    section: "Suporte",
    items: [
      { label: "Ajuda", href: "/app/mais/ajuda", icon: HelpCircle },
    ],
  },
];

export default async function MaisPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <MobileLayout title="Mais">
      <div className="p-4 flex flex-col gap-6">
        {menuItems.map((section) => (
          <div key={section.section}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.section}
            </p>
            <div className="flex flex-col rounded-xl border border-border overflow-hidden divide-y divide-border">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                      <Icon className="w-4 h-4 text-foreground" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sair */}
        <div className="flex flex-col rounded-xl border border-destructive/30 overflow-hidden">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-destructive/5 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10">
              <LogOut className="w-4 h-4 text-destructive" />
            </div>
            <span className="flex-1 text-sm font-medium text-destructive">Sair da conta</span>
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
}
