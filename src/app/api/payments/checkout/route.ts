import { NextResponse } from "next/server";
import { sendPurchaseEmail } from "@/lib/email/purchase-email";
import { syncEnrollmentToMoodle, syncUserToMoodle } from "@/lib/moodle/sync";
import { createClient } from "@/lib/supabase/server";

type CheckoutPayload = {
  programIds?: string[];
  provider?: string;
};

type Program = {
  code: string;
  id: string;
  moodle_course_id: number | null;
  price_cents: number;
  title: string;
};

type Profile = {
  full_name: string | null;
  moodle_user_id: number | null;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as CheckoutPayload | null;
  const provider = payload?.provider ?? process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ?? "mock-payphone";
  const programIds = [...new Set(payload?.programIds ?? [])].filter(Boolean);

  if (programIds.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        message: "El carrito esta vacio."
      },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "Debes iniciar sesion para completar la compra."
      },
      { status: 401 }
    );
  }

  const { data: programs, error: programError } = await supabase
    .from("programs")
    .select("id, code, title, price_cents, moodle_course_id")
    .in("id", programIds);

  if (programError) {
    return NextResponse.json(
      {
        ok: false,
        message: programError.message
      },
      { status: 400 }
    );
  }

  const programList = (programs as Program[] | null) ?? [];
  const validProgramIds = programList.map((program) => program.id);

  if (validProgramIds.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        message: "No se encontraron cursos validos para comprar."
      },
      { status: 400 }
    );
  }

  const totalCents = programList.reduce((sum, program) => sum + program.price_cents, 0);
  const externalId = `mock_${provider}_${Date.now()}`;

  const { error: paymentError } = await supabase.from("payments").insert({
    amount_cents: totalCents,
    currency: "USD",
    external_id: externalId,
    profile_id: user.id,
    provider,
    status: "paid"
  });

  if (paymentError) {
    return NextResponse.json(
      {
        ok: false,
        message: paymentError.message
      },
      { status: 400 }
    );
  }

  const { data: existingEnrollments, error: existingError } = await supabase
    .from("enrollments")
    .select("program_id")
    .eq("profile_id", user.id)
    .in("program_id", validProgramIds);

  if (existingError) {
    return NextResponse.json(
      {
        ok: false,
        message: existingError.message
      },
      { status: 400 }
    );
  }

  const existingIds = new Set(
    ((existingEnrollments as { program_id: string }[] | null) ?? []).map((item) => item.program_id)
  );
  const newProgramIds = validProgramIds.filter((programId) => !existingIds.has(programId));
  const enrollments = newProgramIds.map((programId) => ({
    profile_id: user.id,
    program_id: programId
  }));
  let insertedEnrollments: { id: string; program_id: string }[] = [];

  if (enrollments.length > 0) {
    const { data: inserted, error: enrollmentError } = await supabase
      .from("enrollments")
      .insert(enrollments)
      .select("id, program_id");

    if (enrollmentError) {
      return NextResponse.json(
        {
          ok: false,
          message: enrollmentError.message
        },
        { status: 400 }
      );
    }

    insertedEnrollments = (inserted as { id: string; program_id: string }[] | null) ?? [];
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, moodle_user_id")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  let moodleMessage = "No habia matriculas nuevas para sincronizar con Moodle.";

  if (insertedEnrollments.length > 0) {
    try {
      const moodleUserId = await syncUserToMoodle({
        profile,
        supabase,
        user
      });

      await Promise.all(
        insertedEnrollments.map((enrollment) => {
          const program = programList.find((item) => item.id === enrollment.program_id);
          return syncEnrollmentToMoodle({
            enrollmentId: enrollment.id,
            moodleCourseId: program?.moodle_course_id ?? null,
            moodleUserId,
            supabase
          });
        })
      );

      moodleMessage = "Sincronizacion Moodle intentada para las matriculas nuevas.";
    } catch (error) {
      moodleMessage = error instanceof Error ? error.message : "No se pudo sincronizar Moodle.";

      await Promise.all(
        insertedEnrollments.map((enrollment) =>
          supabase
            .from("enrollments")
            .update({
              moodle_sync_error: moodleMessage
            })
            .eq("id", enrollment.id)
        )
      );
    }
  }

  const emailResult = user.email
    ? await sendPurchaseEmail({
        email: user.email,
        externalId,
        programs: programList.map((program) => ({
          code: program.code,
          price_cents: program.price_cents,
          title: program.title
        })),
        provider,
        totalCents
      })
    : {
        message: "El usuario no tiene correo asociado.",
        sent: false
      };

  return NextResponse.json({
    ok: true,
    emailMessage: emailResult.message,
    emailSent: emailResult.sent,
    provider,
    enrollmentCount: newProgramIds.length,
    externalId,
    moodleMessage,
    message: "Compra simulada completada. Los cursos ya estan inscritos."
  });
}
