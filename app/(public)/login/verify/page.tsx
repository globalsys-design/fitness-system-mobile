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
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
          <Mail className="w-10 h-10 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Verifique seu email</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Enviamos um link de acesso para o seu email. Clique no link para entrar no
            Fitness System.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <Button
            variant="outline"
            className="h-12 w-full"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Reenviar email
          </Button>

          <Link href="/login">
            <Button variant="ghost" className="h-12 w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
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
