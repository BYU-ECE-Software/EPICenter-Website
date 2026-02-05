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
  refundCents: number;
  setRefundCents: (cents: number) => void;
  clearRefund: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "epicenter_cart_v1";

// Persisted shape of a cart
type PersistedCart = {
  items: CartItem[];
  refundCents: number;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [refundCents, _setRefundCents] = useState<number>(0);

  // Load cart once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CartItem[];
      if (parsed && typeof parsed === "object") {
        const maybe = parsed as Partial<PersistedCart>;
        if (Array.isArray(maybe.items)) setItems(maybe.items as CartItem[]);
        if (typeof maybe.refundCents === "number")
          _setRefundCents(maybe.refundCents);
      }
    } catch {
      // ignore bad localStorage
    }
  }, []);

  // Persist whenever cart changes
  useEffect(() => {
    try {
      const payload: PersistedCart = { items, refundCents };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }, [items, refundCents]);

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

  const clearCart = () => {
    setItems([]);
    _setRefundCents(0);
  };

  const setRefundCents = (cents: number) => {
    const safe = Math.max(0, Math.floor(cents || 0));
    _setRefundCents(safe);
  };

  const clearRefund = () => _setRefundCents(0);

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
    refundCents,
    setRefundCents,
    clearRefund,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
