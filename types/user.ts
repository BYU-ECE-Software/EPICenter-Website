// types/user.ts
import type { Purchase } from "@/types/purchase";
import type { Loan } from "@/types/loan";

export type User = {
  id: number;
  email: string;
  name: string | null;
  netID: string | null;
  byuID: string | null;

  // Relations
  purchases: Purchase[];
  loans: Loan[];
};
