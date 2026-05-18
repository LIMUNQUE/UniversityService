import { ArrowLeft, BookOpen, CheckCircle2, GraduationCap, UsersRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { leaveProgram } from "@/app/programs/actions";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { CartLink } from "@/components/cart/cart-link";
import { CreateProgramForm } from "@/components/programs/create-program-form";
import { createClient } from "@/lib/supabase/server";

type Program = {
  id: string;
  code: string;
  title: string;
  modality: string | null;
  starts_on: string | null;
  price_cents: number;
  teacher_id: string | null;
};

type Profile = {
  role: "student" | "teacher" | "admin";
};

type Enrollment = {
  program_id: string;
};

export default async function ProgramsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: programs }, { data: enrollments }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<Profile>(),
    supabase.from("programs").select("id, code, title, modality, starts_on, price_cents, teacher_id").order("starts_on"),
    supabase.from("enrollments").select("program_id").eq("profile_id", user.id)
  ]);

  const role = profile?.role ?? "student";
  const enrolledIds = new Set((enrollments as Enrollment[] | null)?.map((item) => item.program_id) ?? []);
  const programList = (programs as Program[] | null) ?? [];

  return (
    <main className="min-h-screen bg-[#f7f8f4]">
      <header className="border-b border-[var(--line)] bg-white">
        <div className="shell flex items-center justify-between py-4">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)]" href="/dashboard">
            <ArrowLeft size={16} aria-hidden="true" /> Dashboard
          </Link>
          <div className="flex items-center gap-2">
            {role === "student" ? <CartLink /> : null}
            <span className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold">
              {role === "teacher" ? "Docente" : "Estudiante"}
            </span>
          </div>
        </div>
      </header>

      <section className="shell py-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Programas
          </p>
          <h1 className="mt-3 text-4xl font-bold">Catalogo academico</h1>
          <p className="mt-4 leading-7 text-[var(--muted)]">
            Esta vista ya consulta Supabase. Los textos siguen como placeholder, pero las
            matriculas se guardan por usuario autenticado.
          </p>
        </div>

        {role === "teacher" || role === "admin" ? (
          <div className="mt-8">
            <CreateProgramForm />
          </div>
        ) : null}

        {programList.length === 0 ? (
          <div className="card mt-8 p-6">
            <BookOpen size={24} className="text-[var(--primary)]" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold">No hay programas disponibles</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Ejecuta el SQL actualizado en Supabase para cargar los programas iniciales.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programList.map((program) => {
              const isEnrolled = enrolledIds.has(program.id);
              const canManage = role === "admin" || (role === "teacher" && program.teacher_id === user.id);
              return (
                <article className="card interactive-card flex min-h-72 flex-col p-5" key={program.id}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#e7f1ec] text-[var(--primary)]">
                      {role === "teacher" ? (
                        <GraduationCap size={20} aria-hidden="true" />
                      ) : (
                        <BookOpen size={20} aria-hidden="true" />
                      )}
                    </span>
                    <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                      {program.code}
                    </span>
                  </div>
                  <h2 className="mt-5 text-xl font-semibold">{program.title}</h2>
                  <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
                    <p>Modalidad: {program.modality ?? "Por definir"}</p>
                    <p>Inicio: {program.starts_on ?? "Por definir"}</p>
                    <p>Inversion: ${(program.price_cents / 100).toFixed(2)}</p>
                  </div>

                  <div className="mt-auto pt-6">
                    {role === "teacher" || role === "admin" ? (
                      <Link
                        aria-disabled={!canManage}
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-white px-4 py-3 font-semibold ${
                          canManage ? "" : "pointer-events-none opacity-55"
                        }`}
                        href={`/programs/${program.id}`}
                      >
                        <UsersRound size={18} aria-hidden="true" /> Ver estudiantes
                      </Link>
                    ) : isEnrolled ? (
                      <div className="grid gap-2">
                        <Link
                          className="btn-primary"
                          href={`/programs/${program.id}`}
                        >
                          <BookOpen size={18} aria-hidden="true" /> Entrar al aula
                        </Link>
                        <form action={leaveProgram}>
                          <input name="programId" type="hidden" value={program.id} />
                          <button className="btn-secondary w-full">
                            <CheckCircle2 size={18} aria-hidden="true" /> Desmatricularme
                          </button>
                        </form>
                      </div>
                    ) : (
                      <AddToCartButton
                        item={{
                          code: program.code,
                          id: program.id,
                          priceCents: program.price_cents,
                          title: program.title
                        }}
                      />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
