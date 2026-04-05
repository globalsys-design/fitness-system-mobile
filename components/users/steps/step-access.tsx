"use client";

import { useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff, RefreshCw, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ClientFormData } from "@/lib/validations/client";

function generatePassword(length = 12): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "!@#$%&*";
  const all = upper + lower + digits + symbols;

  // Guarantee at least one of each type
  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    digits[Math.floor(Math.random() * digits.length)] +
    symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

interface StepAccessProps {
  onGoToStep?: (step: number) => void;
}

export function StepAccess({ onGoToStep }: StepAccessProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ClientFormData>();

  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const watched = watch();
  const email = watched.email || "";
  const password = watched.password || "";
  const isActive = watched.status === "ACTIVE";

  const handleGenerate = useCallback(() => {
    const pwd = generatePassword();
    setValue("password", pwd, { shouldValidate: true });
    setShowPassword(true);
  }, [setValue]);

  const handleCopy = useCallback(async () => {
    if (!password) {
      toast.error("Nenhuma senha para copiar.");
      return;
    }
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success("Senha copiada!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  }, [password]);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        Configure o acesso do cliente ao sistema.
      </p>

      {/* Email (read-only, vem do Step 1) */}
      <div>
        <Label htmlFor="access-email">Email de acesso</Label>
        <Input
          id="access-email"
          type="email"
          className="mt-1.5 bg-muted/50"
          value={email}
          readOnly
          disabled
        />
        {!email && (
          <div className="flex items-center gap-1 mt-1">
            <p className="text-xs text-muted-foreground">
              Preencha o email no Passo 1 para habilitar o acesso.
            </p>
            {onGoToStep && (
              <button
                type="button"
                onClick={() => onGoToStep(0)}
                className="text-xs text-primary font-medium hover:underline shrink-0"
              >
                Ir agora →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Nova Senha */}
      <div>
        <Label htmlFor="access-password">Nova senha</Label>
        <div className="relative mt-1.5">
          <Input
            id="access-password"
            type={showPassword ? "text" : "password"}
            className="pr-12"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleGenerate}
        >
          <RefreshCw className="size-4 mr-2" />
          Gerar senha
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleCopy}
          disabled={!password}
        >
          {copied ? (
            <Check className="size-4 mr-2 text-primary" />
          ) : (
            <Copy className="size-4 mr-2" />
          )}
          {copied ? "Copiada!" : "Copiar"}
        </Button>
      </div>

      {/* Password strength hint */}
      {password && (
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground mb-2">
            Força da senha:
          </p>
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => {
              const strength = getStrength(password);
              const active = i < strength;
              return (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    !active
                      ? "bg-muted"
                      : strength <= 1
                        ? "bg-destructive"
                        : strength <= 2
                          ? "bg-warning"
                          : "bg-primary"
                  )}
                />
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {getStrengthLabel(password)}
          </p>
        </div>
      )}

      {/* Toggle Cliente Ativo */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 mt-2">
        <div>
          <p className="text-sm font-medium text-foreground">Cliente ativo</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Clientes inativos não podem acessar o sistema.
          </p>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={(checked) =>
            setValue("status", checked ? "ACTIVE" : "INACTIVE")
          }
        />
      </div>
    </div>
  );
}

function getStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function getStrengthLabel(password: string): string {
  const s = getStrength(password);
  if (s <= 1) return "Fraca";
  if (s === 2) return "Razoável";
  if (s === 3) return "Boa";
  return "Forte";
}
