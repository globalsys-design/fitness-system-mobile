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
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const professional = await db.professional.findUnique({
      where: { userId: session.user.id },
    });

    if (!professional) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }

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
    if (body.city !== undefined || body.state !== undefined) {
      const existing = (professional.address as any) || {};
      const newAddress = {
        street: existing.street || null,
        neighborhood: existing.neighborhood || null,
        city: body.city !== undefined ? body.city : existing.city || null,
        state: body.state !== undefined ? body.state : existing.state || null,
        zipCode: existing.zipCode || null,
      };
      data.address = newAddress;
    }

    await db.professional.update({
      where: { id: professional.id },
      data,
    });

    if (body.name !== undefined) {
      await db.user.update({
        where: { id: session.user.id },
        data: { name: body.name },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
