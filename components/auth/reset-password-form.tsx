"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema } from "@/lib/validations";
import { z } from "zod";
import Link from "next/link";

type ResetFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetPasswordSchema) as any,
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(data: ResetFormData) {
    if (!token || !email) {
      toast.error("Link de recuperação inválido.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error ?? "Erro ao redefinir senha.");
        return;
      }

      setIsSuccess(true);
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  // Estado de sucesso
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex items-center justify-center size-20 rounded-full bg-primary/10">
          <CheckCircle2 className="size-10 text-primary" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-foreground">
            Senha redefinida!
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sua senha foi alterada com sucesso. Agora você pode fazer login com
            a nova senha.
          </p>
        </div>

        <Link href="/login" className="w-full">
          <Button className="text-base font-medium w-full">
            Ir para o login
          </Button>
        </Link>
      </div>
    );
  }

  // Token inválido
  if (!token || !email) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex items-center justify-center size-20 rounded-full bg-destructive/10">
          <svg
            className="size-10 text-destructive"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-foreground">
            Link inválido
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Este link de recuperação é inválido ou expirou. Solicite um novo
            link de recuperação.
          </p>
        </div>

        <Link href="/login/recuperar-senha" className="w-full">
          <Button variant="outline" className="text-base font-medium w-full">
            Solicitar novo link
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit as any)}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password">Nova senha</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            className="text-base pr-12"
            {...form.register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground active:text-foreground min-h-11 min-w-11 flex items-center justify-center"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-xs text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm-password">Confirmar nova senha</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            placeholder="Repita a nova senha"
            autoComplete="new-password"
            className="text-base pr-12"
            {...form.register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground active:text-foreground min-h-11 min-w-11 flex items-center justify-center"
            aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
          >
            {showConfirm ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="text-xs text-destructive">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="text-base font-medium w-full"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
        Redefinir senha
      </Button>
    </form>
  );
}
