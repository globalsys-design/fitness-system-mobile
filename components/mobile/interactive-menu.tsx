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
        "fixed z-40 flex items-center justify-between px-4 py-2 rounded-full shadow-2xl",
        "bg-background/80 backdrop-blur-xl border border-border/50",
        "left-4 right-4 max-w-[400px] mx-auto",
        "bottom-[calc(env(safe-area-inset-bottom)+1.5rem)]"
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
              "relative flex items-center p-3 transition-all duration-300 ease-in-out shrink-0",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {/* Ícone fixo */}
            <Icon className="h-6 w-6 shrink-0 z-10" />

            {/* Container de Expansão Responsiva (Grid para evitar cortes) */}
            <div
              className={cn(
                "grid transition-[grid-template-columns] duration-300 ease-in-out",
                isActive ? "grid-cols-[1fr] ml-2" : "grid-cols-[0fr] ml-0"
              )}
            >
              <span className="overflow-hidden whitespace-nowrap text-sm font-semibold truncate z-10">
                {item.label}
              </span>
            </div>

            {/* Linha/Sublinhado Elegante de Estado Ativo */}
            {isActive && (
              <div
                className={cn(
                  "absolute bottom-1 left-1/2 -translate-x-1/2",
                  "h-1 w-3/4 bg-primary rounded-full",
                  "animate-in fade-in duration-300"
                )}
                style={{
                  boxShadow: "0 0 8px rgba(102, 218, 198, 0.6)",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
