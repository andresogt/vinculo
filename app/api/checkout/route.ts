import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createCheckoutSession } from "@/lib/subscription";

export async function POST() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }
    const cookieStore = await cookies();
    const userId = cookieStore.get("vinculo_user_id")?.value;
    if (!userId) {
      return NextResponse.json(
        { error: "No user session" },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession(userId);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
