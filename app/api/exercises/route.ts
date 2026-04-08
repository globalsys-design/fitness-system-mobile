import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createExerciseSchema = z.object({
  name: z.string().min(2, "Nome deve ter no minimo 2 caracteres"),
  category: z.enum(["STRENGTH", "AEROBIC"]),
  muscleGroups: z.array(z.string()).min(1, "Selecione ao menos 1 grupo muscular"),
  videoUrl: z.string().url().optional().or(z.literal("")),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const professional = await db.professional.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!professional)
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const muscleGroup = searchParams.get("muscleGroup") ?? "";

    const exercises = await db.exercise.findMany({
      where: {
        professionalId: professional.id,
        ...(search && {
          name: { contains: search, mode: "insensitive" as const },
        }),
        ...(muscleGroup && {
          muscleGroups: { has: muscleGroup },
        }),
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error("[EXERCISES_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const professional = await db.professional.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!professional)
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });

    const body = await req.json();
    const parsed = createExerciseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const exercise = await db.exercise.create({
      data: {
        professionalId: professional.id,
        name: parsed.data.name,
        category: parsed.data.category,
        muscleGroups: parsed.data.muscleGroups,
        videoUrl: parsed.data.videoUrl || null,
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error("[EXERCISES_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
