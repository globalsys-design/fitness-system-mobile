"use client";

import { useFormContext } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClientFormData } from "@/lib/validations/client";

interface StepResponsibleProps {
  isMinor: boolean;
}

export function StepResponsible({ isMinor }: StepResponsibleProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ClientFormData>();
  const watched = watch();

  function setResponsibleField(field: string, value: string) {
    setValue("responsible", {
      ...((watched.responsible as any) ?? {}),
      [field]: value,
    });
  }

  function setEmergencyField(field: string, value: string) {
    setValue("emergency", {
      ...((watched.emergency as any) ?? {}),
      [field]: value,
    });
  }

  const resp = (watched.responsible as any) ?? {};
  const emerg = (watched.emergency as any) ?? {};
  const respErrors = (errors as any)?.responsible;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Responsável Legal (condicional) ── */}
      {isMinor ? (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Alert informativo */}
          <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <AlertTriangle className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Cliente menor de idade detectado
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Os dados do responsável legal são obrigatórios para menores de
                18 anos.
              </p>
            </div>
          </div>

          <p className="text-sm font-medium text-foreground">
            Responsável Legal *
          </p>

          {/* Nome * */}
          <div>
            <Label>Nome do responsável *</Label>
            <Input
              className="mt-1.5"
              placeholder="Nome completo"
              value={resp.name || ""}
              onChange={(e) => setResponsibleField("name", e.target.value)}
            />
            {respErrors?.name && (
              <p className="text-xs text-destructive mt-1">
                {respErrors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label>Email do responsável</Label>
            <Input
              type="email"
              inputMode="email"
              className="mt-1.5"
              placeholder="email@exemplo.com"
              value={resp.email || ""}
              onChange={(e) => setResponsibleField("email", e.target.value)}
            />
            {respErrors?.email && (
              <p className="text-xs text-destructive mt-1">
                {respErrors.email.message}
              </p>
            )}
          </div>

          {/* CPF * */}
          <div>
            <Label>CPF do responsável *</Label>
            <Input
              className="mt-1.5"
              placeholder="000.000.000-00"
              inputMode="numeric"
              value={resp.cpf || ""}
              onChange={(e) => setResponsibleField("cpf", e.target.value)}
            />
            {respErrors?.cpf && (
              <p className="text-xs text-destructive mt-1">
                {respErrors.cpf.message}
              </p>
            )}
          </div>

          {/* Telefone * */}
          <div>
            <Label>Telefone do responsável *</Label>
            <Input
              type="tel"
              inputMode="tel"
              className="mt-1.5"
              placeholder="(00) 00000-0000"
              value={resp.phone || ""}
              onChange={(e) => setResponsibleField("phone", e.target.value)}
            />
            {respErrors?.phone && (
              <p className="text-xs text-destructive mt-1">
                {respErrors.phone.message}
              </p>
            )}
          </div>

          {/* Profissão */}
          <div>
            <Label>Profissão do responsável</Label>
            <Input
              className="mt-1.5"
              placeholder="Ex: Médico, Professor..."
              value={resp.profession || ""}
              onChange={(e) =>
                setResponsibleField("profession", e.target.value)
              }
            />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground text-center">
            Seção de responsável legal disponível apenas para clientes menores
            de 18 anos. Preencha a data de nascimento no Passo 1.
          </p>
        </div>
      )}

      {/* ── Emergência (sempre visível) ── */}
      <div className="border-t border-border pt-4 mt-2">
        <p className="text-sm font-medium text-foreground">
          Contato de emergência
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Pessoa a ser contatada em caso de emergência.
        </p>
      </div>

      <div>
        <Label>Nome</Label>
        <Input
          className="mt-1.5"
          placeholder="Nome do contato"
          value={emerg.name || ""}
          onChange={(e) => setEmergencyField("name", e.target.value)}
        />
      </div>

      <div>
        <Label>Telefone celular</Label>
        <Input
          type="tel"
          inputMode="tel"
          className="mt-1.5"
          placeholder="(00) 00000-0000"
          value={emerg.phone || ""}
          onChange={(e) => setEmergencyField("phone", e.target.value)}
        />
      </div>

      <div>
        <Label>Telefone fixo</Label>
        <Input
          type="tel"
          inputMode="tel"
          className="mt-1.5"
          placeholder="(00) 0000-0000"
          value={emerg.landline || ""}
          onChange={(e) => setEmergencyField("landline", e.target.value)}
        />
      </div>

      <div>
        <Label>Observações</Label>
        <textarea
          className="mt-1.5 flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          placeholder="Informações adicionais sobre o contato de emergência..."
          value={emerg.notes || ""}
          onChange={(e) => setEmergencyField("notes", e.target.value)}
        />
      </div>
    </div>
  );
}
