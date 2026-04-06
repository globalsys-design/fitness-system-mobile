"use client";

import { useFormContext } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import type { ClientFormData } from "@/lib/validations/client";
import { isValidCPF } from "@/lib/validations/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ResponsibleStep() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ClientFormData>();

  const responsible = watch("responsible") ?? {};

  return (
    <div className="flex flex-col gap-8">
      {/* Header with warning */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center size-10 rounded-full bg-destructive/10 shrink-0 mt-0.5">
            <AlertCircle className="size-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h1 className="text-[1.75rem] font-bold text-foreground leading-tight">
              Responsável legal
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              Obrigatório para menores de 18 anos
            </p>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-5">
        {/* Name */}
        <div>
          <Label className="text-sm font-medium">Nome completo</Label>
          <Input
            placeholder="Ex: Maria Silva"
            value={responsible.name ?? ""}
            onChange={(e) =>
              setValue("responsible", {
                ...responsible,
                name: e.target.value,
              })
            }
            className={cn(
              "mt-2 h-12",
              errors.responsible?.name && "border-destructive"
            )}
          />
          {errors.responsible?.name && (
            <p className="text-xs text-destructive mt-1.5">
              {(errors.responsible.name as any).message}
            </p>
          )}
        </div>

        {/* CPF */}
        <div>
          <Label className="text-sm font-medium">CPF</Label>
          <Input
            placeholder="000.000.000-00"
            inputMode="numeric"
            value={responsible.cpf ?? ""}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\D/g, "");
              setValue("responsible", {
                ...responsible,
                cpf: cleaned,
              });
            }}
            className={cn(
              "mt-2 h-12",
              errors.responsible?.cpf && "border-destructive"
            )}
          />
          {errors.responsible?.cpf ? (
            <p className="text-xs text-destructive mt-1.5">
              {(errors.responsible.cpf as any).message}
            </p>
          ) : responsible.cpf && isValidCPF(responsible.cpf) ? (
            <p className="text-xs text-primary mt-1.5">✓ CPF válido</p>
          ) : null}
        </div>

        {/* Phone */}
        <div>
          <Label className="text-sm font-medium">Telefone</Label>
          <Input
            placeholder="(27) 98888-3838"
            type="tel"
            inputMode="tel"
            value={responsible.phone ?? ""}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\D/g, "");
              setValue("responsible", {
                ...responsible,
                phone: cleaned,
              });
            }}
            className={cn(
              "mt-2 h-12",
              errors.responsible?.phone && "border-destructive"
            )}
          />
          {errors.responsible?.phone && (
            <p className="text-xs text-destructive mt-1.5">
              {(errors.responsible.phone as any).message}
            </p>
          )}
        </div>

        {/* Profession (optional) */}
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Profissão (opcional)
          </Label>
          <Input
            placeholder="Ex: Médico"
            value={responsible.profession ?? ""}
            onChange={(e) =>
              setValue("responsible", {
                ...responsible,
                profession: e.target.value,
              })
            }
            className="mt-2 h-12"
          />
        </div>

        {/* Email (optional) */}
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Email (opcional)
          </Label>
          <Input
            type="email"
            inputMode="email"
            placeholder="maria@email.com"
            value={responsible.email ?? ""}
            onChange={(e) =>
              setValue("responsible", {
                ...responsible,
                email: e.target.value,
              })
            }
            className="mt-2 h-12"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        Os dados do responsável serão usados apenas para contato em caso de emergência ou informações sobre o atendimento.
      </p>
    </div>
  );
}
