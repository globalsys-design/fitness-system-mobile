/**
 * Seed seguro — apenas garante o usuário admin + profile Professional.
 * NÃO apaga clients, assistants, assessments ou qualquer outro dado.
 *
 * Uso:
 *   npx tsx prisma/seed-admin.ts
 *
 * Credenciais:
 *   email: admin@fitnesssystem.app
 *   senha: Admin@2026!
 */
import { PrismaClient, Plan } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const ADMIN_EMAIL = "admin@fitnesssystem.app";
const ADMIN_PASSWORD = "Admin@2026!";
const ADMIN_NAME = "Administrador";

async function main() {
  console.log(`\n🔐 Seed admin → ${ADMIN_EMAIL}`);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Upsert do User: cria ou atualiza passwordHash.
  // Preserva emailVerified/plan/trialEndsAt se já existirem.
  const adminUser = await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      passwordHash,
      // Garante que o login funcione mesmo se algum campo ficou inconsistente
      emailVerified: new Date(),
    },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      passwordHash,
      emailVerified: new Date(),
      plan: Plan.TRIAL,
      trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      role: "PROFESSIONAL",
    },
  });

  console.log(`   ✓ User OK (id: ${adminUser.id})`);

  // Garante Professional profile vinculado.
  const existing = await db.professional.findUnique({
    where: { userId: adminUser.id },
  });

  if (!existing) {
    const professional = await db.professional.create({
      data: {
        userId: adminUser.id,
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
      },
    });
    console.log(`   ✓ Professional criado (id: ${professional.id})`);
  } else {
    console.log(`   ✓ Professional já existe (id: ${existing.id})`);
  }

  console.log(`\n✅ Admin pronto. Faça login com:`);
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Senha: ${ADMIN_PASSWORD}\n`);
}

main()
  .catch((e) => {
    console.error("❌ Falha no seed-admin:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
