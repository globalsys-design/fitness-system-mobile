"use client";

import { useFormContext } from "react-hook-form";
import type { ClientFormData } from "@/lib/validations/client";
import { cn } from "@/lib/utils";

const FIELD_CLASS = cn(
  "w-full bg-transparent border-0 border-b-2 border-border rounded-none px-0 py-3",
  "text-xl font-medium placeholder:text-muted-foreground/35",
  "focus:outline-none focus:border-primary transition-colors duration-200 caret-primary"
);

const LABEL_CLASS =
  "text-xs font-semibold text-muted-foreground uppercase tracking-widest";

const BRASIL_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
];

export function AddressStep() {
  const { register, watch, setValue } = useFormContext<ClientFormData>();
  const cep = watch("address.cep") ?? "";

  async function handleCepBlur() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) return;
      setValue("address.street", data.logradouro ?? "");
      setValue("address.neighborhood", data.bairro ?? "");
      setValue("address.city", data.localidade ?? "");
      setValue("address.state", data.uf ?? "");
    } catch {
      // silencioso — CEP inválido ou sem conexão
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Onde o cliente<br />mora?
        </h1>
        <p className="text-base text-muted-foreground">
          Endereço completo — opcional
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* CEP */}
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

        {/* Rua + Número */}
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

        {/* Complemento */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>Complemento</label>
          <input
            type="text"
            placeholder="Apto, Bloco, Casa..."
            className={FIELD_CLASS}
            {...register("address.complement")}
          />
        </div>

        {/* Bairro */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLASS}>Bairro</label>
          <input
            type="text"
            placeholder="Nome do bairro"
            className={FIELD_CLASS}
            {...register("address.neighborhood")}
          />
        </div>

        {/* Cidade + Estado */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className={LABEL_CLASS}>Cidade</label>
            <input
              type="text"
              placeholder="Cidade"
              className={FIELD_CLASS}
              {...register("address.city")}
            />
          </div>
          <div className="flex flex-col gap-1.5 w-24">
            <label className={LABEL_CLASS}>UF</label>
            <select
              className={cn(FIELD_CLASS, "appearance-none")}
              {...register("address.state")}
            >
              <option value="">--</option>
              {BRASIL_STATES.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-muted/40 rounded-2xl px-4 py-3.5">
        <span className="text-lg mt-0.5 shrink-0">💡</span>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Digite o CEP para preencher automaticamente. Todos os campos são opcionais.
        </p>
      </div>
    </div>
  );
}
