"use client";

import { CheckCircle2, ShoppingCart } from "lucide-react";
import { type CartItem, useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/currency";

export function AddToCartButton({ item }: { item: CartItem }) {
  const { addItem, hasItem } = useCart();
  const isInCart = hasItem(item.id);

  return (
    <button
      className={isInCart ? "btn-secondary w-full" : "btn-primary w-full"}
      disabled={isInCart}
      onClick={() => addItem(item)}
      type="button"
    >
      {isInCart ? (
        <>
          <CheckCircle2 size={18} aria-hidden="true" /> En carrito
        </>
      ) : (
        <>
          <ShoppingCart size={18} aria-hidden="true" /> Agregar {formatCurrency(item.priceCents)}
        </>
      )}
    </button>
  );
}
