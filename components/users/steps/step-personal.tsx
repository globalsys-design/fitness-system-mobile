"use client";

import { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ClientFormData,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  ETHNICITY_OPTIONS,
  DDI_OPTIONS,
} from "@/lib/validations/client";

/** Lookup label from options array by value */
function getOptionLabel(
  options: readonly { value: string; label: string }[],
  value: string | null | undefined
): string | undefined {
  if (!value) return undefined;
  return options.find((opt) => opt.value === value)?.label;
}

export function StepPersonal() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ClientFormData>();
  const fileRef = useRef<HTMLInputElement>(null);
  const watched = watch();

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setValue("photo", reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Avatar Upload */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative size-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {watched.photo ? (
            <img
              src={watched.photo}
              alt="Avatar"
              className="size-full object-cover"
            />
          ) : (
            <Camera className="size-8 text-muted-foreground" />
          )}
          <div className="absolute bottom-0 right-0 size-7 rounded-full bg-primary flex items-center justify-center">
            <Camera className="size-3.5 text-primary-foreground" />
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Nome */}
      <div>
        <Label htmlFor="name" required>Nome completo</Label>
        <Input
          id="name"
          className="mt-1.5"
          placeholder="Nome do cliente"
          aria-required="true"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive mt-1">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Data de Nascimento */}
      <div>
        <Label htmlFor="birthDate">Data de nascimento</Label>
        <Input
          id="birthDate"
          type="date"
          className="mt-1.5"
          {...register("birthDate")}
        />
      </div>

      {/* CPF (opcional) */}
      <div>
        <Label htmlFor="cpf">CPF (opcional)</Label>
        <Input
          id="cpf"
          className="mt-1.5"
          placeholder="000.000.000-00"
          inputMode="numeric"
          {...register("cpf")}
        />
        {errors.cpf && (
          <p className="text-xs text-destructive mt-1">
            {errors.cpf.message}
          </p>
        )}
      </div>

      {/* Gênero + Estado Civil — row alinhado */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Gênero</Label>
          <Select
            value={watched.gender || undefined}
            onValueChange={(v) => setValue("gender", v ?? "")}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Selecione">
                {getOptionLabel(GENDER_OPTIONS, watched.gender) || "Selecione"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Estado civil</Label>
          <Select
            value={watched.maritalStatus || undefined}
            onValueChange={(v) => setValue("maritalStatus", v ?? "")}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Selecione">
                {getOptionLabel(MARITAL_STATUS_OPTIONS, watched.maritalStatus) || "Selecione"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MARITAL_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Etnia */}
      <div>
        <Label>Etnia</Label>
        <Select
          value={watched.ethnicity || undefined}
          onValueChange={(v) => setValue("ethnicity", v ?? "")}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Selecione">
              {getOptionLabel(ETHNICITY_OPTIONS, watched.ethnicity) || "Selecione"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ETHNICITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Convênio (opcional) */}
      <div>
        <Label htmlFor="healthInsurance">Convênio (opcional)</Label>
        <Input
          id="healthInsurance"
          className="mt-1.5"
          placeholder="Nome do convênio"
          {...register("healthInsurance")}
        />
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="client-email">Email</Label>
        <Input
          id="client-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          className="mt-1.5"
          placeholder="email@exemplo.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Telefone Principal com DDI */}
      <div>
        <Label>Telefone principal</Label>
        <div className="flex gap-2 mt-1.5">
          <Select
            value={watched.phoneDdi || "+55"}
            onValueChange={(v) => setValue("phoneDdi", v ?? "+55")}
          >
            <SelectTrigger className="w-28 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DDI_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="tel"
            inputMode="tel"
            className="flex-1"
            placeholder="(00) 00000-0000"
            {...register("phone")}
          />
        </div>
      </div>

      {/* Telefone de Emergência (opcional) */}
      <div>
        <Label htmlFor="emergencyPhone">Tel. emergência (opcional)</Label>
        <Input
          id="emergencyPhone"
          type="tel"
          inputMode="tel"
          className="mt-1.5"
          placeholder="(00) 00000-0000"
          {...register("emergencyPhone")}
        />
      </div>
    </div>
  );
}
