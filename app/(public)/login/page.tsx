import Link from "next/link";
import { Dumbbell, Users } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 bg-background">
      <div className="w-full max-w-sm flex flex-col gap-10">
        {/* Logo e branding */}
        <div className="flex flex-col items-center gap-4">
          <BrandLogo variant="vertical" priority className="h-28 w-52 mx-auto" />
          <p className="text-sm text-muted-foreground text-center">
            Gestão profissional de avaliação física
          </p>
        </div>

        {/* Seleção de perfil */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground text-center">
            Como você deseja acessar?
          </p>

          {/* Card Profissional */}
          <Link href="/login/profissional" className="group">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card active:bg-muted/50 transition-colors">
              <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary">
                <Dumbbell className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-foreground">
                  Profissional
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gerencie avaliações, clientes e prescrições
                </p>
              </div>
              <svg
                className="size-5 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>

          {/* Card Cliente */}
          <Link href="/login/cliente" className="group">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card active:bg-muted/50 transition-colors">
              <div className="flex items-center justify-center size-12 rounded-xl bg-secondary/10 text-secondary">
                <Users className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-foreground">
                  Cliente
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Acesse seus treinos e avaliações
                </p>
              </div>
              <svg
                className="size-5 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Sistema profissional para avaliação física e prescrição de treinos.
        </p>
      </div>
    </div>
  );
}
