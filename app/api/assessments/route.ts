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

  const assessment = await db.assessment.create({
    data: {
      clientId: parsed.data.clientId,
      professionalId: professional.id,
      population: parsed.data.population as any,
      modality: parsed.data.modality,
    },
  });

  return NextResponse.json(assessment, { status: 201 });
}
