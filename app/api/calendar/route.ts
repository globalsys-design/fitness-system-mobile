import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
  });
  if (!professional) return NextResponse.json({ error: "Professional not found" }, { status: 404 });

  const body = await req.json();

  const event = await db.calendarEvent.create({
    data: {
      professionalId: professional.id,
      type: body.type,
      title: body.title,
      description: body.description,
      startAt: new Date(body.startAt),
      endAt: new Date(body.endAt),
    },
  });

  return NextResponse.json(event, { status: 201 });
}
