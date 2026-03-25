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
        "fixed z-40 flex items-center justify-center",
        "w-14 h-14 rounded-full bg-primary text-primary-foreground",
        "shadow-lg hover:shadow-xl active:scale-95 transition-all",
        "bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4",
        className
      )}
      aria-label={label ?? "Ação principal"}
    >
      <Icon className="w-6 h-6" />
    </button>
  );
}
