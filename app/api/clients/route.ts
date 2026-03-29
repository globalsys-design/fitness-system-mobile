import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

/**
 * Lightweight server-side schema — accepts the payload from the client form.
 * We intentionally keep this permissive since the client already validates with Zod.
 */
const createClientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")).transform(v => v || undefined),
  phone: z.string().optional().transform(v => v || undefined),
  phoneDdi: z.string().default("+55"),
  cpf: z.string().optional().transform(v => v || undefined),
  birthDate: z.string().optional().transform(v => v || undefined),
  gender: z.string().optional().transform(v => v || undefined),
  ethnicity: z.string().optional().transform(v => v || undefined),
  maritalStatus: z.string().optional().transform(v => v || undefined),
  healthInsurance: z.string().optional().transform(v => v || undefined),
  profession: z.string().optional().transform(v => v || undefined),
  photo: z.string().optional().transform(v => v || undefined),
  address: z.any().optional(),
  responsibleContact: z.any().optional(),
  emergencyContact: z.any().optional(),
  availability: z.any().optional(),
  password: z.string().optional().transform(v => v || undefined),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const professional = await db.professional.findUnique({
    where: { userId: session.user.id },
  });
  if (!professional) return NextResponse.json({ error: "Professional not found" }, { status: 404 });

  const clients = await db.client.findMany({
    where: { professionalId: professional.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json();
    console.log("[API /clients POST] Raw body:", JSON.stringify(body, null, 2));

    const parsed = createClientSchema.safeParse(body);
    if (!parsed.success) {
      console.error("[API /clients POST] Validation error:", parsed.error.flatten());
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const {
      password,
      birthDate,
      address,
      responsibleContact,
      emergencyContact,
      availability,
      phoneDdi,
      ...rest
    } = parsed.data;

    // Hash password if provided
    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 12);
    }

    // Clean address — remove if all fields are empty
    const cleanAddress = address && typeof address === "object"
      ? Object.values(address).some((v) => v && String(v).trim() !== "")
        ? address
        : undefined
      : undefined;

    // Clean responsibleContact
    const cleanResponsible = responsibleContact && typeof responsibleContact === "object"
      ? Object.values(responsibleContact).some((v) => v && String(v).trim() !== "")
        ? responsibleContact
        : undefined
      : undefined;

    // Clean emergencyContact
    const cleanEmergency = emergencyContact && typeof emergencyContact === "object"
      ? Object.values(emergencyContact).some((v) => v && String(v).trim() !== "")
        ? emergencyContact
        : undefined
      : undefined;

    const client = await db.client.create({
      data: {
        ...rest,
        birthDate: birthDate ? new Date(birthDate + "T00:00:00") : undefined,
        address: cleanAddress || undefined,
        responsibleContact: cleanResponsible || undefined,
        emergencyContact: cleanEmergency || undefined,
        availability: availability || undefined,
        passwordHash,
        professionalId: professional.id,
      } as any,
    });

    console.log("[API /clients POST] Client created:", client.id);
    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error("[API /clients POST] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || "Erro inesperado ao criar cliente.",
      },
      { status: 500 }
    );
  }
}
