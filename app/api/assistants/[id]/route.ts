import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const patchAssistantSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  profession: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  permissions: z.record(z.string(), z.unknown()).optional(),
  address: z.record(z.string(), z.string().optional()).optional(),
  birthCity: z.string().optional(),
  maritalStatus: z.string().optional(),
}).strict();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
  });
  if (!professional) {
    return NextResponse.json({ error: "Professional not found" }, { status: 404 });
  }

  const assistant = await db.assistant.findFirst({
    where: { id, professionalId: professional.id },
    include: {
      assessments: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { client: { select: { name: true } } },
      },
      prescriptions: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!assistant) {
    return NextResponse.json({ error: "Assistant not found" }, { status: 404 });
  }

  return NextResponse.json(assistant);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
  });
  if (!professional) {
    return NextResponse.json({ error: "Professional not found" }, { status: 404 });
  }

  // Verifica se o assistente pertence ao profissional
  const existing = await db.assistant.findFirst({
    where: { id, professionalId: professional.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Assistant not found" }, { status: 404 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = patchAssistantSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body = parsed.data;

  try {
    const assistant = await db.assistant.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
        ...(body.cpf !== undefined && { cpf: body.cpf || null }),
        ...(body.profession !== undefined && { profession: body.profession || null }),
        ...(body.status !== undefined && { status: body.status }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(body.permissions !== undefined && { permissions: body.permissions as any }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(body.address !== undefined && { address: body.address as any }),
        ...(body.birthCity !== undefined && { birthCity: body.birthCity || null }),
        ...(body.maritalStatus !== undefined && { maritalStatus: body.maritalStatus || null }),
      },
    });

    return NextResponse.json(assistant);
  } catch (err) {
    console.error("[PATCH /api/assistants/:id] DB error:", err);
    return NextResponse.json({ error: "Erro interno ao atualizar assistente" }, { status: 500 });
  }
}
