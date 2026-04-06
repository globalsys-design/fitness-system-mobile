"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

const EMPTY: AddressData = {
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

interface EditAddressSheetProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AddressData | null;
}

export function EditAddressSheet({
  clientId,
  open,
  onOpenChange,
  initialData,
}: EditAddressSheetProps) {
  const router = useRouter();
  const [form, setForm] = useState<AddressData>(initialData ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);

  function applyCepMask(raw: string) {
    const d = raw.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  }

  async function lookupCep(cep: string) {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setSearching(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.erro) {
        toast.error("CEP não encontrado.");
        return;
      }
      setForm((prev) => ({
        ...prev,
        street: data.logradouro ?? prev.street,
        neighborhood: data.bairro ?? prev.neighborhood,
        city: data.localidade ?? prev.city,
        state: data.uf ?? prev.state,
      }));
      toast.success("Endereço encontrado!");
    } catch {
      toast.error("Erro ao buscar CEP. Verifique a conexão.");
    } finally {
      setSearching(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Only save if at least one field is filled
      const hasData = Object.values(form).some((v) => v.trim() !== "");
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: hasData ? form : null }),
      });
      if (!res.ok) throw new Error();
      toast.success("Endereço atualizado!");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const set = (key: keyof AddressData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Endereço">
      <div className="flex flex-col gap-4 pb-4">
        {/* CEP + busca */}
        <div>
          <Label>CEP</Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              inputMode="numeric"
              placeholder="00000-000"
              className="flex-1 h-12"
              value={form.cep}
              maxLength={9}
              onChange={(e) => {
                const masked = applyCepMask(e.target.value);
                setForm((prev) => ({ ...prev, cep: masked }));
              }}
              onBlur={() => lookupCep(form.cep)}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0"
              onClick={() => lookupCep(form.cep)}
              disabled={searching}
              type="button"
              aria-label="Buscar CEP"
            >
              {searching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Preenchimento automático via ViaCEP
          </p>
        </div>

        {/* Rua */}
        <div>
          <Label>Rua / Logradouro</Label>
          <Input
            placeholder="Ex: Rua das Flores"
            className="mt-1.5 h-12"
            value={form.street}
            onChange={set("street")}
          />
        </div>

        {/* Número + Complemento */}
        <div className="flex gap-3">
          <div className="w-28">
            <Label>Número</Label>
            <Input
              inputMode="numeric"
              placeholder="123"
              className="mt-1.5 h-12"
              value={form.number}
              onChange={set("number")}
            />
          </div>
          <div className="flex-1">
            <Label>Complemento</Label>
            <Input
              placeholder="Apto 4"
              className="mt-1.5 h-12"
              value={form.complement}
              onChange={set("complement")}
            />
          </div>
        </div>

        {/* Bairro */}
        <div>
          <Label>Bairro</Label>
          <Input
            placeholder="Ex: Centro"
            className="mt-1.5 h-12"
            value={form.neighborhood}
            onChange={set("neighborhood")}
          />
        </div>

        {/* Cidade + Estado */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Label>Cidade</Label>
            <Input
              placeholder="Ex: Vitória"
              className="mt-1.5 h-12"
              value={form.city}
              onChange={set("city")}
            />
          </div>
          <div className="w-20">
            <Label>UF</Label>
            <Input
              placeholder="ES"
              maxLength={2}
              className="mt-1.5 h-12 uppercase"
              value={form.state}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  state: e.target.value.toUpperCase().slice(0, 2),
                }))
              }
            />
          </div>
        </div>

        <Button className="w-full h-13 mt-2" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
          Salvar endereço
        </Button>
      </div>
    </BottomSheet>
  );
}
