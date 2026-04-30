"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput, unMaskPhone } from "@/components/ui/phone-input";

interface EmergencyData {
  name: string;
  phone: string;
  notes: string;
}

interface EditEmergencySheetProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: EmergencyData | null;
}

export function EditEmergencySheet({
  clientId,
  open,
  onOpenChange,
  initialData,
}: EditEmergencySheetProps) {
  const router = useRouter();
  const [form, setForm] = useState<EmergencyData>(
    initialData ?? { name: "", phone: "", notes: "" }
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const rawPhone = unMaskPhone(form.phone);
      const hasData = form.name.trim() || rawPhone;
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyContact: hasData
            ? { name: form.name, phone: rawPhone, notes: form.notes }
            : null,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error ?? `HTTP ${res.status}`);
      }
      toast.success("Contato de emergência atualizado!");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Contato de Emergência">
      <div className="flex flex-col gap-4 pb-4">
        <p className="text-sm text-muted-foreground -mt-1">
          Pessoa a contactar em caso de emergência durante o atendimento.
        </p>

        <div>
          <Label>Nome</Label>
          <Input
            placeholder="Ex: Maria Silva"
            className="mt-1.5 h-12"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <Label>Telefone</Label>
          <PhoneInput
            className="mt-1.5 h-12"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div>
          <Label>Parentesco / Observações</Label>
          <Input
            placeholder="Ex: Mãe, cônjuge..."
            className="mt-1.5 h-12"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <Button className="w-full h-13 mt-2 transition-transform duration-150 active:scale-[0.98]" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
          Salvar contato de emergência
        </Button>
      </div>
    </BottomSheet>
  );
}
