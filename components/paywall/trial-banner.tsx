"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  daysLeft: number;
  className?: string;
}

export function TrialBanner({ daysLeft, className }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 bg-primary/10 border-b border-primary/20",
        className
      )}
    >
      <p className="flex-1 text-xs text-primary font-medium">
        Trial: {daysLeft} {daysLeft === 1 ? "dia" : "dias"} restantes.{" "}
        <Link href="/app/settings/billing" className="underline font-semibold">
          Fazer upgrade
        </Link>
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-primary/60 hover:text-primary"
        aria-label="Fechar banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
