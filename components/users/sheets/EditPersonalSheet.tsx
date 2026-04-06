"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
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
import {
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  ETHNICITY_OPTIONS,
} from "@/lib/validations/client";

interface PersonalData {
  name: string;
  birthDate: string;
  gender: string;
  cpf: string;
  ethnicity: string;
  maritalStatus: string;
  healthInsurance: string;
}

interface EditPersonalSheetProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: PersonalData;
}

export function EditPersonalSheet({
  clientId,
  open,
  onOpenChange,
  initialData,
}: EditPersonalSheetProps) {
  const router = useRouter();
  const [form, setForm] = useState<PersonalData>(initialData);
  const [saving, setSaving] = useState(false);

  // Convert ISO date to DD/MM/YYYY for display
  const toDisplay = (iso: string) => {
    if (!iso) return "";
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
  };

  // Convert DD/MM/YYYY input back to ISO
  const toISO = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length === 8) {
      return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
    }
    return val;
  };

  const applyDateMask = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 8);
    let out = d.slice(0, 2);
    if (d.length > 2) out += "/" + d.slice(2, 4);
    if (d.length > 4) out += "/" + d.slice(4, 8);
    return out;
  };

  const [displayDate, setDisplayDate] = useState(() => toDisplay(initialData.birthDate));

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          birthDate: form.birthDate || null,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      toast.success("Dados pessoais atualizados!");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Dados Pessoais">
      <div className="flex flex-col gap-4 pb-4">
        {/* Nome */}
        <div>
          <Label>Nome completo *</Label>
          <Input
            className="mt-1.5 h-12"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Data de Nascimento */}
        <div>
          <Label>Data de nascimento</Label>
          <Input
            inputMode="numeric"
            placeholder="DD/MM/AAAA"
            className="mt-1.5 h-12"
            value={displayDate}
            onChange={(e) => {
              const masked = applyDateMask(e.target.value);
              setDisplayDate(masked);
              setForm({ ...form, birthDate: toISO(masked) });
            }}
            maxLength={10}
          />
        </div>

        {/* Gênero */}
        <div>
          <Label>Gênero</Label>
          <Select
            value={form.gender || undefined}
            onValueChange={(v) => setForm({ ...form, gender: v })}
          >
            <SelectTrigger className="h-12 mt-1.5">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* CPF */}
        <div>
          <Label>CPF</Label>
          <Input
            inputMode="numeric"
            placeholder="000.000.000-00"
            className="mt-1.5 h-12"
            value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: e.target.value.replace(/\D/g, "") })}
          />
        </div>

        {/* Etnia */}
        <div>
          <Label>Etnia/Cor</Label>
          <Select
            value={form.ethnicity || undefined}
            onValueChange={(v) => setForm({ ...form, ethnicity: v })}
          >
            <SelectTrigger className="h-12 mt-1.5">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {ETHNICITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Estado Civil */}
        <div>
          <Label>Estado civil</Label>
          <Select
            value={form.maritalStatus || undefined}
            onValueChange={(v) => setForm({ ...form, maritalStatus: v })}
          >
            <SelectTrigger className="h-12 mt-1.5">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {MARITAL_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Plano de Saúde */}
        <div>
          <Label>Plano de saúde</Label>
          <Input
            placeholder="Ex: Unimed, Bradesco..."
            className="mt-1.5 h-12"
            value={form.healthInsurance}
            onChange={(e) => setForm({ ...form, healthInsurance: e.target.value })}
          />
        </div>

        {/* CTA */}
        <Button
          className="w-full h-13 mt-2"
          onClick={handleSave}
          disabled={saving || !form.name.trim()}
        >
          {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
          Salvar dados pessoais
        </Button>
      </div>
    </BottomSheet>
  );
}
