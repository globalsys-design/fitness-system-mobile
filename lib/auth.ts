import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { db } from "@/lib/db";
import { Plan } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    ...(process.env.AUTH_RESEND_KEY
      ? [Resend({
          apiKey: process.env.AUTH_RESEND_KEY,
          from: "Fitness System <noreply@fitnesssystem.app>",
        })]
      : []),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { plan: true, trialEndsAt: true, stripeCurrentPeriodEnd: true, role: true },
        });
        if (dbUser) {
          (session.user as any).plan = dbUser.plan;
          (session.user as any).trialEndsAt = dbUser.trialEndsAt;
          (session.user as any).role = dbUser.role;
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: {
          plan: Plan.TRIAL,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
  },
});
