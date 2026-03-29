"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recoveryEmailSchema } from "@/lib/validations";
import { z } from "zod";

type RecoveryFormData = z.infer<typeof recoveryEmailSchema>;

export function RecoveryEmailForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RecoveryFormData>({
    resolver: zodResolver(recoveryEmailSchema) as any,
    defaultValues: { email: "" },
  });

  async function onSubmit(data: RecoveryFormData) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        toast.error("Erro ao enviar email. Tente novamente.");
        return;
      }

      // Redireciona para tela de sucesso com o email como query param
      router.push(
        `/login/recuperar-senha/enviado?email=${encodeURIComponent(data.email)}`
      );
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit as any)}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recovery-email">Email cadastrado</Label>
        <Input
          id="recovery-email"
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

      <Button
        type="submit"
        className="text-base font-medium w-full"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
        Enviar link de recuperação
      </Button>
    </form>
  );
}
