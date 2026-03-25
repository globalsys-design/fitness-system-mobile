import { Plan, UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      plan?: Plan;
      trialEndsAt?: Date | null;
      role?: UserRole;
    };
  }
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
