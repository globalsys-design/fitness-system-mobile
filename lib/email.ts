import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: "Fitness System <noreply@fitnesssystem.app>",
    to: email,
    subject: "Bem-vindo ao Fitness System!",
    html: `
      <h1>Olá, ${name}!</h1>
      <p>Seu trial de 14 dias começou. Explore todas as funcionalidades do Fitness System.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/app">Acessar o app</a>
    `,
  });
}
