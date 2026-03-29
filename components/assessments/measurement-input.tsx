"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MeasurementInputProps {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  guideImage?: string;
  guideTip?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}

export function MeasurementInput({
  label,
  unit,
  value,
  onChange,
  guideImage,
  guideTip,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  placeholder = "0",
  min,
  max,
}: MeasurementInputProps) {
  const [showGuide, setShowGuide] = useState(false);

  function handleChange(val: string) {
    if (val === "") {
      onChange("");
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num)) return;
    if (min !== undefined && num < min) return;
    if (max !== undefined && num > max) return;
    onChange(val);
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {Icon && (
            <div
              className={cn(
                "flex items-center justify-center size-9 rounded-xl shrink-0",
                iconBg
              )}
            >
              <Icon className={cn("size-4", iconColor)} />
            </div>
          )}
          <Label className="text-sm font-medium flex-1">{label}</Label>
          {(guideImage || guideTip) && (
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center gap-1 text-xs text-primary font-medium min-h-[2.75rem] px-2 active:opacity-70"
            >
              <HelpCircle className="size-3.5" />
              Técnica
              {showGuide ? (
                <ChevronUp className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="decimal"
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 text-base"
          />
          <span className="text-sm text-muted-foreground w-14 text-center shrink-0">
            {unit}
          </span>
        </div>

        {showGuide && (guideTip || guideImage) && (
          <div className="mt-3 p-3 rounded-xl bg-muted/50 border border-border space-y-2">
            {guideImage && (
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <Image
                  src={guideImage}
                  alt={`Guia: ${label}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            )}
            {guideTip && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {guideTip}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
