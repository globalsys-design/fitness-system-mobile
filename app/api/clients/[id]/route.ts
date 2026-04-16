import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const patchClientSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  phoneDdi: z.string().optional(),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["M", "F", ""]).optional(),
  objective: z.string().optional(),
  activityLevel: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  address: z.record(z.string(), z.string().optional()).optional(),
  emergencyContact: z.record(z.string(), z.unknown()).nullable().optional(),
  availability: z.record(z.string(), z.unknown()).nullable().optional(),
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

  const client = await db.client.findFirst({
    where: { id, professionalId: professional.id },
    include: {
      assessments: {
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          population: true,
          modality: true,
          status: true,
          createdAt: true,
        },
      },
      prescriptions: {
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          createdAt: true,
        },
      },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json(client);
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

  const existing = await db.client.findFirst({
    where: { id, professionalId: professional.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = patchClientSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body = parsed.data;

  try {
    const client = await db.client.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email || null }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
        ...(body.phoneDdi !== undefined && { phoneDdi: body.phoneDdi || null }),
        ...(body.cpf !== undefined && { cpf: body.cpf || null }),
        ...(body.birthDate !== undefined && {
          birthDate: body.birthDate ? new Date(body.birthDate) : null,
        }),
        ...(body.gender !== undefined && { gender: body.gender }),
        ...(body.objective !== undefined && { objective: body.objective || null }),
        ...(body.activityLevel !== undefined && {
          activityLevel: body.activityLevel || null,
        }),
        ...(body.status !== undefined && { status: body.status }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(body.address !== undefined && { address: body.address as any }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(body.emergencyContact !== undefined && { emergencyContact: body.emergencyContact as any }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(body.availability !== undefined && { availability: (body.availability || null) as any }),
      },
    });

    return NextResponse.json(client);
  } catch (err) {
    console.error("[PATCH /api/clients/:id] DB error:", err);
    return NextResponse.json({ error: "Erro interno ao atualizar cliente" }, { status: 500 });
  }
}
