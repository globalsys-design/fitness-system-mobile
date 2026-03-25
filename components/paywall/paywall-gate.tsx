"use client";

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaywallGateProps {
  feature?: string;
}

export function PaywallGate({ feature }: PaywallGateProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleUpgrade() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO }),
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] px-6 text-center gap-6">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted">
        <Lock className="w-10 h-10 text-muted-foreground" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-foreground">
          Recurso PRO
        </h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          {feature
            ? `"${feature}" está disponível no plano PRO.`
            : "Este recurso está disponível no plano PRO."}
          {" "}Faça upgrade para desbloquear acesso completo.
        </p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <Button
          className="h-12 w-full text-base font-semibold"
          onClick={handleUpgrade}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Fazer upgrade — R$ 97/mês
        </Button>
        <p className="text-xs text-muted-foreground">
          Cancele a qualquer momento
        </p>
      </div>
    </div>
  );
}
