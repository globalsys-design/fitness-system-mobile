"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { BRAZIL_STATES } from "@/lib/constants/brazil-states";
import { useIbgeCities } from "@/lib/hooks/use-ibge-cities";
import type { ClientFormData } from "@/lib/validations/client";

export function StepAddress() {
  const { setValue, watch, register } = useFormContext<ClientFormData>();
  const watched = watch();
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [cepFilled, setCepFilled] = useState(false);

  const addr          = (watched.address as Record<string, string>) ?? {};
  const selectedState = addr.state || "";
  const selectedCity  = addr.city  || "";

  const { cities, loading: citiesLoading } = useIbgeCities(selectedState || null);

  // Cidade pendente: preenchida pelo ViaCEP antes das opções do IBGE carregarem
  const [pendingCity, setPendingCity] = useState<string | null>(null);

  // Aplica pendingCity assim que o IBGE terminar de carregar a lista
  useEffect(() => {
    if (!pendingCity || citiesLoading || cities.length === 0) return;
    const match =
      cities.find((c) => c.toLowerCase() === pendingCity.toLowerCase()) ??
      pendingCity; // fallback: usa o nome bruto do ViaCEP
    setAddressField("city", match);
    setPendingCity(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities, citiesLoading, pendingCity]);

  function setAddressField(field: string, value: string) {
    setValue("address", {
      ...((watched.address as Record<string, string>) ?? {}),
      [field]: value,
    });
  }

  function handleStateChange(uf: string) {
    setValue("address", {
      ...((watched.address as Record<string, string>) ?? {}),
      state: uf,
      city: "", // limpa cidade ao trocar UF
    });
  }

  async function handleCepBlur(cep: string) {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setIsFetchingCep(true);
    setCepFilled(false);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) return;

      const current = (watched.address as Record<string, string>) ?? {};
      // 1) Seta UF → dispara useIbgeCities
      // 2) Zera cidade → aplica após lista carregar via pendingCity
      setValue("address", {
        ...current,
        cep:          digits,
        street:       data.logradouro || current.street       || "",
        neighborhood: data.bairro     || current.neighborhood || "",
        state:        data.uf         || current.state        || "",
        city:         "", // limpa — será preenchida pelo useEffect
      });
      setPendingCity(data.localidade || null);
      setCepFilled(true);
      setTimeout(() => setCepFilled(false), 3000);
    } catch {
      // silently fail — user can fill manually
    } finally {
      setIsFetchingCep(false);
    }
  }

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

      {/* Estado (UF) */}
      <div>
        <Label htmlFor="state">Estado</Label>
        <NativeSelect
          id="state"
          className="mt-1.5"
          value={selectedState}
          onChange={(e) => handleStateChange(e.target.value)}
        >
          <option value="">Selecione o estado</option>
          {BRAZIL_STATES.map(({ sigla, nome }) => (
            <option key={sigla} value={sigla}>{sigla} — {nome}</option>
          ))}
        </NativeSelect>
      </div>

      {/* Cidade — dependente do estado */}
      <div>
        <Label htmlFor="city">Cidade</Label>
        <NativeSelect
          id="city"
          className="mt-1.5"
          value={selectedCity}
          disabled={!selectedState}
          loading={citiesLoading}
          onChange={(e) => setAddressField("city", e.target.value)}
        >
          <option value="">
            {citiesLoading
              ? "Carregando cidades..."
              : !selectedState
              ? "Selecione o estado primeiro"
              : "Selecione a cidade"}
          </option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </NativeSelect>
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
