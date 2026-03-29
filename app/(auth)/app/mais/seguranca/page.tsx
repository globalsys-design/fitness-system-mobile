"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { passwordSchema } from "@/lib/validations";
import { z } from "zod";

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SegurancaPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  async function onSubmit(data: PasswordFormData) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? "Erro");
      }
      toast.success("Senha alterada com sucesso!");
      form.reset();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao alterar senha.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <MobileLayout title="Segurança" showBack>
      <div className="p-4 flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">
          Altere sua senha de acesso ao sistema.
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <Label>Senha atual</Label>
            <div className="relative mt-1.5">
              <Input
                type={showCurrent ? "text" : "password"}
                className="pr-12"
                {...form.register("currentPassword")}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.formState.errors.currentPassword && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <Label>Nova senha</Label>
            <div className="relative mt-1.5">
              <Input
                type={showNew ? "text" : "password"}
                className="pr-12"
                {...form.register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.formState.errors.newPassword && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <Label>Confirmar nova senha</Label>
            <Input
              type="password"
              className="mt-1.5"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <Button
          className="w-full"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Alterar senha
        </Button>
      </div>
    </MobileLayout>
  );
}
