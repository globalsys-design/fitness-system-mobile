"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type RiskLevel = "low" | "moderate" | "high" | "very-high";

interface RiskDashboardCardProps {
  title: string;
  score: number;
  maxScore: number;
  riskLevel: RiskLevel;
  description: string;
}

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; barColor: string; badgeBg: string; badgeText: string }
> = {
  low: {
    label: "Baixo",
    barColor: "bg-primary",
    badgeBg: "bg-primary/10",
    badgeText: "text-primary",
  },
  moderate: {
    label: "Moderado",
    barColor: "bg-warning",
    badgeBg: "bg-warning/10",
    badgeText: "text-warning",
  },
  high: {
    label: "Alto",
    barColor: "bg-destructive",
    badgeBg: "bg-destructive/10",
    badgeText: "text-destructive",
  },
  "very-high": {
    label: "Muito Alto",
    barColor: "bg-destructive",
    badgeBg: "bg-destructive/15",
    badgeText: "text-destructive",
  },
};

export function RiskDashboardCard({
  title,
  score,
  maxScore,
  riskLevel,
  description,
}: RiskDashboardCardProps) {
  const config = RISK_CONFIG[riskLevel];
  const percentage = Math.min((score / maxScore) * 100, 100);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <Badge
            variant="secondary"
            className={cn("text-xs px-2 py-0.5", config.badgeBg, config.badgeText)}
          >
            {config.label}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Pontuação</span>
            <span className="font-semibold text-foreground">
              {score} / {maxScore}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", config.barColor)}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
