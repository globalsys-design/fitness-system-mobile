"use client";

import { useState } from "react";
import { Loader2, Check, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plan } from "@prisma/client";
import { isTrialActive, isSubscribed, daysLeftInTrial } from "@/lib/subscription";

interface BillingContentProps {
  user: {
    plan: Plan;
    trialEndsAt: Date | null;
    stripeCurrentPeriodEnd: Date | null;
    stripeCustomerId: string | null;
  };
}

const PRO_FEATURES = [
  "Clientes ilimitados",
  "Assistentes ilimitados",
  "Avaliações ilimitadas",
  "Exportação de PDF",
  "Comparação de avaliações",
  "Upload de anexos",
  "Calendário completo",
  "Notificações push",
  "Suporte prioritário",
];

export function BillingContent({ user }: BillingContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const trialActive = isTrialActive(user as any);
  const subscribed = isSubscribed(user as any);
  const daysLeft = daysLeftInTrial(user as any);

  async function handleUpgrade() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      toast.error("Erro ao processar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePortal() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/billing-portal", { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      toast.error("Erro ao abrir portal. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Status atual */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
              {subscribed ? (
                <Crown className="w-6 h-6 text-primary" />
              ) : (
                <Zap className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">
                  Plano {user.plan === Plan.PRO ? "PRO" : user.plan === Plan.TRIAL ? "Trial" : "Free"}
                </p>
                <Badge variant={subscribed ? "default" : trialActive ? "secondary" : "outline"}>
                  {subscribed ? "Ativo" : trialActive ? `${daysLeft} dias` : "Gratuito"}
                </Badge>
              </div>
              {trialActive && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Trial encerra em {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
                </p>
              )}
              {subscribed && user.stripeCurrentPeriodEnd && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Renova em {new Date(user.stripeCurrentPeriodEnd).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {!subscribed && (
        <>
          {/* Plano PRO */}
          <Card className="border-primary/50 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-foreground text-lg">PRO</h3>
                    <Badge className="bg-primary text-primary-foreground text-xs">Recomendado</Badge>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-foreground">R$ 97</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>
                </div>
              </div>

              <ul className="flex flex-col gap-2 mb-5">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="h-12 w-full text-base font-semibold"
                onClick={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {trialActive ? "Fazer upgrade agora" : "Assinar PRO"}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-2">
                Cancele a qualquer momento
              </p>
            </CardContent>
          </Card>

          {/* Plano Free */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-2">Plano Free</h3>
              <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                <li>• Até 1 assistente</li>
                <li>• Até 10 clientes</li>
                <li>• Até 2 avaliações por cliente</li>
                <li>• Até 5 prescrições</li>
                <li>• Sem exportação PDF</li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {subscribed && (
        <Button
          variant="outline"
          className="h-12 w-full"
          onClick={handlePortal}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Gerenciar assinatura
        </Button>
      )}
    </div>
  );
}
