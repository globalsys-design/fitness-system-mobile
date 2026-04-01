"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Dumbbell,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Usuários", href: "/app/usuarios", icon: Users },
  { label: "Avaliações", href: "/app/avaliacoes", icon: ClipboardList },
  { label: "Prescrições", href: "/app/prescricoes", icon: Dumbbell },
  { label: "Mais", href: "/app/mais", icon: Menu },
];

export function InteractiveMenu() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed z-50 flex items-center gap-1 p-3 rounded-full shadow-2xl",
        "left-1/2 -translate-x-1/2",
        "bottom-[calc(env(safe-area-inset-bottom)+1.5rem)]",
        "bg-background/60 backdrop-blur-xl border border-border/50"
      )}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center justify-center h-14 w-14 rounded-full transition-all duration-300 ease-in-out",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Icon className="h-6 w-6 shrink-0" />

            {/* Animated label expansion */}
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 ease-in-out",
                isActive
                  ? "max-w-[120px] ml-2 opacity-100"
                  : "max-w-0 opacity-0 ml-0"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
