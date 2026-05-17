import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const provider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ?? "payphone";

  return NextResponse.json({
    ok: true,
    provider,
    received: payload,
    checkoutUrl: null,
    message: "Placeholder endpoint. Add PayPhone, Kushki or Stripe SDK calls here."
  });
}
