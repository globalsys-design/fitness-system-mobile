"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { assistantSchema } from "@/lib/validations";
import { z } from "zod";
import { cn } from "@/lib/utils";

type AssistantFormData = z.infer<typeof assistantSchema>;

const STEPS = ["Dados pessoais", "Endereço e profissão", "Permissões e acesso"];

export default function NovoAssistentePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AssistantFormData>({
    resolver: zodResolver(assistantSchema) as any,
    defaultValues: { status: "ACTIVE" },
  });

  async function onSubmit(data: AssistantFormData) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/assistants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao salvar");
      toast.success("Assistente cadastrado com sucesso!");
      router.push("/app/usuarios?tab=assistentes");
    } catch {
      toast.error("Erro ao cadastrar assistente. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col bg-background" style={{ height: "100dvh" }}>
      <MobileHeader title="Novo Assistente" showBack />

      {/* Stepper */}
      <div className="flex items-center px-4 py-3 gap-1.5 overflow-x-auto border-b border-border">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-colors",
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {i < step ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            <span className={cn("text-xs", i === step ? "text-foreground font-medium" : "text-muted-foreground")}>
              {s}
            </span>
            {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="name">Nome completo *</Label>
              <Input id="name" className="h-12 mt-1.5" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" inputMode="email" className="h-12 mt-1.5" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label>Telefone</Label>
              <Input type="tel" inputMode="tel" className="h-12 mt-1.5" {...form.register("phone")} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <Label>CEP</Label>
              <Input className="h-12 mt-1.5" placeholder="00000-000" inputMode="numeric" />
            </div>
            <div>
              <Label>Logradouro</Label>
              <Input className="h-12 mt-1.5" />
            </div>
            <div>
              <Label>Profissão</Label>
              <Select onValueChange={(v) => { if (v !== null) form.setValue("profession", v as string); }}>
                <SelectTrigger className="h-12 mt-1.5">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Médico">Médico</SelectItem>
                  <SelectItem value="Nutricionista">Nutricionista</SelectItem>
                  <SelectItem value="Fisioterapeuta">Fisioterapeuta</SelectItem>
                  <SelectItem value="Educador Físico">Educador Físico</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Configure o acesso e permissões do assistente.
            </p>
            <div>
              <Label>Status da conta</Label>
              <Select onValueChange={(v) => { if (v !== null) form.setValue("status", v as any); }} defaultValue="ACTIVE">
                <SelectTrigger className="h-12 mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div
        className="flex items-center gap-3 px-4 py-4 border-t border-border bg-background"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        {step > 0 && (
          <Button variant="outline" className="h-12 flex-1" onClick={() => setStep(step - 1)}>
            Voltar
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button className="h-12 flex-1" onClick={() => setStep(step + 1)}>
            Continuar
          </Button>
        ) : (
          <Button
            className="h-12 flex-1"
            onClick={form.handleSubmit(onSubmit as any)}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar assistente
          </Button>
        )}
      </div>
    </div>
  );
}
