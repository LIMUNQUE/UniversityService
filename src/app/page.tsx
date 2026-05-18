import {
  ArrowRight,
  BookOpen,
  CreditCard,
  Mail,
  Menu,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { activity, courses, modules, roles } from "@/lib/modules";

export default function Home() {
  return (
    <main>
      <header className="shell flex items-center justify-between py-5">
        <a className="flex items-center gap-3" href="#inicio" aria-label="Inicio">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--primary)] text-white">
            <BookOpen size={20} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Portal
            </span>
            <span className="block text-lg font-bold">Academico</span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--muted)] md:flex">
          <a href="#modulos">Modulos</a>
          <a href="#aula">Aula</a>
          <a href="#pagos">Pagos</a>
          <a href="#contacto">Contacto</a>
          <Link href="/programs">Catalogo</Link>
          <Link href="/login">Acceso</Link>
        </nav>
        <button className="icon-button md:hidden" aria-label="Abrir menu">
          <Menu size={20} aria-hidden="true" />
        </button>
      </header>

      <section id="inicio" className="shell grid gap-8 pb-12 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Portal academico esencial
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Plataforma base para estudiantes, docentes, aula virtual y pagos.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">
            Contenido placeholder para iniciar el proyecto segun la proforma:
            autenticacion con Supabase, Moodle integrado y pagos con proveedor configurable.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-3 font-semibold text-white"
              href="#modulos"
            >
              Ver modulos <ArrowRight size={18} aria-hidden="true" />
            </a>
            <Link
              className="inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-white px-5 py-3 font-semibold"
              href="/register"
            >
              Crear cuenta
            </Link>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-[var(--line)] bg-[#17352f] p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/60">Dashboard</p>
                <h2 className="mt-1 text-xl font-semibold">Vista placeholder</h2>
              </div>
              <ShieldCheck size={24} aria-hidden="true" />
            </div>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <article key={role.name} className="rounded-lg border border-[var(--line)] bg-white p-4">
                  <Icon size={22} className="text-[var(--primary)]" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold">{role.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{role.description}</p>
                </article>
              );
            })}
          </div>
          <div className="grid gap-3 border-t border-[var(--line)] bg-[#f3f6f0] p-4">
            {activity.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-center gap-3 rounded-lg bg-white p-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e7f1ec] text-[var(--primary)]">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-[var(--muted)]">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="modulos" className="border-y border-[var(--line)] bg-white/68 py-14">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Fase 1
            </p>
            <h2 className="mt-3 text-3xl font-bold">Arquitectura inicial por modulos</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <article key={module.title} className="card interactive-card p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#e7f1ec] text-[var(--primary)]">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                      {module.status}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{module.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{module.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="aula" className="shell grid gap-8 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Moodle
          </p>
          <h2 className="mt-3 text-3xl font-bold">Aula virtual preparada para integracion</h2>
          <p className="mt-4 leading-7 text-[var(--muted)]">
            La proforma recomienda Moodle Open Source para evitar desarrollar un LMS desde cero.
            Esta seccion funciona como puerta de entrada mientras se define la instancia real.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {courses.map((course) => (
            <article key={course.code} className="card interactive-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold)]">
                {course.code}
              </p>
              <h3 className="mt-3 min-h-14 text-lg font-semibold">{course.name}</h3>
              <p className="mt-5 text-sm text-[var(--muted)]">{course.mode}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{course.date}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pagos" className="bg-[#17352f] py-14 text-white">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
              Pagos
            </p>
            <h2 className="mt-3 text-3xl font-bold">Proveedor configurable desde variables de entorno</h2>
            <p className="mt-4 leading-7 text-white/72">
              El starter deja listo el punto de decision para PayPhone, Kushki o Stripe,
              con historial y comprobantes como alcance de la primera version.
            </p>
          </div>
          <div className="rounded-lg border border-white/14 bg-white/8 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Saldo placeholder</p>
                <p className="mt-2 text-4xl font-bold">$0.00</p>
              </div>
              <CreditCard size={32} aria-hidden="true" />
            </div>
            <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-semibold text-[#17352f]">
              Continuar pago <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section id="contacto" className="shell grid gap-8 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Contacto
          </p>
          <h2 className="mt-3 text-3xl font-bold">Formulario placeholder</h2>
          <p className="mt-4 leading-7 text-[var(--muted)]">
            Esta pieza queda lista para conectarse a Supabase, Resend o SendGrid cuando
            se definan campos finales y destinatarios.
          </p>
        </div>
        <form className="card grid gap-4 p-5">
          <label>
            <span className="mb-2 block text-sm font-semibold">Nombre</span>
            <input className="field" placeholder="Nombre placeholder" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">Correo</span>
            <input className="field" type="email" placeholder="correo@placeholder.com" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">Mensaje</span>
            <textarea className="field min-h-32 resize-y" placeholder="Mensaje placeholder" />
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-3 font-semibold text-white">
            <Mail size={18} aria-hidden="true" /> Enviar
          </button>
        </form>
      </section>
    </main>
  );
}
