import type { User } from "@/types/user";
import type { Equipment } from "@/types/equipment";

export type LoanStatus = "ONGOING" | "RETURNED" | "OVERDUE";

export type Loan = {
  id: number;
  userId: number;
  equipmentId: number;
  loanDate: string;
  returnDate: string | null;
  status: LoanStatus;

  // Relations
  user: User;
  equipment: Equipment;
};

export type LoanPayload = {
  userId?: number;
  equipmentId?: number;
  returnDate?: string | null;
  status?: LoanStatus;
};
