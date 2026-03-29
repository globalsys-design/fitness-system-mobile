import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clinicalExam = await db.clinicalExam.findUnique({
    where: { assessmentId: id },
  });

  return NextResponse.json(clinicalExam);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const clinicalExam = await db.clinicalExam.upsert({
    where: { assessmentId: id },
    create: { assessmentId: id, ...body },
    update: body,
  });

  return NextResponse.json(clinicalExam);
}
