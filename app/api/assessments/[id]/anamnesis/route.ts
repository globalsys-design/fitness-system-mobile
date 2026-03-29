import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function verifyAssessmentOwnership(assessmentId: string, userId: string) {
  const assessment = await db.assessment.findFirst({
    where: {
      id: assessmentId,
      professional: { userId },
    },
  });
  return assessment;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owned = await verifyAssessmentOwnership(id, session.user.id);
  if (!owned)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const anamnesis = await db.anamnesis.findUnique({
    where: { assessmentId: id },
  });

  return NextResponse.json(anamnesis);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owned = await verifyAssessmentOwnership(id, session.user.id);
  if (!owned)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const anamnesis = await db.anamnesis.upsert({
    where: { assessmentId: id },
    create: { assessmentId: id, ...body },
    update: body,
  });

  return NextResponse.json(anamnesis);
}
