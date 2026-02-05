export type CartItem = {
  itemId: number;
  name: string;
  description?: string | null;
  priceCents: number;
  photoURL?: string | null;
  qty: number;
};
