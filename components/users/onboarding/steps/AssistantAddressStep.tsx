"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { ChevronDown, Loader2 } from "lucide-react";
import { z } from "zod";
import { assistantSchema } from "@/lib/validations";
import { BRAZIL_STATES } from "@/lib/constants/brazil-states";
import { useIbgeCities } from "@/lib/hooks/use-ibge-cities";
import { cn } from "@/lib/utils";

type AssistantFormData = z.infer<typeof assistantSchema>;

const FIELD_CLASS = cn(
  "w-full bg-transparent border-0 border-b-2 border-border rounded-none px-0 py-3",
  "text-xl font-medium placeholder:text-muted-foreground/35",
  "focus:outline-none focus:border-primary transition-colors duration-200 caret-primary"
);

const LABEL_CLASS =
  "text-xs font-semibold text-muted-foreground uppercase tracking-widest";

export function AssistantAddressStep() {
  const { register, watch, setValue } = useFormContext<AssistantFormData>();

  const cep   = watch("address.cep")   ?? "";
  const state = watch("address.state") ?? "";
  const city  = watch("address.city")  ?? "";

  const { cities, loading: citiesLoading } = useIbgeCities(state || null);

  // Cidade pendente: preenchida pelo ViaCEP antes das opções do IBGE carregarem
  const [pendingCity, setPendingCity] = useState<string | null>(null);

  // Aplica pendingCity assim que o IBGE terminar de carregar a lista
  useEffect(() => {
    if (!pendingCity || citiesLoading || cities.length === 0) return;
    const match =
      cities.find((c) => c.toLowerCase() === pendingCity.toLowerCase()) ??
      pendingCity; // fallback: usa o nome bruto do ViaCEP
    setValue("address.city", match);
    setPendingCity(null);
  }, [cities, citiesLoading, pendingCity, setValue]);

  // ── ViaCEP autocomplete ────────────────────────────────────────────────────
  async function handleCepBlur() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) return;
      setValue("address.street",       data.logradouro ?? "");
      setValue("address.neighborhood", data.bairro     ?? "");
      // 1) Seta UF → dispara useIbgeCities
      setValue("address.state", data.uf ?? "");
      // 2) Limpa cidade e guarda para aplicar após lista carregar
      setValue("address.city", "");
      setPendingCity(data.localidade ?? null);
    } catch {
      // silencioso
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Endereço do<br />assistente
        </h1>
        <p className="text-base text-muted-foreground">
          Opcional — pode preencher depois
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* ── CEP ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>CEP</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="00000-000"
            className={FIELD_CLASS}
            {...register("address.cep")}
            onBlur={handleCepBlur}
          />
        </div>

        {/* ── Rua + Nº ─────────────────────────────────────────── */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className={LABEL_CLASS}>Rua / Av.</label>
            <input
              type="text"
              placeholder="Nome da rua"
              className={FIELD_CLASS}
              {...register("address.street")}
            />
          </div>
          <div className="flex flex-col gap-1.5 w-24">
            <label className={LABEL_CLASS}>Nº</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="000"
              className={FIELD_CLASS}
              {...register("address.number")}
            />
          </div>
        </div>

        {/* ── Complemento ──────────────────────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>Complemento</label>
          <input
            type="text"
            placeholder="Apto, Bloco..."
            className={FIELD_CLASS}
            {...register("address.complement")}
          />
        </div>

        {/* ── Bairro ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>Bairro</label>
          <input
            type="text"
            placeholder="Nome do bairro"
            className={FIELD_CLASS}
            {...register("address.neighborhood")}
          />
        </div>

        {/* ── Estado (UF) — native select ──────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>Estado</label>
          <div className="relative">
            <select
              className={cn(FIELD_CLASS, "appearance-none pr-6", state && "border-primary")}
              value={state}
              onChange={(e) => {
                setValue("address.state", e.target.value);
                setValue("address.city",  ""); // limpa cidade ao trocar UF
              }}
            >
              <option value="">Selecione o estado</option>
              {BRAZIL_STATES.map(({ sigla, nome }) => (
                <option key={sigla} value={sigla}>{sigla} — {nome}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>
        </div>

        {/* ── Cidade — carregada via IBGE ───────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <label className={cn(LABEL_CLASS, !state && "opacity-40")}>Cidade</label>
          <div className="relative">
            <select
              className={cn(
                FIELD_CLASS,
                "appearance-none pr-6",
                !state && "opacity-40",
                city && "border-primary"
              )}
              value={city}
              disabled={!state || citiesLoading}
              onChange={(e) => setValue("address.city", e.target.value)}
            >
              <option value="">
                {citiesLoading
                  ? "Carregando cidades..."
                  : !state
                  ? "Selecione o estado primeiro"
                  : "Selecione a cidade"}
              </option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {citiesLoading ? (
              <Loader2 className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
            ) : (
              <ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* ── Dica CEP ─────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-muted/40 rounded-2xl px-4 py-3.5">
        <span className="text-lg mt-0.5 shrink-0">💡</span>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Digite o CEP para preencher automaticamente.
        </p>
      </div>
    </div>
  );
}
