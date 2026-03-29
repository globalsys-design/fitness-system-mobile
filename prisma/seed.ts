import { PrismaClient, Plan } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@2026!", 12);

  // Create admin user
  const adminUser = await db.user.upsert({
    where: { email: "admin@fitnesssystem.app" },
    update: { passwordHash },
    create: {
      email: "admin@fitnesssystem.app",
      name: "Administrador",
      passwordHash,
      emailVerified: new Date(),
      plan: Plan.TRIAL,
      trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      role: "PROFESSIONAL",
    },
  });

  // Create professional profile
  let professional = await db.professional.findUnique({
    where: { userId: adminUser.id },
  });

  if (!professional) {
    professional = await db.professional.create({
      data: {
        userId: adminUser.id,
        name: "Administrador",
        email: "admin@fitnesssystem.app",
      },
    });
  }

  // Clear existing clients (optional - for clean seed)
  await db.client.deleteMany({
    where: { professionalId: professional.id },
  });

  // Create 10 clients (mix of adults and minors)
  const clientNames = [
    { name: "Carlos Silva", birthDate: new Date("1990-05-15"), email: "carlos@example.com" },
    { name: "Ana Santos", birthDate: new Date("1985-10-22"), email: "ana@example.com" },
    { name: "João Pereira", birthDate: new Date("2008-03-10"), email: "joao@example.com" }, // Minor
    { name: "Maria Oliveira", birthDate: new Date("1995-07-18"), email: "maria@example.com" },
    { name: "Pedro Alves", birthDate: new Date("2007-12-05"), email: "pedro@example.com" }, // Minor
    { name: "Julia Costa", birthDate: new Date("1988-01-30"), email: "julia@example.com" },
    { name: "Lucas Ferreira", birthDate: new Date("2009-06-14"), email: "lucas@example.com" }, // Minor
    { name: "Fernanda Gomes", birthDate: new Date("1992-09-25"), email: "fernanda@example.com" },
    { name: "Rafael Martins", birthDate: new Date("2006-11-08"), email: "rafael@example.com" }, // Minor
    { name: "Patricia Rocha", birthDate: new Date("1987-04-12"), email: "patricia@example.com" },
  ];

  for (const clientData of clientNames) {
    await db.client.create({
      data: {
        name: clientData.name,
        email: clientData.email,
        phone: `11 9${Math.floor(Math.random() * 90000000) + 10000000}`,
        phoneDdi: "+55",
        birthDate: clientData.birthDate,
        gender: Math.random() > 0.5 ? "M" : "F",
        ethnicity: ["Branco", "Preto", "Pardo", "Amarelo", "Indígena"][Math.floor(Math.random() * 5)],
        status: "ACTIVE",
        professionalId: professional.id,
        address: {
          cep: "01310100",
          street: "Avenida Paulista",
          number: String(Math.floor(Math.random() * 5000)),
          neighborhood: "Bela Vista",
          city: "São Paulo",
          state: "SP",
        },
        availability: {
          monday: { active: Math.random() > 0.5, start: "08:00", end: "18:00" },
          tuesday: { active: Math.random() > 0.5, start: "08:00", end: "18:00" },
          wednesday: { active: Math.random() > 0.5, start: "08:00", end: "18:00" },
          thursday: { active: Math.random() > 0.5, start: "08:00", end: "18:00" },
          friday: { active: Math.random() > 0.5, start: "08:00", end: "18:00" },
          saturday: { active: Math.random() > 0.5, start: "09:00", end: "14:00" },
          sunday: { active: false },
        },
      },
    });
  }

  // Clear existing assistants
  await db.assistant.deleteMany({
    where: { professionalId: professional.id },
  });

  // Create 10 assistants
  const assistantData = [
    { name: "Dr. Carlos Mendes", email: "carlos.mendes@example.com", profession: "Médico" },
    { name: "Nutri Ana Paula", email: "ana.paula@example.com", profession: "Nutricionista" },
    { name: "Physio João", email: "joao.physio@example.com", profession: "Fisioterapeuta" },
    { name: "Personal Marcos", email: "marcos@example.com", profession: "Educador Físico" },
    { name: "Estagiária Sofia", email: "sofia@example.com", profession: "Estagiário" },
    { name: "Dra. Fernanda Lima", email: "fernanda.lima@example.com", profession: "Médico" },
    { name: "Nutri Roberto", email: "roberto@example.com", profession: "Nutricionista" },
    { name: "Coach Patricia", email: "patricia.coach@example.com", profession: "Educador Físico" },
    { name: "Physio Lucas", email: "lucas.physio@example.com", profession: "Fisioterapeuta" },
    { name: "Assistente Pedro", email: "pedro.assist@example.com", profession: "Outro" },
  ];

  for (const asst of assistantData) {
    await db.assistant.create({
      data: {
        name: asst.name,
        email: asst.email,
        phone: `11 9${Math.floor(Math.random() * 90000000) + 10000000}`,
        profession: asst.profession,
        status: "ACTIVE",
        professionalId: professional.id,
      },
    });
  }

  console.log("✅ Seed concluído!");
  console.log("   Admin Email: admin@fitnesssystem.app");
  console.log("   Admin Senha: Admin@2026!");
  console.log("   ✓ 10 clients created (4 minors, 6 adults)");
  console.log("   ✓ 10 assistants created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
