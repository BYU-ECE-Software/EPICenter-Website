"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "@/types/cart";
import type { Item } from "@/types/item";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Item, qty?: number) => void;
  removeItem: (itemId: number) => void;
  setQty: (itemId: number, qty: number) => void;
  clearCart: () => void;
  subtotalCents: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "epicenter_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) setItems(parsed);
    } catch {
      // ignore bad localStorage
    }
  }, []);

  // Persist whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items]);

  const addItem = (item: Item, qty: number = 1) => {
    const safeQty = Number.isInteger(qty) && qty > 0 ? qty : 1;

    setItems((prev) => {
      const existing = prev.find((x) => x.itemId === item.id);
      if (existing) {
        return prev.map((x) =>
          x.itemId === item.id ? { ...x, qty: x.qty + safeQty } : x,
        );
      }

      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name ?? "Item",
          description: item.description ?? null,
          priceCents: item.priceCents ?? 0,
          photoURL: item.photoURL ?? null,
          qty: safeQty,
        },
      ];
    });
  };

  const removeItem = (itemId: number) => {
    setItems((prev) => prev.filter((x) => x.itemId !== itemId));
  };

  const setQty = (itemId: number, qty: number) => {
    const safeQty = Math.max(1, Math.floor(qty || 1));
    setItems((prev) =>
      prev.map((x) => (x.itemId === itemId ? { ...x, qty: safeQty } : x)),
    );
  };

  const clearCart = () => setItems([]);

  const subtotalCents = useMemo(
    () => items.reduce((sum, x) => sum + x.priceCents * x.qty, 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    setQty,
    clearCart,
    subtotalCents,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
