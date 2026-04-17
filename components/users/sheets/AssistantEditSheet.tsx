"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhoneInput, unMaskPhone, maskPhone } from "@/components/ui/phone-input";
import { CpfInput } from "@/components/ui/cpf-input";
import { PROFESSIONS } from "@/lib/constants/professions";
import { USER_STATUS_OPTIONS } from "@/lib/constants/user";

interface AssistantData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  emergencyPhone: string | null;
  cpf: string | null;
  birthDate: string | null;
  birthCity: string | null;
  maritalStatus: string | null;
  profession: string | null;
  role: string | null;
  status: string;
  address: {
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  } | null;
}

interface AssistantEditSheetProps {
  assistant: AssistantData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MARITAL_STATUS_OPTIONS = [
  { value: "single",   label: "Solteiro(a)" },
  { value: "married",  label: "Casado(a)" },
  { value: "divorced", label: "Divorciado(a)" },
  { value: "widowed",  label: "Viúvo(a)" },
  { value: "other",    label: "Outro" },
];

const SECTION_HEADER = "text-xs font-semibold uppercase tracking-widest text-muted-foreground px-0";

export function AssistantEditSheet({
  assistant,
  open,
  onOpenChange,
}: AssistantEditSheetProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    // Dados Pessoais
    name: assistant.name,
    email: assistant.email,
    phone: maskPhone(assistant.phone ?? ""),
    emergencyPhone: maskPhone(assistant.emergencyPhone ?? ""),
    cpf: assistant.cpf ?? "",
    birthDate: assistant.birthDate
      ? new Date(assistant.birthDate).toISOString().split("T")[0]
      : "",
    birthCity: assistant.birthCity ?? "",
    maritalStatus: assistant.maritalStatus ?? "",
    status: assistant.status,
    // Endereço
    address: {
      cep: assistant.address?.cep ?? "",
      street: assistant.address?.street ?? "",
      number: assistant.address?.number ?? "",
      complement: assistant.address?.complement ?? "",
      neighborhood: assistant.address?.neighborhood ?? "",
      city: assistant.address?.city ?? "",
      state: assistant.address?.state ?? "",
    },
    // Dados Profissionais
    profession: assistant.profession ?? "",
    role: assistant.role ?? "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setAddress(key: keyof NonNullable<typeof form.address>, value: string) {
    setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/assistants/${assistant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: unMaskPhone(form.phone) || null,
          emergencyPhone: unMaskPhone(form.emergencyPhone) || null,
          cpf: form.cpf || null,
          birthDate: form.birthDate || null,
          birthCity: form.birthCity || null,
          maritalStatus: form.maritalStatus || null,
          status: form.status,
          address: form.address,
          profession: form.profession || null,
          role: form.role || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error ?? `HTTP ${res.status}`);
      }

      toast.success("Dados atualizados!");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Editar assistente">
      {/* ScrollArea com altura fixa para não empurrar o botão */}
      <ScrollArea className="h-[70vh] pr-1">
        <div className="flex flex-col gap-6 pb-2">

          {/* ── Bloco 1: Dados Pessoais ─────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <p className={SECTION_HEADER}>Dados Pessoais</p>

            <div>
              <Label>Nome completo</Label>
              <Input
                className="mt-1.5 h-12"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                inputMode="email"
                className="mt-1.5 h-12"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>

            <div>
              <Label>Telefone principal</Label>
              <PhoneInput
                className="mt-1.5 h-12"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>

            <div>
              <Label>Tel. emergência</Label>
              <PhoneInput
                className="mt-1.5 h-12"
                value={form.emergencyPhone}
                onChange={(e) => set("emergencyPhone", e.target.value)}
              />
            </div>

            <div>
              <Label>CPF</Label>
              <CpfInput
                className="mt-1.5 h-12"
                value={form.cpf}
                onChange={(e) => set("cpf", e.target.value)}
              />
            </div>

            <div>
              <Label>Data de nascimento</Label>
              <Input
                type="date"
                className="mt-1.5 h-12"
                value={form.birthDate}
                onChange={(e) => set("birthDate", e.target.value)}
              />
            </div>

            <div>
              <Label>Cidade natal</Label>
              <Input
                className="mt-1.5 h-12"
                placeholder="Ex: São Paulo, SP"
                value={form.birthCity}
                onChange={(e) => set("birthCity", e.target.value)}
              />
            </div>

            <div>
              <Label>Estado civil</Label>
              <Select
                value={form.maritalStatus || undefined}
                onValueChange={(v) => set("maritalStatus", v ?? "")}
              >
                <SelectTrigger className="mt-1.5 h-12">
                  <SelectValue placeholder="Selecione" />
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

            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v ?? "ACTIVE")}
              >
                <SelectTrigger className="mt-1.5 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* ── Bloco 2: Endereço ───────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <p className={SECTION_HEADER}>Endereço</p>

            <div>
              <Label>CEP</Label>
              <Input
                inputMode="numeric"
                placeholder="00000-000"
                className="mt-1.5 h-12"
                value={form.address.cep}
                onChange={(e) => setAddress("cep", e.target.value)}
              />
            </div>

            <div>
              <Label>Rua / Logradouro</Label>
              <Input
                className="mt-1.5 h-12"
                placeholder="Rua das Flores"
                value={form.address.street}
                onChange={(e) => setAddress("street", e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <div className="w-24">
                <Label>Número</Label>
                <Input
                  className="mt-1.5 h-12"
                  placeholder="123"
                  value={form.address.number}
                  onChange={(e) => setAddress("number", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label>Complemento</Label>
                <Input
                  className="mt-1.5 h-12"
                  placeholder="Apto 4B"
                  value={form.address.complement}
                  onChange={(e) => setAddress("complement", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Bairro</Label>
              <Input
                className="mt-1.5 h-12"
                placeholder="Centro"
                value={form.address.neighborhood}
                onChange={(e) => setAddress("neighborhood", e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Label>Cidade</Label>
                <Input
                  className="mt-1.5 h-12"
                  placeholder="São Paulo"
                  value={form.address.city}
                  onChange={(e) => setAddress("city", e.target.value)}
                />
              </div>
              <div className="w-24">
                <Label>Estado</Label>
                <Input
                  className="mt-1.5 h-12"
                  placeholder="SP"
                  maxLength={2}
                  value={form.address.state}
                  onChange={(e) => setAddress("state", e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* ── Bloco 3: Dados Profissionais ────────────────────────── */}
          <div className="flex flex-col gap-4">
            <p className={SECTION_HEADER}>Dados Profissionais</p>

            <div>
              <Label>Profissão</Label>
              <Select
                value={form.profession || undefined}
                onValueChange={(v) => set("profession", v ?? "")}
              >
                <SelectTrigger className="mt-1.5 h-12">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Cargo / Função</Label>
              <Input
                className="mt-1.5 h-12"
                placeholder="Ex: Assistente de avaliação"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
              />
            </div>
          </div>

        </div>
      </ScrollArea>

      {/* ── Botão fixo de salvar ─────────────────────────────────────── */}
      <div className="pt-4 border-t border-border">
        <Button
          className="w-full h-13"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
          Salvar alterações
        </Button>
      </div>
    </BottomSheet>
  );
}
