"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClientFormData } from "@/lib/validations/client";

export function StepAddress() {
  const { setValue, watch, register } = useFormContext<ClientFormData>();
  const watched = watch();
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [cepFilled, setCepFilled] = useState(false);

  async function handleCepBlur(cep: string) {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setIsFetchingCep(true);
    setCepFilled(false);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) return;

      const current = (watched.address as any) ?? {};
      setValue("address", {
        ...current,
        cep: digits,
        street: data.logradouro || current.street || "",
        neighborhood: data.bairro || current.neighborhood || "",
        city: data.localidade || current.city || "",
        state: data.uf || current.state || "",
      });
      setCepFilled(true);
      setTimeout(() => setCepFilled(false), 3000);
    } catch {
      // silently fail — user can fill manually
    } finally {
      setIsFetchingCep(false);
    }
  }

  function setAddressField(field: string, value: string) {
    setValue("address", {
      ...((watched.address as any) ?? {}),
      [field]: value,
    });
  }

  const addr = (watched.address as any) ?? {};

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Endereço e profissão do cliente (opcional).
      </p>

      {/* CEP */}
      <div>
        <Label htmlFor="cep">CEP</Label>
        <div className="relative mt-1.5">
          <Input
            id="cep"
            className="pr-10"
            placeholder="00000-000"
            inputMode="numeric"
            value={addr.cep || ""}
            onChange={(e) => setAddressField("cep", e.target.value)}
            onBlur={(e) => handleCepBlur(e.target.value)}
          />
          {isFetchingCep && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
          )}
          {!isFetchingCep && cepFilled && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-success" />
          )}
        </div>
      </div>

      {/* Rua */}
      <div>
        <Label htmlFor="street">Rua</Label>
        <Input
          id="street"
          className="mt-1.5"
          placeholder="Logradouro"
          value={addr.street || ""}
          onChange={(e) => setAddressField("street", e.target.value)}
        />
      </div>

      {/* Número + Complemento */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="number">Nº</Label>
          <Input
            id="number"
            className="mt-1.5"
            inputMode="numeric"
            value={addr.number || ""}
            onChange={(e) => setAddressField("number", e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="complement">Complemento</Label>
          <Input
            id="complement"
            className="mt-1.5"
            placeholder="Apto, Bloco..."
            value={addr.complement || ""}
            onChange={(e) => setAddressField("complement", e.target.value)}
          />
        </div>
      </div>

      {/* Bairro */}
      <div>
        <Label htmlFor="neighborhood">Bairro</Label>
        <Input
          id="neighborhood"
          className="mt-1.5"
          value={addr.neighborhood || ""}
          onChange={(e) => setAddressField("neighborhood", e.target.value)}
        />
      </div>

      {/* Cidade + Estado */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            className="mt-1.5"
            value={addr.city || ""}
            onChange={(e) => setAddressField("city", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="state">UF</Label>
          <Input
            id="state"
            className="mt-1.5"
            maxLength={2}
            value={addr.state || ""}
            onChange={(e) =>
              setAddressField("state", e.target.value.toUpperCase())
            }
          />
        </div>
      </div>

      {/* Profissão */}
      <div className="border-t border-border pt-4 mt-2">
        <Label htmlFor="profession">Profissão (opcional)</Label>
        <Input
          id="profession"
          className="mt-1.5"
          placeholder="Ex: Professor, Engenheiro..."
          {...register("profession")}
        />
      </div>
    </div>
  );
}
