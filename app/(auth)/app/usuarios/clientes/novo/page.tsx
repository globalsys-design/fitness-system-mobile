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
import { clientSchema } from "@/lib/validations";
import { z } from "zod";
import { cn } from "@/lib/utils";

type ClientFormData = z.infer<typeof clientSchema>;

const STEPS = ["Dados pessoais", "Endereço", "Responsável", "Acesso"];

export default function NovoClientePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: { status: "ACTIVE" },
  });

  async function onSubmit(data: ClientFormData) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao salvar");
      toast.success("Cliente cadastrado com sucesso!");
      router.push("/app/usuarios?tab=clientes");
    } catch {
      toast.error("Erro ao cadastrar cliente. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col bg-background" style={{ height: "100dvh" }}>
      <MobileHeader title="Novo Cliente" showBack />

      {/* Stepper */}
      <div className="flex items-center px-4 py-3 gap-1.5 overflow-x-auto border-b border-border">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-colors",
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" inputMode="email" className="h-12 mt-1.5" {...form.register("email")} />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" type="tel" inputMode="tel" className="h-12 mt-1.5" {...form.register("phone")} />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" className="h-12 mt-1.5" placeholder="000.000.000-00" {...form.register("cpf")} />
              </div>
              <div>
                <Label htmlFor="birthDate">Data de nascimento</Label>
                <Input id="birthDate" type="date" className="h-12 mt-1.5" {...form.register("birthDate")} />
              </div>
              <div>
                <Label>Gênero</Label>
                <Select onValueChange={(v) => { if (v !== null) form.setValue("gender", v as string); }}>
                  <SelectTrigger className="h-12 mt-1.5">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Preencha o CEP para autocompletar o endereço.
              </p>
              <div>
                <Label>CEP</Label>
                <Input className="h-12 mt-1.5" placeholder="00000-000" inputMode="numeric" />
              </div>
              <div>
                <Label>Logradouro</Label>
                <Input className="h-12 mt-1.5" placeholder="Rua, Av..." />
              </div>
              <div>
                <Label>Número</Label>
                <Input className="h-12 mt-1.5" inputMode="numeric" />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input className="h-12 mt-1.5" />
              </div>
              <div>
                <Label>Estado</Label>
                <Input className="h-12 mt-1.5" maxLength={2} placeholder="SP" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium text-foreground">Contato de emergência</p>
              <div>
                <Label>Nome do responsável</Label>
                <Input className="h-12 mt-1.5" />
              </div>
              <div>
                <Label>Telefone de emergência</Label>
                <Input type="tel" inputMode="tel" className="h-12 mt-1.5" />
              </div>
              <div>
                <Label>Parentesco</Label>
                <Input className="h-12 mt-1.5" placeholder="ex: Mãe, Pai, Cônjuge" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Configure o acesso do cliente ao sistema.
              </p>
              <div>
                <Label>Email de acesso</Label>
                <Input type="email" inputMode="email" className="h-12 mt-1.5" {...form.register("email")} />
              </div>
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
        </form>
      </div>

      {/* Navigation */}
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
            Salvar cliente
          </Button>
        )}
      </div>
    </div>
  );
}
