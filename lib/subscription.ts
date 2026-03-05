import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY required");
  return new Stripe(key);
}

export const FREE_DAILY_LIMIT = 20;
export const PREMIUM_PRICE_YEARLY = 6000; // $60 in cents

export async function createCheckoutSession(userId: string, email?: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Vinculo Premium",
            description: "Mensajes ilimitados durante 1 año",
          },
          unit_amount: PREMIUM_PRICE_YEARLY,
          recurring: { interval: "year" },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/chat?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
    client_reference_id: userId,
    customer_email: email || undefined,
  });
  return session;
}
