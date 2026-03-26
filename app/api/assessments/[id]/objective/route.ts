import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const objective = await db.assessmentObjective.findUnique({
    where: { assessmentId: id },
  });

  return NextResponse.json(objective ?? null);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const objective = await db.assessmentObjective.upsert({
    where: { assessmentId: id },
    create: { assessmentId: id, goals: body.goals, availability: body.availability },
    update: { goals: body.goals, availability: body.availability },
  });

  return NextResponse.json(objective);
}
