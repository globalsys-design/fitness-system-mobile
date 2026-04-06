import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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

  const body = await req.json();

  const client = await db.client.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.email !== undefined && { email: body.email || null }),
      ...(body.phone !== undefined && { phone: body.phone || null }),
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
      ...(body.address !== undefined && { address: body.address }),
      ...(body.emergencyContact !== undefined && {
        emergencyContact: body.emergencyContact,
      }),
    },
  });

  return NextResponse.json(client);
}
