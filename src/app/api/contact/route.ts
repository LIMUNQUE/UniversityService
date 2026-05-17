import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  return NextResponse.json({
    ok: true,
    provider: "resend-or-sendgrid",
    received: payload,
    message: "Placeholder endpoint. Wire this to Resend or SendGrid in the next phase."
  });
}
