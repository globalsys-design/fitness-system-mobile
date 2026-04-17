import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assistantSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
  });
  if (!professional) return NextResponse.json({ error: "Professional not found" }, { status: 404 });

  const assistants = await db.assistant.findMany({
    where: { professionalId: professional.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(assistants);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
  });
  if (!professional) return NextResponse.json({ error: "Professional not found" }, { status: 404 });

  const body = await req.json();
  const parsed = assistantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { address, permissions, birthDate, password, ...rest } = parsed.data;

  // Hash password if provided
  let passwordHash: string | undefined;
  if (password) {
    passwordHash = await bcrypt.hash(password, 12);
  }

  let assistant;
  try {
    assistant = await db.assistant.create({
      data: {
        ...rest,
        professionalId: professional.id,
        ...(birthDate ? { birthDate: new Date(birthDate) } : {}),
        ...(passwordHash ? { passwordHash } : {}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(address ? { address: address as any } : {}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(permissions ? { permissions: permissions as any } : {}),
      },
    });
  } catch (err) {
    console.error("[POST /api/assistants] DB error:", err);
    return NextResponse.json({ error: "Erro ao criar assistente" }, { status: 500 });
  }

  return NextResponse.json(assistant, { status: 201 });
}
