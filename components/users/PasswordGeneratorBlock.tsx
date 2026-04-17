"use client";

import { useState } from "react";
import { Eye, EyeOff, RefreshCw, Copy, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Gera uma senha aleatória de 12 caracteres usando crypto.getRandomValues */
export function generatePassword(length = 12): string {
  const chars =
    "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => chars[n % chars.length]).join("");
}

interface PasswordGeneratorBlockProps {
  /** Valor atual da senha (vazio por padrão). */
  value: string;
  /** Callback chamado quando a senha muda (input manual ou gerado). */
  onChange: (password: string) => void;
}

/**
 * Bloco reutilizável de geração de senha.
 * Funciona tanto dentro de <FormProvider> (via setValue) quanto
 * em páginas de detalhe com estado local.
 */
export function PasswordGeneratorBlock({
  value,
  onChange,
}: PasswordGeneratorBlockProps) {
  const [visible, setVisible] = useState(false);

  function handleGenerate() {
    const pwd = generatePassword();
    onChange(pwd);
    setVisible(true); // exibe a senha recém-gerada
  }

  async function handleCopy() {
    if (!value) {
      toast.error("Nenhuma senha para copiar.");
      return;
    }
    try {
      // Defensive: Clipboard API requer HTTPS + permissão do usuário.
      // Em alguns contextos (iframe, http, permissões revogadas) writeText
      // lança "Write permission denied" ou nem existe.
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        toast.success("Senha copiada!");
      } else {
        throw new Error("Clipboard não suportado");
      }
    } catch (err) {
      console.warn("[PasswordGeneratorBlock] clipboard falhou:", err);
      toast.error("Erro ao copiar. Selecione o texto manualmente.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ── Banner informativo ───────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
        <Info className="size-4 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Sobre o acesso</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Gere uma senha clicando em "Gerar". A senha deve ter no mínimo 8
            caracteres. Use "Copiar" para enviar ao utilizador.{" "}
            <span className="font-medium text-foreground/70">
              A senha não poderá ser visualizada após sair desta aba.
            </span>
          </p>
        </div>
      </div>

      {/* ── Campo de senha ───────────────────────────────────────── */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Nova senha
        </label>
        <div className="relative mt-1.5">
          <Input
            type={visible ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pr-11 h-12"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          >
            {visible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      {/* ── Action row (Thumb Zone) ──────────────────────────────── */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          className="flex-1 h-10 gap-1.5"
        >
          <RefreshCw className="size-3.5" />
          Gerar senha
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={!value}
          className="flex-1 h-10 gap-1.5"
        >
          <Copy className="size-3.5" />
          Copiar
        </Button>
      </div>
    </div>
  );
}
