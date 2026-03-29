"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function RecuperarSenhaEnviadoContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [isResending, setIsResending] = useState(false);

  // Mascara o email: ex***@gmail.com
  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_m, start, _mid, end) => {
        return `${start}${"*".repeat(Math.max(_mid.length, 3))}${end}`;
      })
    : "";

  async function handleResend() {
    if (!email) return;

    setIsResending(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("Email reenviado com sucesso!");
      } else {
        toast.error("Erro ao reenviar. Tente novamente.");
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 bg-background">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        {/* Ícone de sucesso */}
        <div className="flex items-center justify-center size-20 rounded-full bg-primary/10">
          <Mail className="size-10 text-primary" />
        </div>

        {/* Mensagem */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground">
            Email enviado!
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enviamos um link de recuperação para{" "}
            {maskedEmail ? (
              <span className="font-medium text-foreground">{maskedEmail}</span>
            ) : (
              "seu email"
            )}
            . Verifique sua caixa de entrada.
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
                Abra o email que enviamos
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                2
              </span>
              <p className="text-sm text-muted-foreground">
                Clique em &quot;Redefinir Senha&quot;
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                3
              </span>
              <p className="text-sm text-muted-foreground">
                Crie sua nova senha
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
