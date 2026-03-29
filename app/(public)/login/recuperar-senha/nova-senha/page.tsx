import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function ResetPasswordContent() {
  return <ResetPasswordForm />;
}

export default function NovaSenhaPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {/* Header com voltar */}
      <div className="flex items-center px-4 pt-safe-top">
        <Link
          href="/login"
          className="flex items-center justify-center size-12 -ml-2 text-muted-foreground active:text-foreground"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-5" />
        </Link>
      </div>

      {/* Conteúdo centralizado */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="w-full max-w-sm flex flex-col gap-8">
          {/* Header visual */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center size-20 rounded-full bg-primary/10">
              <ShieldCheck className="size-10 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Nova senha
              </h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Crie uma nova senha segura para sua conta. Mínimo de 8
                caracteres.
              </p>
            </div>
          </div>

          <Suspense fallback={null}>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
