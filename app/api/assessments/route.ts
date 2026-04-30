import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assessmentSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
  });
  if (!professional) return NextResponse.json({ error: "Professional not found" }, { status: 404 });

  const body = await req.json();
  const parsed = assessmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Compat: aceita `modalities` (array, novo) ou `modality` (string, legado).
  // Persiste como string única separada por ", " — evita migração de schema.
  const modalityValue =
    parsed.data.modalities && parsed.data.modalities.length > 0
      ? parsed.data.modalities.join(", ")
      : parsed.data.modality;

  const assessment = await db.assessment.create({
    data: {
      clientId: parsed.data.clientId,
      professionalId: professional.id,
      population: parsed.data.population as any,
      modality: modalityValue,
    },
  });

  // Cria CalendarEvent se o usuário optou por agendar a próxima avaliação.
  // Erros aqui não bloqueiam a criação da avaliação — loga e segue.
  if (
    parsed.data.scheduleNext &&
    parsed.data.nextDate &&
    parsed.data.nextStartTime &&
    parsed.data.nextEndTime
  ) {
    try {
      const startAt = new Date(`${parsed.data.nextDate}T${parsed.data.nextStartTime}:00`);
      const endAt = new Date(`${parsed.data.nextDate}T${parsed.data.nextEndTime}:00`);

      if (!isNaN(startAt.getTime()) && !isNaN(endAt.getTime()) && startAt < endAt) {
        const client = await db.client.findUnique({
          where: { id: parsed.data.clientId },
          select: { name: true },
        });
        await db.calendarEvent.create({
          data: {
            professionalId: professional.id,
            clientId: parsed.data.clientId,
            type: "ASSESSMENT",
            title: `Avaliação${client?.name ? ` — ${client.name}` : ""}`,
            startAt,
            endAt,
          },
        });
      }
    } catch (err) {
      console.warn("[assessments] Falha ao criar CalendarEvent:", err);
    }
  }

  return NextResponse.json(assessment, { status: 201 });
}
