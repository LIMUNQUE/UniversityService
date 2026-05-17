import { ArrowLeft, BookOpen, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Program = {
  id: string;
  code: string;
  title: string;
  modality: string | null;
  starts_on: string | null;
  teacher_id: string | null;
};

type Enrollment = {
  id: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    role: "student" | "teacher" | "admin";
  } | null;
};

export default async function ProgramDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: program }] = await Promise.all([
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle<{ role: "student" | "teacher" | "admin" }>(),
    supabase
      .from("programs")
      .select("id, code, title, modality, starts_on, teacher_id")
      .eq("id", id)
      .maybeSingle<Program>()
  ]);

  if (!program) {
    redirect("/programs");
  }

  const canManage =
    profile?.role === "admin" || (profile?.role === "teacher" && program.teacher_id === user.id);

  if (!canManage) {
    redirect("/programs");
  }

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, created_at, profiles(full_name, role)")
    .eq("program_id", id)
    .order("created_at", { ascending: false });

  const studentList = ((enrollments as Enrollment[] | null) ?? []).filter(
    (enrollment) => enrollment.profiles?.role === "student"
  );

  return (
    <main className="min-h-screen bg-[#f7f8f4]">
      <header className="border-b border-[var(--line)] bg-white">
        <div className="shell flex items-center justify-between py-4">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)]" href="/programs">
            <ArrowLeft size={16} aria-hidden="true" /> Programas
          </Link>
          <span className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold">
            Docente
          </span>
        </div>
      </header>

      <section className="shell grid gap-6 py-10 lg:grid-cols-[0.85fr_1.15fr]">
        <article className="card h-fit p-6">
          <BookOpen size={28} className="text-[var(--primary)]" aria-hidden="true" />
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            {program.code}
          </p>
          <h1 className="mt-3 text-3xl font-bold">{program.title}</h1>
          <div className="mt-5 grid gap-2 text-sm text-[var(--muted)]">
            <p>Modalidad: {program.modality ?? "Por definir"}</p>
            <p>Inicio: {program.starts_on ?? "Por definir"}</p>
            <p>Matriculados: {studentList.length}</p>
          </div>
        </article>

        <section className="card p-6">
          <div className="border-b border-[var(--line)] pb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Estudiantes
            </p>
            <h2 className="mt-2 text-2xl font-bold">Matriculados</h2>
          </div>

          {studentList.length === 0 ? (
            <div className="py-10 text-center">
              <UserRound className="mx-auto text-[var(--primary)]" size={30} aria-hidden="true" />
              <h3 className="mt-4 font-semibold">Sin estudiantes matriculados</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Cuando un estudiante se matricule, aparecera en esta lista.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {studentList.map((enrollment) => (
                <article
                  className="flex items-center justify-between gap-4 rounded-lg border border-[var(--line)] bg-white p-4"
                  key={enrollment.id}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e7f1ec] text-[var(--primary)]">
                      <UserRound size={18} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-semibold">
                        {enrollment.profiles?.full_name ?? "Estudiante sin nombre"}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        Matriculado: {new Date(enrollment.created_at).toLocaleDateString("es-EC")}
                      </p>
                    </div>
                  </div>
                  <Mail size={18} className="text-[var(--muted)]" aria-hidden="true" />
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
