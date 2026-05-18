"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

export type CartItem = {
  id: string;
  code: string;
  title: string;
  priceCents: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  totalCents: number;
  addItem: (item: CartItem) => void;
  clearCart: () => void;
  hasItem: (id: string) => boolean;
  removeItem: (id: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "university-service-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }

    return [];
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      if (current.some((cartItem) => cartItem.id === item.id)) {
        return current;
      }
      return [...current, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0);

    return {
      items,
      count: items.length,
      totalCents,
      addItem,
      clearCart,
      hasItem: (id) => items.some((item) => item.id === id),
      removeItem
    };
  }, [addItem, clearCart, items, removeItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return context;
}
