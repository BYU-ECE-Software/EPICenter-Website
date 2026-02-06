// types/purchase.ts

import type { User } from "@/types/user";
import type { Item } from "@/types/item";
import type { PurchasingGroup } from "@/types/purchasingGroup";

export type Purchase = {
  id: number;
  userId: number;
  itemId: number;
  purchasingGroupId: number | null;

  quantity: number;
  totalCents: number;

  createdAt: string;

  // Relations
  user: User;
  item: Item;
  purchasingGroup: PurchasingGroup | null;
};

export type PurchasePayload = {
  userId?: number;
  itemId?: number;
  purchasingGroupId?: number | null;

  quantity?: number;
  totalCents?: number;
};
