"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  }

  return (
    <button
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-semibold"
      onClick={handleLogout}
      type="button"
    >
      <LogOut size={16} aria-hidden="true" /> Salir
    </button>
  );
}
