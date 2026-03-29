"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function ThemeToggleRow() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  function handleToggle() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex items-center gap-3 w-full px-4 h-14 bg-card hover:bg-accent transition-colors text-left"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
        {isDark ? (
          <Moon className="w-4 h-4 text-foreground" />
        ) : (
          <Sun className="w-4 h-4 text-foreground" />
        )}
      </div>
      <span className="flex-1 text-sm font-medium text-foreground">
        Modo Escuro
      </span>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Alternar modo escuro"
        onClick={(e) => e.stopPropagation()}
      />
    </button>
  );
}
