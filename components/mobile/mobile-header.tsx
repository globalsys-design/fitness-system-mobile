"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  actions?: React.ReactNode;
  className?: string;
  /**
   * When true, the header slides out of view on scroll-down
   * and reappears on scroll-up. Use on list/feed screens.
   * Keep false (default) on forms and detail screens.
   */
  hideOnScroll?: boolean;
}

export function MobileHeader({
  title,
  showBack,
  actions,
  className,
  hideOnScroll = false,
}: MobileHeaderProps) {
  const router = useRouter();
  const scrollDir = useScrollDirection({ threshold: 8 });

  const isHidden = hideOnScroll && scrollDir === "down";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex items-center h-14 px-4 gap-3",
        "bg-background/80 backdrop-blur-md border-b border-border",
        "transition-transform duration-300 ease-out",
        isHidden ? "-translate-y-full" : "translate-y-0",
        className
      )}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {showBack && (
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 -ml-2 rounded-xl text-foreground hover:bg-accent transition-colors active:scale-95"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <h1 className="flex-1 text-base font-semibold text-foreground truncate">
        {title}
      </h1>
      {actions && (
        <div className="flex items-center gap-1">{actions}</div>
      )}
    </header>
  );
}
