import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { Plan } from "@prisma/client";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) break;

      await db.user.update({
        where: { id: userId },
        data: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          plan: Plan.PRO,
        },
      });
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as any;
      const subscriptionId =
        invoice.parent?.subscription_details?.subscription ?? invoice.subscription;
      if (!subscriptionId) break;

      const user = await db.user.findFirst({
        where: { stripeSubscriptionId: subscriptionId as string },
      });
      if (!user) break;

      const periodEnd = invoice.period_end
        ? new Date(invoice.period_end * 1000)
        : null;

      await db.user.update({
        where: { id: user.id },
        data: {
          plan: Plan.PRO,
          stripeCurrentPeriodEnd: periodEnd,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await db.user.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (!user) break;

      await db.user.update({
        where: { id: user.id },
        data: {
          plan: Plan.FREE,
          stripeSubscriptionId: null,
          stripeCurrentPeriodEnd: null,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
