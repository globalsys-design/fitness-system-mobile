"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, TrendingUp, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const clientNavItems = [
  { label: "Inicio", href: "/app", icon: Home },
  { label: "Fichas", href: "/app/fichas", icon: ClipboardList },
  { label: "Progresso", href: "/app/progresso", icon: TrendingUp },
  { label: "Perfil", href: "/app/perfil", icon: UserCircle },
] as const;

const isActive = (href: string, pathname: string) =>
  href === "/app" ? pathname === "/app" : pathname.startsWith(href);

const ClientNavItem = memo(
  ({ item, active }: { item: (typeof clientNavItems)[number]; active: boolean }) => {
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center p-3 transition-colors duration-300 ease-in-out shrink-0",
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
        aria-current={active ? "page" : undefined}
      >
        <Icon className="h-6 w-6 shrink-0" />
        <div
          className={cn(
            "grid overflow-hidden transition-[grid-template-columns] duration-300 ease-in-out",
            active ? "grid-cols-[1fr] ml-2" : "grid-cols-[0fr] ml-0"
          )}
        >
          <span className="overflow-hidden whitespace-nowrap text-sm font-semibold">
            {item.label}
          </span>
          <div
            className={cn(
              "h-[2px] w-full bg-primary rounded-full mt-0.5",
              "transition-opacity duration-300 ease-in-out",
              active ? "opacity-100" : "opacity-0"
            )}
            style={{ boxShadow: "var(--primary-glow)" }}
          />
        </div>
      </Link>
    );
  }
);

ClientNavItem.displayName = "ClientNavItem";

export const ClientNav = memo(function ClientNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed z-40 flex items-center justify-between px-4 py-2 rounded-full shadow-2xl",
        "bg-background/80 backdrop-blur-xl border border-border/50",
        "left-4 right-4 max-w-[400px] mx-auto",
        "bottom-[calc(env(safe-area-inset-bottom)+1.5rem)]"
      )}
      role="navigation"
      aria-label="Navegacao do cliente"
    >
      {clientNavItems.map((item) => (
        <ClientNavItem
          key={item.href}
          item={item}
          active={isActive(item.href, pathname)}
        />
      ))}
    </nav>
  );
});
