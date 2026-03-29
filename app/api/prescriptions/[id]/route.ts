import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

async function verifyOwnership(prescriptionId: string, userId: string) {
  return db.prescription.findFirst({
    where: { id: prescriptionId, professional: { userId } },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await verifyOwnership(id, session.user.id)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const prescription = await db.prescription.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, photo: true } },
        trainingSheet: true,
      },
    });

    if (!prescription) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(prescription);
  } catch (error) {
    console.error("Error fetching prescription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await verifyOwnership(id, session.user.id)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { exercises, aerobicData, type } = body;

    // Update prescription content
    const prescription = await db.prescription.update({
      where: { id },
      data: {
        content: type === "AEROBIC" ? aerobicData : undefined,
        updatedAt: new Date(),
      },
      include: { trainingSheet: true },
    });

    // Update training sheet exercises if present
    if (exercises && prescription.trainingSheet) {
      await db.trainingSheet.update({
        where: { id: prescription.trainingSheet.id },
        data: { exercises },
      });
    }

    return NextResponse.json(prescription);
  } catch (error) {
    console.error("Error updating prescription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await verifyOwnership(id, session.user.id)))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db.prescription.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prescription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
