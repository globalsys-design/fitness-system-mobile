"use client";

import { useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import type { ClientFormData } from "@/lib/validations/client";
import { GENDER_OPTIONS } from "@/lib/validations/client";
import { cn } from "@/lib/utils";

const GENDER_META: Record<string, { emoji: string }> = {
  M: { emoji: "♂️" },
  F: { emoji: "♀️" },
  OTHER: { emoji: "⚧️" },
  PREFER_NOT: { emoji: "🔒" },
};

export function GenderStep() {
  const { watch, setValue } = useFormContext<ClientFormData>();
  const gender = watch("gender");

  return (
    <div className="flex flex-col gap-10">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Qual o<br />seu género?
        </h1>
        <p className="text-base text-muted-foreground">
          Ajuda a personalizar a avaliação física
        </p>
      </div>

      {/* Simple Selection Cards */}
      <div className="flex flex-col gap-3">
        {GENDER_OPTIONS.map((option) => {
          const isSelected = gender === option.value;
          const meta = GENDER_META[option.value];

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue("gender", isSelected ? "" : option.value)}
              className={cn(
                "w-full flex items-center justify-between px-5 py-4 rounded-2xl",
                "border-2 font-medium text-left text-base",
                "transition-all duration-200 active:scale-[0.98]",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "border-border bg-muted/40 text-foreground hover:bg-muted/70 hover:border-muted-foreground/30"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{meta?.emoji}</span>
                <span>{option.label}</span>
              </div>
              <div
                className={cn(
                  "size-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                  isSelected
                    ? "border-primary-foreground bg-primary-foreground/20"
                    : "border-border"
                )}
              >
                {isSelected && <Check className="size-3 text-primary-foreground" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Pode ignorar este campo se preferir
      </p>
    </div>
  );
}
