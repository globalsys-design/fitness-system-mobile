"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Dumbbell,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Nav items — matching Figma labels & routes ─────────────────────────── */
const navItems = [
  { label: "Início",   href: "/app",             icon: LayoutDashboard },
  { label: "Pessoas",  href: "/app/usuarios",    icon: Users           },
  { label: "Clínico",  href: "/app/avaliacoes",  icon: ClipboardList   },
  { label: "Treinos",  href: "/app/prescricoes", icon: Dumbbell        },
  { label: "Mais",     href: "/app/mais",        icon: MoreHorizontal  },
] as const;

const isActive = (href: string, pathname: string): boolean =>
  href === "/app" ? pathname === "/app" : pathname.startsWith(href);

/* ── Single nav item ─────────────────────────────────────────────────────── */
const NavItem = memo(function NavItem({
  item,
  active,
}: {
  item: (typeof navItems)[number];
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className="flex flex-col items-center justify-center outline-none"
    >
      {/* Icon + label wrapper — gets background chip when active */}
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200",
          active
            ? "bg-primary/10"
            : "bg-transparent"
        )}
      >
        <Icon
          className={cn(
            "size-[18px] transition-colors duration-200",
            active ? "text-info" : "text-muted-foreground"
          )}
          strokeWidth={active ? 2.5 : 2}
        />
        <span
          className={cn(
            "text-[10px] font-semibold tracking-[0.25px] whitespace-nowrap transition-colors duration-200",
            active ? "text-info" : "text-muted-foreground"
          )}
        >
          {item.label}
        </span>
      </div>
    </Link>
  );
});

/* ── Bottom Navigation Bar ───────────────────────────────────────────────── */
export const InteractiveMenu = memo(function InteractiveMenu() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        /* Position — full-width bottom bar */
        "fixed bottom-0 left-0 w-full z-50",
        /* Shape — rounded top corners like Figma */
        "rounded-tl-[12px] rounded-tr-[12px]",
        /* Background — semantic: white in light mode, dark card in dark mode */
        "bg-card border-t border-border",
        /* Safe area + internal padding */
        "pt-[11px] pb-[calc(env(safe-area-inset-bottom)+0.5rem)]",
        "px-6"
      )}
      role="navigation"
      aria-label="Navegação principal"
    >
      <div className="flex items-center justify-between max-w-[400px] mx-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={isActive(item.href, pathname)}
          />
        ))}
      </div>
    </nav>
  );
});
