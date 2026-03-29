"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VerifyPage() {
  const [isResending, setIsResending] = useState(false);

  async function handleResend() {
    setIsResending(true);
    try {
      await signIn("resend", { redirect: false });
      toast.success("Email reenviado!");
    } catch {
      toast.error("Erro ao reenviar email.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 bg-background">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        {/* Ícone */}
        <div className="flex items-center justify-center size-20 rounded-full bg-primary/10">
          <Mail className="size-10 text-primary" />
        </div>

        {/* Mensagem */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground">
            Verifique seu email
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enviamos um link de acesso para o seu email. Clique no link para
            entrar no Fitness System.
          </p>
        </div>

        {/* Card de instrução */}
        <div className="w-full rounded-xl border border-border bg-muted/50 p-4">
          <div className="flex flex-col gap-3 text-left">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                1
              </span>
              <p className="text-sm text-muted-foreground">
                Abra sua caixa de entrada
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                2
              </span>
              <p className="text-sm text-muted-foreground">
                Clique no link &quot;Entrar no Fitness System&quot;
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                3
              </span>
              <p className="text-sm text-muted-foreground">
                Você será redirecionado automaticamente
              </p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="w-full flex flex-col gap-3">
          <Button
            variant="outline"
            className="h-12 w-full text-base"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending && <Loader2 className="size-4 mr-2 animate-spin" />}
            Reenviar email
          </Button>

          <Link href="/login" className="w-full">
            <Button variant="ghost" className="h-12 w-full text-base">
              <ArrowLeft className="size-4 mr-2" />
              Voltar para o login
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          Não recebeu? Verifique sua pasta de spam ou tente outro email.
        </p>
      </div>
    </div>
  );
}
