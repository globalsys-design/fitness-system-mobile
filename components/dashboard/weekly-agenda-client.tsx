"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CalendarClock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  startAt: string;
  endAt: string;
  client: { name: string } | null;
}

interface WeeklyAgendaClientProps {
  initialEvents: CalendarEvent[];
}

function buildWeekDays(): {
  date: Date;
  label: string;
  dayNum: number;
  isToday: boolean;
}[] {
  const today = new Date();
  const days: {
    date: Date;
    label: string;
    dayNum: number;
    isToday: boolean;
  }[] = [];
  const weekdayShort = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    days.push({
      date: d,
      label: weekdayShort[d.getDay()],
      dayNum: d.getDate(),
      isToday: offset === 0,
    });
  }
  return days;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function getDayLabel(date: Date): string {
  const weekdays = [
    "DOMINGO",
    "SEGUNDA-FEIRA",
    "TERÇA-FEIRA",
    "QUARTA-FEIRA",
    "QUINTA-FEIRA",
    "SEXTA-FEIRA",
    "SÁBADO",
  ];
  const today = new Date();
  if (isSameDay(date, today)) {
    return "HOJE";
  }
  return "DE " + weekdays[date.getDay()];
}

export function WeeklyAgendaClient({
  initialEvents,
}: WeeklyAgendaClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekDays = useMemo(() => buildWeekDays(), []);

  // Filter events for selected date
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) =>
      isSameDay(new Date(event.startAt), selectedDate)
    );
  }, [initialEvents, selectedDate]);

  const agendaTitle = `AGENDA ${getDayLabel(selectedDate)}`;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-b-[1.5rem]",
        "bg-gradient-to-br from-secondary via-primary/80 to-primary",
        "px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-6"
      )}
    >
      {/* ── Header: Brand + Notification ─────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xs font-bold tracking-[0.2em] uppercase text-white/60">
          FITNESS SYSTEM
        </h1>
        <Link
          href="/app/mais/notificacoes"
          className="glass-on-dark inline-flex items-center gap-3 px-3 py-[5px] rounded-xl"
        >
          <CalendarClock className="size-4 text-primary-foreground shrink-0" />
          <span className="text-xs font-medium text-primary-foreground whitespace-nowrap">
            Alta Prioridade
          </span>
        </Link>
      </div>

      {/* ── Greeting ───────────────────────────────────────────────── */}
      <div className="mb-5">
        <p className="text-sm text-white/60">Boa tarde</p>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Administrador <span className="inline-block">👋</span>
        </h2>
        <p className="text-xs text-white/50 mt-0.5 capitalize">
          Sexta-Feira, 10 de Abril
        </p>
      </div>

      {/* ── Weekly Calendar Strip — Interactive ─────────────────── */}
      <div
        className="flex items-center gap-2 overflow-x-auto mb-5"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {weekDays.map((day) => (
          <button
            key={`${day.dayNum}-${day.label}`}
            type="button"
            onClick={() => setSelectedDate(day.date)}
            className={cn(
              "flex flex-col items-center gap-0.5 min-w-[3rem] py-2 px-1 rounded-2xl transition-all",
              isSameDay(day.date, selectedDate)
                ? "bg-white text-secondary shadow-lg border border-info/30"
                : "text-white/60"
            )}
          >
            <span className="text-[10px] font-semibold uppercase">
              {day.label}
            </span>
            <span
              className={cn(
                "text-lg font-bold leading-none",
                isSameDay(day.date, selectedDate)
                  ? "text-secondary"
                  : "text-white"
              )}
            >
              {day.dayNum}
            </span>
          </button>
        ))}
      </div>

      {/* ── Agenda Section — Dynamic ─────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide">
          {agendaTitle}
        </h3>

        {filteredEvents.length === 0 ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <CalendarClock className="size-5 text-white/40 shrink-0" />
            <p className="text-sm text-white/50">Nenhum compromisso neste dia</p>
          </div>
        ) : (
          filteredEvents.map((event, idx) => (
            <div
              key={event.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all",
                idx === 0
                  ? "bg-white/90 text-secondary border-white/20 shadow-sm"
                  : "bg-white/10 text-white backdrop-blur-sm border-white/10"
              )}
            >
              {/* Time */}
              <div className="flex flex-col items-center shrink-0 min-w-[2.5rem]">
                <span
                  className={cn(
                    "text-xs font-bold",
                    idx === 0 ? "text-secondary" : "text-white/80"
                  )}
                >
                  {formatTime(event.startAt)}
                </span>
              </div>

              {/* Divider */}
              <div
                className={cn(
                  "w-px h-8 rounded-full",
                  idx === 0 ? "bg-primary/30" : "bg-white/20"
                )}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-semibold truncate",
                    idx === 0 ? "text-secondary" : "text-white"
                  )}
                >
                  {event.title}
                </p>
                {event.client && (
                  <p
                    className={cn(
                      "text-xs truncate",
                      idx === 0 ? "text-secondary/60" : "text-white/50"
                    )}
                  >
                    {event.client.name}
                  </p>
                )}
              </div>

              {/* Type badge */}
              <span
                className={cn(
                  "shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase",
                  event.type === "ASSESSMENT"
                    ? idx === 0
                      ? "bg-primary/10 text-primary"
                      : "bg-primary/20 text-primary-foreground"
                    : idx === 0
                      ? "bg-warning/10 text-warning"
                      : "bg-warning/20 text-primary-foreground"
                )}
              >
                {event.type === "ASSESSMENT" ? "Aval." : "Treino"}
              </span>
            </div>
          ))
        )}

        {filteredEvents.length > 3 && (
          <Link
            href="/app/mais/agenda"
            className="text-xs text-white/50 text-center py-1 hover:text-white/70 transition-colors"
          >
            +{filteredEvents.length - 3} compromissos • Ver agenda completa
          </Link>
        )}
      </div>
    </section>
  );
}
