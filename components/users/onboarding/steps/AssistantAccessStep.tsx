"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { PasswordGeneratorBlock } from "@/components/users/PasswordGeneratorBlock";
import type { AssistantFormData } from "@/lib/validations";

export function AssistantAccessStep() {
  const { watch, setValue } = useFormContext<AssistantFormData>();
  const password = watch("password") ?? "";
  const [grantAccess, setGrantAccess] = useState(false);

  function handleToggle() {
    const next = !grantAccess;
    setGrantAccess(next);
    if (!next) setValue("password", "");
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Acesso ao<br />sistema
        </h1>
        <p className="text-base text-muted-foreground">
          Configure a senha para este assistente entrar na plataforma
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Toggle principal */}
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            "w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 text-left",
            "transition-all duration-200 active:scale-[0.98]",
            grantAccess
              ? "border-primary bg-primary/8"
              : "border-border bg-muted/40 hover:bg-muted/70 hover:border-muted-foreground/30"
          )}
        >
          <div className="flex flex-col flex-1 min-w-0 pr-4">
            <span
              className={cn(
                "font-semibold text-base leading-tight transition-colors",
                grantAccess ? "text-primary" : "text-foreground"
              )}
            >
              Permitir acesso ao sistema
            </span>
            <span className="text-sm text-muted-foreground mt-0.5">
              O assistente poderá entrar na plataforma com email e senha
            </span>
          </div>
          <div
            className={cn(
              "size-6 rounded-full border-2 shrink-0 flex items-center justify-center",
              "transition-all duration-200",
              grantAccess ? "border-primary bg-primary" : "border-border"
            )}
          >
            {grantAccess && (
              <svg
                className="size-3.5 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>

        {/* Gerador de senha — condicional */}
        {grantAccess && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <PasswordGeneratorBlock
              value={password}
              onChange={(pwd) => setValue("password", pwd, { shouldValidate: true })}
            />
            {password.length > 0 && password.length < 8 && (
              <p className="text-xs text-destructive mt-2">
                A senha deve ter no mínimo 8 caracteres.
              </p>
            )}
          </div>
        )}

        {!grantAccess && (
          <div className="flex items-start gap-3 bg-muted/40 rounded-2xl px-4 py-3.5">
            <span className="text-lg mt-0.5 shrink-0">🔒</span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sem acesso ativo, o assistente só poderá ser gerido pelo profissional responsável.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
