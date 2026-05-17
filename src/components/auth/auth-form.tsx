"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, LogIn, Mail, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";
type Role = "student" | "teacher";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    const supabase = createClient();

    if (isRegister) {
      const origin = window.location.origin;
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            full_name: fullName,
            role
          }
        }
      });

      setIsLoading(false);

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setMessage("Registro creado. Revisa tu correo si Supabase pide confirmacion.");
      router.refresh();
      router.push("/dashboard");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.refresh();
    router.push("/dashboard");
  }

  async function handlePasswordReset() {
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Ingresa tu correo para enviar la recuperacion.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/dashboard`
    });
    setIsLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Te enviamos un enlace de recuperacion si el correo existe.");
  }

  return (
    <section className="card w-full max-w-md p-6">
      <Link className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)]" href="/">
        <ArrowLeft size={16} aria-hidden="true" /> Volver
      </Link>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          {isRegister ? "Registro abierto" : "Acceso"}
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          {isRegister ? "Crear cuenta" : "Portal academico"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {isRegister
            ? "Crea una cuenta de estudiante o docente con Supabase Auth."
            : "Ingresa con tu correo y contrasena registrados."}
        </p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        {isRegister ? (
          <label>
            <span className="mb-2 block text-sm font-semibold">Nombre completo</span>
            <input
              className="field"
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Nombre Apellido"
              required
              value={fullName}
            />
          </label>
        ) : null}

        <label>
          <span className="mb-2 block text-sm font-semibold">Correo</span>
          <input
            className="field"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="correo@ejemplo.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Contrasena</span>
          <input
            className="field"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimo 6 caracteres"
            required
            type="password"
            value={password}
          />
        </label>

        {isRegister ? (
          <fieldset className="grid gap-2">
            <legend className="text-sm font-semibold">Rol</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["student", "teacher"] as const).map((option) => (
                <label
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium"
                  key={option}
                >
                  <input
                    checked={role === option}
                    name="role"
                    onChange={() => setRole(option)}
                    type="radio"
                    value={option}
                  />
                  {option === "student" ? "Estudiante" : "Docente"}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {message}
          </p>
        ) : null}

        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : null}
          {isRegister ? <UserPlus size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
          {isRegister ? "Crear cuenta" : "Ingresar"}
        </button>

        {isRegister ? (
          <Link
            className="inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-white px-5 py-3 font-semibold"
            href="/login"
          >
            Ya tengo cuenta
          </Link>
        ) : (
          <>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-white px-5 py-3 font-semibold"
              onClick={handlePasswordReset}
              type="button"
            >
              <Mail size={18} aria-hidden="true" /> Recuperar clave
            </button>
            <a
              className="text-center text-sm font-semibold text-[var(--primary-dark)]"
              href="/register"
            >
              Crear una cuenta nueva
            </a>
          </>
        )}
      </form>
    </section>
  );
}
