import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profession: true,
      specialty: true,
      cref: true,
      photo: true,
      address: true,
    },
  });

  return NextResponse.json(professional ?? {});
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
  });

  if (professional) {
    // Build update data — only include defined fields
    const data: Record<string, any> = {};
    if (body.name      !== undefined) data.name      = body.name;
    if (body.phone     !== undefined) data.phone     = body.phone || null;
    if (body.profession !== undefined) data.profession = body.profession || null;
    if (body.specialty !== undefined) data.specialty = body.specialty || null;
    if (body.cref      !== undefined) data.cref      = body.cref || null;
    if (body.photo     !== undefined) data.photo     = body.photo || null;
    if (body.address   !== undefined) data.address   = body.address || null;

    // Store city/state inside address JSON for compatibility
    if (body.city || body.state) {
      const existing = (professional.address as any) ?? {};
      data.address = {
        ...existing,
        ...(body.city  ? { city:  body.city  } : {}),
        ...(body.state ? { state: body.state } : {}),
      };
    }

    await db.professional.update({
      where: { id: professional.id },
      data,
    });
  }

  if (body.name !== undefined) {
    await db.user.update({
      where: { id: session.user.id },
      data: { name: body.name },
    });
  }

  return NextResponse.json({ success: true });
}
