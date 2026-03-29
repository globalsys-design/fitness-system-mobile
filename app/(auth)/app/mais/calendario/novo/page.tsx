"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { EVENT_TYPE_OPTIONS } from "@/lib/constants/calendar";

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState("ASSESSMENT");

  const { register, handleSubmit } = useForm({
    defaultValues: { title: "", description: "", startAt: "", endAt: "" },
  });

  async function onSubmit(data: any) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type }),
      });
      if (!response.ok) throw new Error();
      toast.success("Agendamento criado!");
      router.push("/app/mais/calendario");
    } catch {
      toast.error("Erro ao criar agendamento.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col bg-background" style={{ height: "100dvh" }}>
      <MobileHeader title="Novo Agendamento" showBack />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <div>
          <Label>Tipo *</Label>
          <Select value={type} onValueChange={(v) => { if (v !== null) setType(v); }}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Título *</Label>
          <Input className="mt-1.5" {...register("title")} />
        </div>
        <div>
          <Label>Data/hora de início *</Label>
          <Input type="datetime-local" className="mt-1.5" {...register("startAt")} />
        </div>
        <div>
          <Label>Data/hora de fim *</Label>
          <Input type="datetime-local" className="mt-1.5" {...register("endAt")} />
        </div>
        <div>
          <Label>Descrição</Label>
          <Input className="mt-1.5" {...register("description")} />
        </div>
      </div>
      <div
        className="px-4 py-4 border-t border-border bg-background"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <Button
          className="w-full"
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Criar agendamento
        </Button>
      </div>
    </div>
  );
}
