"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

export function CartLink() {
  const { count } = useCart();

  return (
    <Link className="btn-secondary px-3 py-2 text-sm" href="/cart">
      <ShoppingCart size={16} aria-hidden="true" />
      Carrito
      {count > 0 ? (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1 text-xs text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
