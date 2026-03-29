"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ChevronRight, Check, User, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { PermissionsToggle, PermissionsMap } from "@/components/users/permissions-toggle";
import { assistantSchema } from "@/lib/validations";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { PROFESSIONS } from "@/lib/constants/professions";

type AssistantFormData = z.infer<typeof assistantSchema>;

const STEPS = [
  { label: "Dados pessoais", icon: User },
  { label: "Endereço e profissão", icon: MapPin },
  { label: "Permissões e acesso", icon: Shield },
];

const DEFAULT_PERMISSIONS: PermissionsMap = {
  clients: { read: true, write: false },
  assessments: { read: true, write: false },
  prescriptions: { read: true, write: false },
  calendar: { read: true, write: false },
  billing: { read: false, write: false },
};

export default function NovoAssistentePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionsMap>(DEFAULT_PERMISSIONS);

  const form = useForm<AssistantFormData>({
    resolver: zodResolver(assistantSchema) as any,
    defaultValues: {
      status: "ACTIVE",
      permissions: DEFAULT_PERMISSIONS,
    },
  });

  // Validação por step antes de avançar
  async function handleNext() {
    let isValid = true;

    if (step === 0) {
      isValid = await form.trigger(["name", "email"]);
      if (!isValid) {
        toast.error("Preencha os campos obrigatórios.");
        return;
      }
    }

    setStep(step + 1);
  }

  async function onSubmit(data: AssistantFormData) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/assistants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          permissions,
        }),
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

      {/* Stepper visual */}
      <div className="flex items-center px-4 py-3 gap-2 border-b border-border bg-card">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={cn(
                  "flex items-center justify-center size-8 rounded-full text-xs font-semibold transition-all shrink-0",
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <Check className="size-4" /> : <Icon className="size-4" />}
              </div>
              <span
                className={cn(
                  "text-xs truncate hidden sm:block",
                  i === step
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 rounded-full min-w-4",
                    i < step ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step indicator mobile */}
      <div className="px-4 pt-3">
        <p className="text-xs text-muted-foreground">
          Passo {step + 1} de {STEPS.length}
        </p>
        <p className="text-base font-semibold text-foreground mt-0.5">
          {STEPS[step].label}
        </p>
      </div>

      {/* Conteúdo do step */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {/* Step 1: Dados pessoais */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                className="mt-1.5"
                placeholder="Nome do assistente"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                className="mt-1.5"
                placeholder="email@exemplo.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                className="mt-1.5"
                placeholder="(00) 00000-0000"
                {...form.register("phone")}
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                inputMode="numeric"
                className="mt-1.5"
                placeholder="000.000.000-00"
                {...form.register("cpf")}
              />
            </div>
          </div>
        )}

        {/* Step 2: Endereço e profissão */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <Label>Profissão</Label>
              <Select
                onValueChange={(v) => {
                  if (v !== null) form.setValue("profession", v as string);
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione a profissão" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cidade natal</Label>
              <Input
                className="mt-1.5"
                placeholder="Cidade"
                onChange={(e) => form.setValue("birthCity", e.target.value)}
              />
            </div>

            <div className="border-t border-border pt-4 mt-2">
              <p className="text-sm font-medium text-foreground mb-3">
                Endereço
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <Label>CEP</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="00000-000"
                    inputMode="numeric"
                    onChange={(e) =>
                      form.setValue("address", {
                        ...((form.getValues("address") as any) ?? {}),
                        cep: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Logradouro</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="Rua, Av..."
                    onChange={(e) =>
                      form.setValue("address", {
                        ...((form.getValues("address") as any) ?? {}),
                        street: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Número</Label>
                    <Input
                      className="mt-1.5"
                      inputMode="numeric"
                      onChange={(e) =>
                        form.setValue("address", {
                          ...((form.getValues("address") as any) ?? {}),
                          number: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Complemento</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="Apto, sala..."
                      onChange={(e) =>
                        form.setValue("address", {
                          ...((form.getValues("address") as any) ?? {}),
                          complement: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Bairro</Label>
                  <Input
                    className="mt-1.5"
                    onChange={(e) =>
                      form.setValue("address", {
                        ...((form.getValues("address") as any) ?? {}),
                        neighborhood: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label>Cidade</Label>
                    <Input
                      className="mt-1.5"
                      onChange={(e) =>
                        form.setValue("address", {
                          ...((form.getValues("address") as any) ?? {}),
                          city: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>UF</Label>
                    <Input
                      className="mt-1.5"
                      maxLength={2}
                      onChange={(e) =>
                        form.setValue("address", {
                          ...((form.getValues("address") as any) ?? {}),
                          state: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Permissões e acesso */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            {/* Status */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Conta ativa
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    O assistente poderá acessar o sistema imediatamente
                  </p>
                </div>
                <Switch
                  checked={form.watch("status") === "ACTIVE"}
                  onCheckedChange={(checked) =>
                    form.setValue("status", checked ? "ACTIVE" : "INACTIVE")
                  }
                />
              </div>
            </div>

            {/* Permissões */}
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Permissões de acesso
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Defina o que o assistente poderá visualizar e editar
              </p>
              <PermissionsToggle
                permissions={permissions}
                onChange={setPermissions}
              />
            </div>
          </div>
        )}
      </div>

      {/* Barra de ação fixa */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-t border-border bg-background"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        {step > 0 && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setStep(step - 1)}
          >
            Voltar
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button className="flex-1" onClick={handleNext}>
            Continuar
            <ChevronRight className="size-4 ml-1" />
          </Button>
        ) : (
          <Button
            className="flex-1"
            onClick={form.handleSubmit(onSubmit as any)}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
            Salvar assistente
          </Button>
        )}
      </div>
    </div>
  );
}
