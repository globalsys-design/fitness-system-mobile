import { Plan } from "@prisma/client";

interface UserSubscription {
  plan: Plan;
  trialEndsAt: Date | null;
  stripeCurrentPeriodEnd: Date | null;
}

export function isTrialActive(user: UserSubscription): boolean {
  return (
    user.plan === Plan.TRIAL &&
    user.trialEndsAt !== null &&
    new Date(user.trialEndsAt) > new Date()
  );
}

export function isSubscribed(user: UserSubscription): boolean {
  return (
    user.plan === Plan.PRO &&
    user.stripeCurrentPeriodEnd !== null &&
    new Date(user.stripeCurrentPeriodEnd) > new Date()
  );
}

export function hasAccess(user: UserSubscription): boolean {
  return isTrialActive(user) || isSubscribed(user);
}

export function daysLeftInTrial(user: UserSubscription): number {
  if (!user.trialEndsAt) return 0;
  const diff = new Date(user.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export const PLAN_LIMITS = {
  FREE: {
    assistants: 1,
    clients: 10,
    assessmentsPerClient: 2,
    prescriptions: 5,
    pdfExport: false,
    compareAssessments: false,
    attachments: false,
    calendarFull: false,
    pushNotifications: false,
  },
  TRIAL: {
    assistants: Infinity,
    clients: Infinity,
    assessmentsPerClient: Infinity,
    prescriptions: Infinity,
    pdfExport: true,
    compareAssessments: true,
    attachments: true,
    calendarFull: true,
    pushNotifications: true,
  },
  PRO: {
    assistants: Infinity,
    clients: Infinity,
    assessmentsPerClient: Infinity,
    prescriptions: Infinity,
    pdfExport: true,
    compareAssessments: true,
    attachments: true,
    calendarFull: true,
    pushNotifications: true,
  },
};
