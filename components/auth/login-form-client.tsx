"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { credentialsLoginSchema } from "@/lib/validations";
import { z } from "zod";
import Link from "next/link";

type LoginFormData = z.infer<typeof credentialsLoginSchema>;

export function LoginFormClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(credentialsLoginSchema) as any,
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: "/app",
      });

      if (result?.error) {
        toast.error("Email ou senha incorretos.");
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMagicLink() {
    const email = form.getValues("email");
    if (!email) {
      form.setError("email", { message: "Informe o email primeiro" });
      return;
    }

    setIsMagicLinkLoading(true);
    try {
      const result = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl: "/app",
      });
      if (result?.error) {
        toast.error("Erro ao enviar email. Tente novamente.");
      } else {
        router.push("/login/verify");
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsMagicLinkLoading(false);
    }
  }

  async function handleGoogle() {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/app" });
    } catch {
      toast.error("Erro ao conectar com Google.");
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Formulário Email + Senha */}
      <form
        onSubmit={form.handleSubmit(onSubmit as any)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="client-email">Email</Label>
          <Input
            id="client-email"
            type="email"
            placeholder="seu@email.com"
            inputMode="email"
            autoComplete="email"
            className="text-base"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="client-password">Senha</Label>
            <Link
              href="/login/recuperar-senha"
              className="text-xs text-primary font-medium active:opacity-70"
            >
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <Input
              id="client-password"
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha"
              autoComplete="current-password"
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

        <Button
          type="submit"
          className="text-base font-medium w-full"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
          Acessar meus treinos
        </Button>
      </form>

      {/* Separador */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">ou continue com</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Botões sociais */}
      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          className="text-base font-medium w-full"
          onClick={handleGoogle}
          disabled={isGoogleLoading}
          type="button"
        >
          {isGoogleLoading ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <svg className="size-5 mr-2" viewBox="0 0 24 24">
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
          Google
        </Button>

        <Button
          variant="outline"
          className="text-base font-medium w-full"
          onClick={handleMagicLink}
          disabled={isMagicLinkLoading}
          type="button"
        >
          {isMagicLinkLoading ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Mail className="size-5 mr-2" />
          )}
          Magic Link por Email
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Ao acessar, você concorda com os{" "}
        <Link href="#" className="underline active:opacity-70">
          Termos de Uso
        </Link>{" "}
        e{" "}
        <Link href="#" className="underline active:opacity-70">
          Política de Privacidade
        </Link>
      </p>
    </div>
  );
}
