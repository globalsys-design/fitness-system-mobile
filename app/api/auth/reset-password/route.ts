import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recoveryEmailSchema, resetPasswordSchema } from "@/lib/validations";
import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * POST — Solicita recuperação de senha.
 * Gera token, salva em VerificationToken e envia email via Resend.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = recoveryEmailSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
  });

  // Sempre retorna sucesso (não revela se email existe)
  if (!user) {
    return NextResponse.json({ success: true });
  }

  // Gera token de recuperação
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  // Salva no banco (reutiliza VerificationToken)
  await db.verificationToken.create({
    data: {
      identifier: parsed.data.email,
      token,
      expires,
    },
  });

  // Envia email via Resend (se configurado)
  if (process.env.RESEND_API_KEY) {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const resetUrl = `${appUrl}/login/recuperar-senha/nova-senha?token=${token}&email=${encodeURIComponent(parsed.data.email)}`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Fitness System <noreply@fitnesssystem.app>",
          to: parsed.data.email,
          subject: "Redefinir sua senha — Fitness System",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
              <h2 style="color: #0d9488; margin-bottom: 16px;">Redefinir Senha</h2>
              <p>Você solicitou a redefinição da sua senha no Fitness System.</p>
              <p>Clique no botão abaixo para criar uma nova senha:</p>
              <a href="${resetUrl}" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
                Redefinir Senha
              </a>
              <p style="color: #666; font-size: 14px;">Este link expira em 1 hora.</p>
              <p style="color: #999; font-size: 12px;">Se você não solicitou esta alteração, ignore este email.</p>
            </div>
          `,
        }),
      });
    } catch (error) {
      console.error("Erro ao enviar email de recuperação:", error);
    }
  }

  return NextResponse.json({ success: true });
}

/**
 * PATCH — Redefine a senha usando o token.
 */
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { token, email, password, confirmPassword } = body;

  if (!token || !email) {
    return NextResponse.json(
      { error: "Token e email são obrigatórios" },
      { status: 400 }
    );
  }

  const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Verifica token
  const verificationToken = await db.verificationToken.findFirst({
    where: {
      identifier: email,
      token,
      expires: { gt: new Date() },
    },
  });

  if (!verificationToken) {
    return NextResponse.json(
      { error: "Token inválido ou expirado" },
      { status: 400 }
    );
  }

  // Verifica se usuário existe
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 }
    );
  }

  // Remove token usado
  await db.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  });

  // Salva nova senha com hash
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.user.update({
    where: { email },
    data: { passwordHash },
  });

  return NextResponse.json({ success: true });
}
