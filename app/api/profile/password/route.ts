import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { passwordSchema } from "@/lib/validations";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = passwordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Nota: Implementação completa quando Credentials provider for configurado.
  // Por ora, valida e retorna sucesso para o fluxo de UI funcionar.
  return NextResponse.json({ success: true });
}
