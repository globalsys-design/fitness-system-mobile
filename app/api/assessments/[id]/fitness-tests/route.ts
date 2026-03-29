import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function verifyOwnership(assessmentId: string, userId: string) {
  return db.assessment.findFirst({
    where: { id: assessmentId, professional: { userId } },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await verifyOwnership(id, session.user.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const fitnessTest = await db.fitnessTest.findUnique({
    where: { assessmentId: id },
  });

  return NextResponse.json(fitnessTest);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await verifyOwnership(id, session.user.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const fitnessTest = await db.fitnessTest.upsert({
    where: { assessmentId: id },
    create: { assessmentId: id, ...body },
    update: body,
  });

  return NextResponse.json(fitnessTest);
}
