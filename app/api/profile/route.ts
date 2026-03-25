import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
  });

  if (professional) {
    await db.professional.update({
      where: { id: professional.id },
      data: {
        name: body.name,
        phone: body.phone,
        profession: body.profession,
        specialty: body.specialty,
      },
    });
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { name: body.name },
  });

  return NextResponse.json({ success: true });
}
