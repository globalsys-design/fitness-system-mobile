"use client";

import { memo } from "react";
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
] as const;

/**
 * Determina se um item de navegação está ativo baseado na rota atual
 * @param href - URL do item
 * @param pathname - Rota atual
 */
const isNavItemActive = (href: string, pathname: string): boolean => {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
};

/**
 * Componente individual de item de navegação
 */
const NavItem = memo(
  ({ item, isActive }: { item: (typeof navItems)[number]; isActive: boolean }) => {
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center p-3 transition-colors duration-300 ease-in-out shrink-0",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {/* Ícone fixo */}
        <Icon className="h-6 w-6 shrink-0" />

        {/* Container de Expansão + Sublinhado (Grid colapsa/expande junto) */}
        <div
          className={cn(
            "grid overflow-hidden transition-[grid-template-columns] duration-300 ease-in-out",
            isActive ? "grid-cols-[1fr] ml-2" : "grid-cols-[0fr] ml-0"
          )}
        >
          <span className="overflow-hidden whitespace-nowrap text-sm font-semibold">
            {item.label}
          </span>
          {/* Sublinhado — sempre com a largura exata do texto */}
          <div
            className={cn(
              "h-[2px] w-full bg-primary rounded-full mt-0.5",
              "transition-opacity duration-300 ease-in-out",
              isActive ? "opacity-100" : "opacity-0"
            )}
            style={{ boxShadow: "var(--primary-glow)" }}
          />
        </div>
      </Link>
    );
  }
);

NavItem.displayName = "NavItem";

/**
 * Menu flutuante interativo com navegação responsiva
 * V3.0: Otimizado com memoização, renderização eficiente e acessibilidade
 */
export const InteractiveMenu = memo(function InteractiveMenu() {
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
      aria-label="Navegação principal"
    >
      {navItems.map((item) => (
        <NavItem
          key={item.href}
          item={item}
          isActive={isNavItemActive(item.href, pathname)}
        />
      ))}
    </nav>
  );
});
