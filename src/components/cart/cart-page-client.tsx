"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/currency";

type CheckoutResponse = {
  emailMessage?: string;
  emailSent?: boolean;
  enrollmentCount?: number;
  moodleMessage?: string;
  ok: boolean;
  message: string;
  provider?: string;
};

export function CartPageClient() {
  const { clearCart, items, removeItem, totalCents } = useCart();
  const [provider, setProvider] = useState("mock-payphone");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [result, setResult] = useState<CheckoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const programIds = useMemo(() => items.map((item) => item.id), [items]);

  async function handleCheckout() {
    setError(null);
    setResult(null);
    setIsCheckingOut(true);

    const response = await fetch("/api/payments/checkout", {
      body: JSON.stringify({
        programIds,
        provider
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    const payload = (await response.json()) as CheckoutResponse;
    setIsCheckingOut(false);

    if (!response.ok || !payload.ok) {
      setError(payload.message ?? "No se pudo completar la compra.");
      return;
    }

    clearCart();
    setResult(payload);
  }

  if (result) {
    return (
      <section className="shell grid min-h-[70vh] place-items-center py-10">
        <div className="card max-w-xl p-8 text-center">
          <CheckCircle2 className="mx-auto text-[var(--primary)]" size={42} aria-hidden="true" />
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Compra completada
          </p>
          <h1 className="mt-3 text-3xl font-bold">Tus cursos ya estan inscritos</h1>
          <p className="mt-4 leading-7 text-[var(--muted)]">
            Pasarela simulada: {result.provider}. Se registraron {result.enrollmentCount ?? 0} curso(s)
            en tu perfil.
          </p>
          {result.moodleMessage ? (
            <p className="mt-4 rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--muted)]">
              Moodle: {result.moodleMessage}
            </p>
          ) : null}
          {result.emailMessage ? (
            <p
              className={`mt-3 rounded-lg border px-4 py-3 text-sm ${
                result.emailSent
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              Correo: {result.emailMessage}
            </p>
          ) : null}
          <Link className="btn-primary mt-6" href="/dashboard">
            Ver mis cursos <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="shell grid gap-6 py-10 lg:grid-cols-[1fr_360px]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Checkout
        </p>
        <h1 className="mt-3 text-4xl font-bold">Carrito de cursos</h1>

        {items.length === 0 ? (
          <div className="card mt-8 p-8 text-center">
            <ShoppingBag className="mx-auto text-[var(--primary)]" size={36} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold">Tu carrito esta vacio</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Agrega cursos desde el catalogo para probar el flujo de compra.
            </p>
            <Link className="btn-primary mt-6" href="/programs">
              Ver catalogo
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-3">
            {items.map((item) => (
              <article className="interactive-card rounded-lg border border-[var(--line)] bg-white p-4" key={item.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold)]">
                      {item.code}
                    </p>
                    <h2 className="mt-2 font-semibold">{item.title}</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">{formatCurrency(item.priceCents)}</p>
                  </div>
                  <button
                    aria-label={`Quitar ${item.title}`}
                    className="icon-button"
                    onClick={() => removeItem(item.id)}
                    type="button"
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <aside className="card h-fit p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Resumen
        </p>
        <div className="mt-5 grid gap-3 border-b border-[var(--line)] pb-5 text-sm">
          <div className="flex items-center justify-between">
            <span>Cursos</span>
            <span>{items.length}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(totalCents)}</span>
          </div>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold">Pasarela simulada</span>
          <select className="field" onChange={(event) => setProvider(event.target.value)} value={provider}>
            <option value="mock-payphone">PayPhone mock</option>
            <option value="mock-kushki">Kushki mock</option>
            <option value="mock-stripe">Stripe mock</option>
          </select>
        </label>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
          disabled={items.length === 0 || isCheckingOut}
          onClick={handleCheckout}
          type="button"
        >
          {isCheckingOut ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : null}
          Completar compra
        </button>
      </aside>
    </section>
  );
}
