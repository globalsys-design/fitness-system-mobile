import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const anamnesis = await db.anamnesis.upsert({
    where: { assessmentId: id },
    create: { assessmentId: id, ...body },
    update: body,
  });

  return NextResponse.json(anamnesis);
}
