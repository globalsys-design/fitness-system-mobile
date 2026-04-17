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
    const zodErrors = parsed.error.flatten();
    const firstFieldError = Object.values(
      zodErrors.fieldErrors as Record<string, string[]>
    ).flat()[0];
    return NextResponse.json(
      { error: firstFieldError ?? "Dados inválidos", details: zodErrors },
      { status: 400 }
    );
  }

  const { address, permissions, birthDate, password, ...rest } = parsed.data;

  // ── Clean address: ignore if all fields are empty ──────────────────────────
  const cleanAddress =
    address && typeof address === "object" &&
    Object.values(address).some((v) => v && String(v).trim() !== "")
      ? address
      : undefined;

  // ── Hash password if provided ──────────────────────────────────────────────
  let passwordHash: string | undefined;
  if (password) {
    passwordHash = await bcrypt.hash(password, 12);
  }

  // ── Strip undefined from rest (Prisma 6 throws on explicit undefined) ──────
  // Prisma v6+ has strictUndefinedChecks enabled by default.
  // Spreading Zod-parsed optional fields (phone: undefined, cpf: undefined, etc.)
  // directly into Prisma data causes: "TypeError: Cannot pass `undefined` as value..."
  const safeRest = Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined)
  ) as Omit<typeof rest, "address" | "permissions" | "birthDate" | "password">;

  let assistant;
  try {
    assistant = await db.assistant.create({
      data: {
        ...safeRest,
        professionalId: professional.id,
        // Use UTC noon to avoid timezone shifting the date by ±1 day
        ...(birthDate ? { birthDate: new Date(birthDate + "T12:00:00Z") } : {}),
        ...(passwordHash ? { passwordHash } : {}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(cleanAddress ? { address: cleanAddress as any } : {}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(permissions ? { permissions: permissions as any } : {}),
      },
    });
  } catch (err: unknown) {
    console.error("[POST /api/assistants] DB error:", err);

    // Prisma unique constraint (e.g. email already taken by another entity)
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email já está em uso por outro registro" },
        { status: 409 }
      );
    }

    // Return debug info in development to speed up troubleshooting
    return NextResponse.json(
      {
        error: "Erro ao criar assistente",
        ...(process.env.NODE_ENV === "development" && {
          debug: err instanceof Error ? err.message : String(err),
        }),
      },
      { status: 500 }
    );
  }

  return NextResponse.json(assistant, { status: 201 });
}
