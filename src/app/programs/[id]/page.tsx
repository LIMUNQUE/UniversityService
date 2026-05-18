import { ArrowLeft, BookOpen, CalendarClock, ClipboardList, ExternalLink, FileText, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { syncProgramWithMoodle } from "@/app/programs/[id]/actions";
import { ClassroomForms } from "@/components/programs/classroom-forms";
import { getMoodleCourseUrl } from "@/lib/moodle/client";
import { createClient } from "@/lib/supabase/server";

type Program = {
  id: string;
  code: string;
  title: string;
  moodle_course_id: number | null;
  moodle_sync_error: string | null;
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

type Material = {
  id: string;
  title: string;
  description: string | null;
  resource_url: string | null;
  created_at: string;
};

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  created_at: string;
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
      .select("id, code, title, modality, starts_on, teacher_id, moodle_course_id, moodle_sync_error")
      .eq("id", id)
      .maybeSingle<Program>()
  ]);

  if (!program) {
    redirect("/programs");
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("program_id", id)
    .eq("profile_id", user.id)
    .maybeSingle<{ id: string }>();

  const canManage =
    profile?.role === "admin" || (profile?.role === "teacher" && program.teacher_id === user.id);
  const canView = canManage || Boolean(enrollment);

  if (!canView) {
    redirect("/programs");
  }

  const [{ data: enrollments }, { data: materials }, { data: assignments }] = await Promise.all([
    canManage
      ? supabase
          .from("enrollments")
          .select("id, created_at, profiles(full_name, role)")
          .eq("program_id", id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase
      .from("course_materials")
      .select("id, title, description, resource_url, created_at")
      .eq("program_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("assignments")
      .select("id, title, description, due_at, created_at")
      .eq("program_id", id)
      .order("created_at", { ascending: false })
  ]);

  const studentList = ((enrollments as Enrollment[] | null) ?? []).filter(
    (enrollment) => enrollment.profiles?.role === "student"
  );
  const materialList = (materials as Material[] | null) ?? [];
  const assignmentList = (assignments as Assignment[] | null) ?? [];
  const moodleUrl = getMoodleCourseUrl(program.moodle_course_id);

  return (
    <main className="min-h-screen bg-[#f7f8f4]">
      <header className="border-b border-[var(--line)] bg-white">
        <div className="shell flex items-center justify-between py-4">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)]" href="/programs">
            <ArrowLeft size={16} aria-hidden="true" /> Programas
          </Link>
          <span className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold">
            {canManage ? "Docente" : "Estudiante"}
          </span>
        </div>
      </header>

      <section className="shell grid gap-6 py-10">
        <article className="card h-fit p-6">
          <BookOpen size={28} className="text-[var(--primary)]" aria-hidden="true" />
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            {program.code}
          </p>
          <h1 className="mt-3 text-3xl font-bold">{program.title}</h1>
          <div className="mt-5 grid gap-2 text-sm text-[var(--muted)]">
            <p>Modalidad: {program.modality ?? "Por definir"}</p>
            <p>Inicio: {program.starts_on ?? "Por definir"}</p>
            {canManage ? <p>Matriculados: {studentList.length}</p> : null}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {moodleUrl ? (
              <a className="btn-primary" href={moodleUrl} rel="noreferrer" target="_blank">
                Abrir en Moodle <ExternalLink size={18} aria-hidden="true" />
              </a>
            ) : null}
            {canManage ? (
              <form action={syncProgramWithMoodle}>
                <input name="programId" type="hidden" value={program.id} />
                <button className="btn-secondary w-full sm:w-auto">
                  Sincronizar Moodle
                </button>
              </form>
            ) : null}
          </div>
          {program.moodle_sync_error ? (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Moodle: {program.moodle_sync_error}
            </p>
          ) : program.moodle_course_id ? (
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Moodle sincronizado con curso #{program.moodle_course_id}.
            </p>
          ) : (
            <p className="mt-4 rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--muted)]">
              Moodle aun no esta sincronizado para este curso.
            </p>
          )}
        </article>

        {canManage ? <ClassroomForms programId={program.id} /> : null}

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="card p-6">
            <div className="border-b border-[var(--line)] pb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Aula
              </p>
              <h2 className="mt-2 text-2xl font-bold">Materiales</h2>
            </div>

            {materialList.length === 0 ? (
              <EmptyState
                icon="material"
                title="Sin materiales publicados"
                description={canManage ? "Publica el primer recurso del curso." : "El docente aun no ha publicado recursos."}
              />
            ) : (
              <div className="mt-5 grid gap-3">
                {materialList.map((material) => (
                  <article className="interactive-card rounded-lg border border-[var(--line)] bg-white p-4" key={material.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{material.title}</h3>
                        {material.description ? (
                          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{material.description}</p>
                        ) : null}
                      </div>
                      <FileText size={18} className="shrink-0 text-[var(--primary)]" aria-hidden="true" />
                    </div>
                    {material.resource_url ? (
                      <a
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary-dark)] transition hover:text-[var(--accent)]"
                        href={material.resource_url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Abrir recurso <ExternalLink size={15} aria-hidden="true" />
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </article>

          <article className="card p-6">
            <div className="border-b border-[var(--line)] pb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Actividades
              </p>
              <h2 className="mt-2 text-2xl font-bold">Tareas</h2>
            </div>

            {assignmentList.length === 0 ? (
              <EmptyState
                icon="assignment"
                title="Sin tareas asignadas"
                description={canManage ? "Crea la primera actividad evaluable." : "No tienes tareas pendientes en este curso."}
              />
            ) : (
              <div className="mt-5 grid gap-3">
                {assignmentList.map((assignment) => (
                  <article className="interactive-card rounded-lg border border-[var(--line)] bg-white p-4" key={assignment.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{assignment.title}</h3>
                        {assignment.description ? (
                          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{assignment.description}</p>
                        ) : null}
                      </div>
                      <ClipboardList size={18} className="shrink-0 text-[var(--primary)]" aria-hidden="true" />
                    </div>
                    <p className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--muted)]">
                      <CalendarClock size={15} aria-hidden="true" />
                      Entrega: {assignment.due_at ? new Date(assignment.due_at).toLocaleString("es-EC") : "Sin fecha limite"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </article>
        </section>

        {canManage ? (
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
        ) : null}
      </section>
    </main>
  );
}

function EmptyState({
  description,
  icon,
  title
}: {
  description: string;
  icon: "assignment" | "material";
  title: string;
}) {
  const Icon = icon === "assignment" ? ClipboardList : FileText;

  return (
    <div className="py-10 text-center">
      <Icon className="mx-auto text-[var(--primary)]" size={30} aria-hidden="true" />
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
    </div>
  );
}
