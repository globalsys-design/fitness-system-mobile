import { LoginForm } from "@/components/auth/login-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function LoginClientePage() {
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
          {/* Logo e branding cliente */}
          <div className="flex flex-col items-center gap-3">
            <BrandLogo variant="horizontal" priority className="h-10 w-48 mx-auto" />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Acesso do Cliente
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Acompanhe seus treinos e evolução
              </p>
            </div>
          </div>

          <LoginForm variant="client" />
        </div>
      </div>
    </div>
  );
}
