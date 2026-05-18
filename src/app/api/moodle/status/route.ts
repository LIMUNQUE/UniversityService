import { NextResponse } from "next/server";
import { getMoodleSiteInfo } from "@/lib/moodle/client";

export async function GET() {
  try {
    const site = await getMoodleSiteInfo();

    return NextResponse.json({
      ok: true,
      site
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "No se pudo conectar con Moodle."
      },
      { status: 200 }
    );
  }
}
