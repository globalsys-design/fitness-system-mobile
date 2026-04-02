import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FABProps {
  icon: LucideIcon;
  onClick: () => void;
  label?: string;
  className?: string;
}

export function FAB({ icon: Icon, onClick, label, className }: FABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed z-50 flex items-center justify-center",
        "w-14 h-14 rounded-full bg-primary text-primary-foreground font-semibold",
        "shadow-2xl hover:shadow-2xl active:scale-95 transition-all",
        "bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] right-6",
        className
      )}
      aria-label={label ?? "Ação principal"}
      title={label ?? "Ação principal"}
    >
      <Icon className="w-6 h-6" />
    </button>
  );
}
