"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, ClipboardList, Dumbbell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { FAB } from "@/components/mobile/fab";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  type: string;
  title: string;
  startAt: Date;
  endAt: Date;
  description: string | null;
  client: { name: string } | null;
}

interface CalendarViewProps {
  events: CalendarEvent[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDetailOpen, setEventDetailOpen] = useState(false);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOfWeek = startOfMonth(currentMonth).getDay();

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.startAt), day));

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const prevMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="flex flex-col">
      {/* Month Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-9 w-9">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <p className="font-semibold text-foreground capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </p>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-9 w-9">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="px-4 py-3">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekdays.map((d, i) => (
            <div key={i} className="flex items-center justify-center h-8">
              <span className="text-xs font-medium text-muted-foreground">{d}</span>
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
            const hasEvents = dayEvents.length > 0;

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "flex flex-col items-center justify-center h-10 w-full rounded-xl transition-colors",
                  isSelected && "bg-primary text-primary-foreground",
                  !isSelected && isToday(day) && "text-primary font-bold",
                  !isSelected && !isToday(day) && "text-foreground",
                  !isSelected && hasEvents && "bg-primary/10"
                )}
              >
                <span className="text-sm leading-none">{format(day, "d")}</span>
                {hasEvents && !isSelected && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events */}
      {selectedDay && (
        <div className="px-4 pb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>

          {selectedDayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <CalendarDays className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum agendamento neste dia</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedDayEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event);
                    setEventDetailOpen(true);
                  }}
                  className="flex items-center gap-3 p-3 min-h-12 rounded-xl border border-border bg-card text-left active:bg-accent transition-colors w-full"
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0",
                    event.type === "ASSESSMENT" ? "bg-primary/10" : "bg-orange-500/10"
                  )}>
                    {event.type === "ASSESSMENT" ? (
                      <ClipboardList className="w-4 h-4 text-primary" />
                    ) : (
                      <Dumbbell className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{event.title}</p>
                    {event.client && (
                      <p className="text-xs text-muted-foreground truncate">{event.client.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.startAt), "HH:mm")} — {format(new Date(event.endAt), "HH:mm")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Event Detail Bottom Sheet */}
      <BottomSheet
        open={eventDetailOpen}
        onOpenChange={setEventDetailOpen}
        title={selectedEvent?.title}
      >
        {selectedEvent && (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedEvent.type === "ASSESSMENT" ? "Avaliação" : "Prescrição"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {format(new Date(selectedEvent.startAt), "dd/MM/yyyy")}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Horário</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {format(new Date(selectedEvent.startAt), "HH:mm")} — {format(new Date(selectedEvent.endAt), "HH:mm")}
              </p>
            </div>
            {selectedEvent.client && (
              <div>
                <p className="text-sm font-medium text-foreground">Cliente</p>
                <p className="text-sm text-muted-foreground mt-0.5">{selectedEvent.client.name}</p>
              </div>
            )}
            {selectedEvent.description && (
              <div>
                <p className="text-sm font-medium text-foreground">Descrição</p>
                <p className="text-sm text-muted-foreground mt-0.5">{selectedEvent.description}</p>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      {/* FAB — mesmo padrão das demais telas */}
      <FAB
        icon={Plus}
        onClick={() => router.push("/app/mais/calendario/novo")}
        label="Novo Agendamento"
      />
    </div>
  );
}
