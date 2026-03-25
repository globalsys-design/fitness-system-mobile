"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/validations";
import { z } from "zod";

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: LoginFormData) {
    setIsEmailLoading(true);
    try {
      const result = await signIn("resend", {
        email: data.email,
        redirect: false,
        callbackUrl: "/app",
      });
      if (result?.error) {
        toast.error("Erro ao enviar email. Tente novamente.");
      } else {
        toast.success("Email enviado! Verifique sua caixa de entrada.");
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsEmailLoading(false);
    }
  }

  async function handleGoogle() {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/app" });
    } catch {
      toast.error("Erro ao conectar com Google. Tente novamente.");
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            inputMode="email"
            autoComplete="email"
            className="h-12 text-base"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="h-12 text-base font-medium w-full"
          disabled={isEmailLoading}
        >
          {isEmailLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Entrar com Email
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">ou</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Button
        variant="outline"
        className="h-12 text-base font-medium w-full"
        onClick={handleGoogle}
        disabled={isGoogleLoading}
        type="button"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        Entrar com Google
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Ao entrar, você concorda com nossos{" "}
        <span className="underline cursor-pointer">Termos de Uso</span>
      </p>
    </div>
  );
}
