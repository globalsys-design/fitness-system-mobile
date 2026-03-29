import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const professional = await db.professional.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!professional) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");
    const type = searchParams.get("type");

    const where: any = { professionalId: professional.id };
    if (clientId) where.clientId = clientId;
    if (type) where.type = type;

    const prescriptions = await db.prescription.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, photo: true } },
        trainingSheet: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const professional = await db.professional.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!professional) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }

    const body = await request.json();
    const { clientId, type, exercises, aerobicData } = body;

    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    // Create the prescription with nested training sheet
    const prescription = await db.prescription.create({
      data: {
        clientId,
        professionalId: professional.id,
        type: type === "AEROBIC" ? "AEROBIC" : "TRAINING",
        content: type === "AEROBIC" ? aerobicData : null,
        trainingSheet:
          type !== "AEROBIC"
            ? {
                create: {
                  exercises: exercises || [],
                },
              }
            : undefined,
      },
      include: {
        client: { select: { id: true, name: true, photo: true } },
        trainingSheet: true,
      },
    });

    return NextResponse.json(prescription, { status: 201 });
  } catch (error) {
    console.error("Error creating prescription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
