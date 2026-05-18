import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CartPageClient } from "@/components/cart/cart-page-client";
import { createClient } from "@/lib/supabase/server";

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f7f8f4]">
      <header className="border-b border-[var(--line)] bg-white">
        <div className="shell flex items-center justify-between py-4">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)]" href="/programs">
            <ArrowLeft size={16} aria-hidden="true" /> Catalogo
          </Link>
        </div>
      </header>
      <CartPageClient />
    </main>
  );
}
