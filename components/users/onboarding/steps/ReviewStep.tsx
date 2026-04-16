"use client";

import { useFormContext } from "react-hook-form";
import type { ClientFormData } from "@/lib/validations/client";
import { DAYS_OF_WEEK } from "@/lib/validations/client";
import { cn } from "@/lib/utils";

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
        {title}
      </p>
      <div className="bg-muted/40 rounded-2xl px-4 py-1">
        {children}
      </div>
    </div>
  );
}

const OBJECTIVE_LABELS: Record<string, string> = {
  emagrecimento: "Emagrecimento",
  hipertrofia: "Hipertrofia",
  condicionamento: "Condicionamento",
  saude: "Saúde & Bem-estar",
  reabilitacao: "Reabilitação",
  performance: "Performance",
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentário",
  lightly_active: "Levemente ativo",
  moderately_active: "Moderadamente ativo",
  very_active: "Muito ativo",
  extra_active: "Extremamente ativo",
};

export function ReviewStep() {
  const { watch } = useFormContext<ClientFormData>();
  const data = watch();

  const activeDays = DAYS_OF_WEEK.filter(
    ({ key }) => data.availability?.[key]?.active
  ).map(({ label }) => label.split("-")[0].trim());

  const addressParts = [
    data.address?.street && data.address.number
      ? `${data.address.street}, ${data.address.number}`
      : data.address?.street,
    data.address?.neighborhood,
    data.address?.city && data.address.state
      ? `${data.address.city} - ${data.address.state}`
      : data.address?.city,
    data.address?.cep,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-bold text-foreground leading-tight tracking-tight">
          Tudo certo<br />por aqui? ✅
        </h1>
        <p className="text-base text-muted-foreground">
          Confira os dados antes de criar o perfil
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Dados pessoais */}
        <Section title="Dados pessoais">
          <Row label="Nome" value={data.name} />
          <Row label="Email" value={data.email || undefined} />
          <Row label="Telefone" value={data.phone ? `${data.phoneDdi} ${data.phone}` : undefined} />
          <Row
            label="Nascimento"
            value={
              data.birthDate
                ? new Date(data.birthDate + "T00:00:00").toLocaleDateString("pt-BR")
                : undefined
            }
          />
          <Row
            label="Gênero"
            value={data.gender === "M" ? "Masculino" : data.gender === "F" ? "Feminino" : undefined}
          />
        </Section>

        {/* Objetivo e perfil */}
        {(data.objective || data.activityLevel) && (
          <Section title="Perfil">
            <Row label="Objetivo" value={data.objective ? OBJECTIVE_LABELS[data.objective] : undefined} />
            <Row label="Atividade" value={data.activityLevel ? ACTIVITY_LABELS[data.activityLevel] : undefined} />
          </Section>
        )}

        {/* Endereço */}
        {addressParts.length > 0 && (
          <Section title="Endereço">
            <div className="py-2.5">
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {addressParts.join(", ")}
              </p>
            </div>
          </Section>
        )}

        {/* Emergência */}
        {data.emergency?.name && (
          <Section title="Emergência">
            <Row label="Nome" value={data.emergency.name} />
            <Row label="Telefone" value={data.emergency.phone || undefined} />
          </Section>
        )}

        {/* Disponibilidade */}
        {activeDays.length > 0 && (
          <Section title="Disponibilidade">
            <div className="py-2.5 flex flex-wrap gap-1.5">
              {activeDays.map((day) => (
                <span
                  key={day}
                  className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full"
                >
                  {day}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>

      <div
        className={cn(
          "flex items-start gap-3 rounded-2xl px-4 py-3.5",
          "bg-primary/5 border border-primary/20"
        )}
      >
        <span className="text-lg mt-0.5 shrink-0">🚀</span>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Após criar o perfil, você pode editar qualquer informação no detalhe do cliente.
        </p>
      </div>
    </div>
  );
}
