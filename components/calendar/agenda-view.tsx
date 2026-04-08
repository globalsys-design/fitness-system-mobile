"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  addDays,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  ClipboardList,
  Dumbbell,
  CalendarDays,
  Search,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { FAB } from "@/components/mobile/fab";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
interface AgendaEvent {
  id: string;
  type: string;
  title: string;
  startAt: string;
  endAt: string;
  description: string | null;
  client: { id: string; name: string } | null;
}

interface SimpleClient {
  id: string;
  name: string;
}

interface AgendaViewProps {
  events: AgendaEvent[];
  clients: SimpleClient[];
  professionalId: string;
}

// ── Day Strip Item ───────────────────────────────────────────────────────────
function DayChip({
  date,
  isActive,
  hasEvents,
  onClick,
}: {
  date: Date;
  isActive: boolean;
  hasEvents: boolean;
  onClick: () => void;
}) {
  const today = isToday(date);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 min-w-[3.75rem] h-[4.5rem] rounded-2xl transition-all duration-200 shrink-0",
        isActive
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
          : today
            ? "bg-primary/10 text-primary"
            : "bg-muted/50 text-foreground",
        !isActive && "active:scale-95"
      )}
    >
      <span className="text-[0.65rem] font-medium uppercase leading-none">
        {format(date, "EEE", { locale: ptBR })}
      </span>
      <span className={cn("text-xl font-bold leading-none", isActive && "text-primary-foreground")}>
        {format(date, "d")}
      </span>
      {hasEvents && !isActive && (
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
      )}
      {hasEvents && isActive && (
        <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
      )}
    </button>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function AgendaView({ events, clients, professionalId }: AgendaViewProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  // Generate 30 days from today
  const days = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i));
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [createOpen, setCreateOpen] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<"ASSESSMENT" | "PRESCRIPTION">("ASSESSMENT");
  const [formClientId, setFormClientId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formEndTime, setFormEndTime] = useState("10:00");
  const [clientSearch, setClientSearch] = useState("");
  const [showClientList, setShowClientList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Scroll to today on mount
  useEffect(() => {
    todayRef.current?.scrollIntoView({ inline: "center", behavior: "instant" });
  }, []);

  // Filter events for selected day
  const dayEvents = events.filter((e) =>
    isSameDay(parseISO(e.startAt), selectedDay)
  );

  // Filtered clients for search
  const filteredClients = clientSearch.length > 0
    ? clients.filter((c) => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
    : clients;

  const selectedClient = clients.find((c) => c.id === formClientId);

  // Check if day has events
  const dayHasEvents = (date: Date) =>
    events.some((e) => isSameDay(parseISO(e.startAt), date));

  // Reset form
  const resetForm = useCallback(() => {
    setFormTitle("");
    setFormType("ASSESSMENT");
    setFormClientId(null);
    setFormDate(format(new Date(), "yyyy-MM-dd"));
    setFormStartTime("09:00");
    setFormEndTime("10:00");
    setClientSearch("");
    setShowClientList(false);
  }, []);

  // Submit event
  const handleSubmit = useCallback(async () => {
    if (!formTitle.trim()) {
      toast.error("Adicione um titulo");
      return;
    }

    setIsSaving(true);
    try {
      const startAt = new Date(`${formDate}T${formStartTime}:00`);
      const endAt = new Date(`${formDate}T${formEndTime}:00`);

      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          title: formTitle.trim(),
          description: null,
          clientId: formClientId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Erro ao criar evento");

      toast.success("Agendamento criado!");
      setCreateOpen(false);
      resetForm();
      router.refresh();
    } catch {
      toast.error("Erro ao criar agendamento");
    } finally {
      setIsSaving(false);
    }
  }, [formTitle, formType, formClientId, formDate, formStartTime, formEndTime, resetForm, router]);

  return (
    <div className="flex flex-col h-full">
      {/* ── Day Strip ──────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-border bg-background">
        {/* Month label */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-sm font-semibold text-foreground capitalize">
            {format(selectedDay, "MMMM yyyy", { locale: ptBR })}
          </p>
        </div>

        {/* Horizontal scroll strip */}
        <div
          ref={scrollRef}
          className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {days.map((day, i) => (
            <div key={day.toISOString()} ref={isToday(day) ? todayRef : undefined}>
              <DayChip
                date={day}
                isActive={isSameDay(day, selectedDay)}
                hasEvents={dayHasEvents(day)}
                onClick={() => setSelectedDay(day)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Day Label ──────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 pt-3 pb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide capitalize">
          {isToday(selectedDay)
            ? "Hoje"
            : format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* ── Event List ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-32">
        {dayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CalendarDays className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground text-center">
              Nenhum agendamento
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card active:bg-accent transition-colors"
              >
                <div
                  className={cn(
                    "flex items-center justify-center size-10 rounded-xl shrink-0",
                    event.type === "ASSESSMENT"
                      ? "bg-primary/10"
                      : "bg-orange-500/10"
                  )}
                >
                  {event.type === "ASSESSMENT" ? (
                    <ClipboardList className="size-5 text-primary" />
                  ) : (
                    <Dumbbell className="size-5 text-orange-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-[0.9rem] leading-tight">
                    {event.title}
                  </p>
                  {event.client && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {event.client.name}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-foreground tabular-nums">
                    {format(parseISO(event.startAt), "HH:mm")}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {format(parseISO(event.endAt), "HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FAB ────────────────────────────────────────────────────────── */}
      <FAB
        icon={Plus}
        onClick={() => {
          resetForm();
          setFormDate(format(selectedDay, "yyyy-MM-dd"));
          setCreateOpen(true);
        }}
        label="Novo agendamento"
      />

      {/* ── Create Event Drawer ────────────────────────────────────────── */}
      <BottomSheet
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetForm();
        }}
        title="Novo Agendamento"
        className="max-h-[85dvh]"
      >
        <div className="flex flex-col gap-5 pb-4">
          {/* Type selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormType("ASSESSMENT")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border-2 font-medium text-sm transition-all",
                formType === "ASSESSMENT"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/30 text-muted-foreground"
              )}
            >
              <ClipboardList className="size-4" />
              Avaliacao
            </button>
            <button
              type="button"
              onClick={() => setFormType("PRESCRIPTION")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border-2 font-medium text-sm transition-all",
                formType === "PRESCRIPTION"
                  ? "border-orange-500 bg-orange-500/10 text-orange-600"
                  : "border-border bg-muted/30 text-muted-foreground"
              )}
            >
              <Dumbbell className="size-4" />
              Prescricao
            </button>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Titulo</label>
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Ex: Avaliacao fisica completa"
              className="w-full h-14 bg-muted/30 border border-border rounded-xl px-4 text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Client selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Cliente (opcional)</label>
            {formClientId && selectedClient ? (
              <div className="flex items-center justify-between h-14 bg-primary/5 border border-primary/30 rounded-xl px-4">
                <span className="text-base font-medium text-foreground">
                  {selectedClient.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFormClientId(null);
                    setClientSearch("");
                  }}
                  className="size-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                  <X className="size-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <input
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowClientList(true);
                  }}
                  onFocus={() => setShowClientList(true)}
                  placeholder="Buscar cliente..."
                  className="w-full h-14 bg-muted/30 border border-border rounded-xl pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                {showClientList && filteredClients.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 bg-background border border-border rounded-xl shadow-lg max-h-40 overflow-y-auto">
                    {filteredClients.slice(0, 8).map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => {
                          setFormClientId(client.id);
                          setClientSearch("");
                          setShowClientList(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-foreground hover:bg-muted/50 active:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {client.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Data</label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full h-14 bg-muted/30 border border-border rounded-xl px-4 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">Inicio</label>
              <input
                type="time"
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="w-full h-14 bg-muted/30 border border-border rounded-xl px-4 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">Fim</label>
              <input
                type="time"
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                className="w-full h-14 bg-muted/30 border border-border rounded-xl px-4 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Sticky CTA */}
        <div
          className="sticky bottom-0 bg-background border-t border-border/50 p-4 -mx-4 z-10"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || !formTitle.trim()}
            className={cn(
              "w-full h-14 rounded-full font-bold text-lg transition-all duration-300",
              !formTitle.trim() || isSaving
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.97] shadow-lg shadow-primary/25"
            )}
          >
            {isSaving ? "Salvando..." : "Criar Agendamento"}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
