import type { Loan, LoanStatus } from "@/types/loan";

// --------Get Loans --------
export async function fetchLoans(params?: {
  userId?: number;
  status?: LoanStatus;
}): Promise<Loan[]> {
  const qs = new URLSearchParams();

  if (params?.userId !== undefined) qs.set("userId", String(params.userId));
  if (params?.status) qs.set("status", params.status);

  const url = `/api/loans${qs.toString() ? `?${qs.toString()}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    // keeps dev from showing stale results
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to fetch loans");
  }

  return res.json();
}
