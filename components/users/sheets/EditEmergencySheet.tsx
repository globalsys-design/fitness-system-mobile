"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      const hasData = form.name.trim() || form.phone.trim();
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyContact: hasData
            ? { name: form.name, phone: form.phone, notes: form.notes }
            : null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Contato de emergência atualizado!");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
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
          <Input
            type="tel"
            inputMode="tel"
            placeholder="(27) 98888-3838"
            className="mt-1.5 h-12"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
            }
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

        <Button className="w-full h-13 mt-2" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
          Salvar contato de emergência
        </Button>
      </div>
    </BottomSheet>
  );
}
