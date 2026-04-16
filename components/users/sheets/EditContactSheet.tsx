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
import { DDI_OPTIONS } from "@/lib/validations/client";
import { PhoneInput, unMaskPhone } from "@/components/ui/phone-input";

interface ContactData {
  email: string;
  phone: string;
  phoneDdi: string;
}

interface EditContactSheetProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: ContactData;
}

export function EditContactSheet({
  clientId,
  open,
  onOpenChange,
  initialData,
}: EditContactSheetProps) {
  const router = useRouter();
  const [form, setForm] = useState<ContactData>(initialData);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const rawPhone = unMaskPhone(form.phone);
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email || null,
          phone: rawPhone || null,
          phoneDdi: form.phoneDdi,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error ?? `HTTP ${res.status}`);
      }
      toast.success("Contato atualizado!");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Contato">
      <div className="flex flex-col gap-4 pb-4">
        {/* Email */}
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            inputMode="email"
            placeholder="cliente@email.com"
            className="mt-1.5 h-12"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Usado para enviar o acesso à área do cliente
          </p>
        </div>

        {/* Telefone */}
        <div>
          <Label>Telefone</Label>
          <div className="flex gap-2 mt-1.5">
            <Select
              value={form.phoneDdi}
              onValueChange={(v) => setForm({ ...form, phoneDdi: v })}
            >
              <SelectTrigger className="w-28 h-12 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DDI_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <PhoneInput
              className="flex-1 h-12"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        {/* CTA */}
        <Button className="w-full h-13 mt-2" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
          Salvar contato
        </Button>
      </div>
    </BottomSheet>
  );
}
