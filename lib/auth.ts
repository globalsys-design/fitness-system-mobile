import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Plan } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
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
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("[Auth] Missing email or password");
            return null;
          }

          console.log("[Auth] Attempting login for:", credentials.email);

          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
          }) as any;

          console.log("[Auth] User found:", !!user, "Has hash:", !!user?.passwordHash);

          if (!user?.passwordHash) return null;

          const valid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash!
          );

          console.log("[Auth] Password valid:", valid);

          if (!valid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("[Auth] Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Allow credentials login without adapter interference
      if (account?.provider === "credentials") return true;
      return true;
    },
    async jwt({ token, user }) {
      // On sign-in, persist user data into the token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // Load plan/role once at sign-in so session callback needs no DB query
        const dbUser = await db.user.findUnique({
          where: { id: user.id as string },
          select: { plan: true, trialEndsAt: true, role: true },
        });
        if (dbUser) {
          token.plan = dbUser.plan;
          token.trialEndsAt = dbUser.trialEndsAt?.toISOString() ?? null;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        (session.user as any).plan = token.plan;
        (session.user as any).trialEndsAt = token.trialEndsAt;
        (session.user as any).role = token.role;
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

      if (user.id) {
        await db.professional.create({
          data: {
            userId: user.id,
            name: user.name ?? "Profissional",
            email: user.email ?? "",
          },
        });
      }
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
  },
});
