import { BookOpen, CreditCard, FileText, Plus, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { activity } from "@/lib/modules";
import { createClient } from "@/lib/supabase/server";

type Profile = {
  full_name: string | null;
  role: "student" | "teacher" | "admin";
};

type EnrollmentWithProgram = {
  program_id: string;
  programs: {
    code: string;
    title: string;
    modality: string | null;
    starts_on: string | null;
  } | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("program_id, programs(code, title, modality, starts_on)")
    .eq("profile_id", user.id);

  const displayName = profile?.full_name ?? user.email ?? "Usuario";
  const roleLabel =
    profile?.role === "teacher" ? "Docente" : profile?.role === "admin" ? "Admin" : "Estudiante";
  const enrolledPrograms = ((enrollments as EnrollmentWithProgram[] | null) ?? []).filter(
    (item) => item.programs
  );

  return (
    <main className="min-h-screen bg-[#f7f8f4]">
      <header className="border-b border-[var(--line)] bg-white">
        <div className="shell flex items-center justify-between py-4">
          <Link className="flex items-center gap-3 font-bold" href="/">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--primary)] text-white">
              <BookOpen size={20} aria-hidden="true" />
            </span>
            Portal Academico
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="shell grid gap-6 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="card h-fit p-4">
          <div className="flex items-center gap-3 border-b border-[var(--line)] pb-4">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#e7f1ec] text-[var(--primary)]">
              <UserRound size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="text-sm text-[var(--muted)]">Rol {roleLabel}</p>
            </div>
          </div>
          <nav className="mt-4 grid gap-2 text-sm font-medium text-[var(--muted)]">
            <a className="rounded-lg bg-[#e7f1ec] px-3 py-2 text-[var(--primary-dark)]" href="#resumen">
              Resumen
            </a>
            <Link className="rounded-lg px-3 py-2" href="/programs">
              Cursos
            </Link>
            <a className="rounded-lg px-3 py-2" href="#pagos">
              Pagos
            </a>
          </nav>
        </aside>

        <div className="grid gap-6">
          <section id="resumen" className="grid gap-4 md:grid-cols-3">
            {activity.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="card p-5">
                  <Icon size={22} className="text-[var(--primary)]" aria-hidden="true" />
                  <h2 className="mt-4 font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
                </article>
              );
            })}
          </section>

          <section id="cursos" className="card p-5">
            <div className="flex flex-col justify-between gap-3 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                  {roleLabel === "Docente" ? "Gestion academica" : "Moodle"}
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  {roleLabel === "Docente" ? "Cursos impartidos" : "Cursos inscritos"}
                </h2>
              </div>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--line)] px-4 py-2 font-semibold">
                <FileText size={18} aria-hidden="true" /> Sincronizar
              </button>
            </div>
            {enrolledPrograms.length === 0 ? (
              <div className="mt-5 rounded-lg border border-dashed border-[var(--line)] p-6 text-center">
                <BookOpen className="mx-auto text-[var(--primary)]" size={28} aria-hidden="true" />
                <h3 className="mt-4 font-semibold">
                  {roleLabel === "Docente" ? "Sin cursos asignados" : "Aun no tienes cursos"}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                  {roleLabel === "Docente"
                    ? "La asignacion docente se conectara en la siguiente iteracion."
                    : "Explora el catalogo y matriculate en un programa para verlo aqui."}
                </p>
                <Link
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 font-semibold text-white"
                  href="/programs"
                >
                  <Plus size={18} aria-hidden="true" /> Ver catalogo
                </Link>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {enrolledPrograms.map((enrollment) => (
                  <article key={enrollment.program_id} className="rounded-lg border border-[var(--line)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold)]">
                      {enrollment.programs?.code}
                    </p>
                    <h3 className="mt-3 font-semibold">{enrollment.programs?.title}</h3>
                    <p className="mt-4 text-sm text-[var(--muted)]">
                      {enrollment.programs?.modality ?? "Modalidad por definir"}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Inicio: {enrollment.programs?.starts_on ?? "Por definir"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section id="pagos" className="grid gap-4 md:grid-cols-[1fr_280px]">
            <article className="card p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Historial
              </p>
              <h2 className="mt-2 text-2xl font-bold">Pagos placeholder</h2>
              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between rounded-lg border border-[var(--line)] p-4">
                  <span className="text-sm font-medium">Matricula placeholder</span>
                  <span className="text-sm text-[var(--muted)]">$0.00</span>
                </div>
              </div>
            </article>
            <article className="card bg-[#17352f] p-5 text-white">
              <CreditCard size={24} aria-hidden="true" />
              <p className="mt-5 text-sm text-white/65">Saldo actual</p>
              <p className="mt-2 text-3xl font-bold">$0.00</p>
              <button className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-3 font-semibold text-[#17352f]">
                Pagar
              </button>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
