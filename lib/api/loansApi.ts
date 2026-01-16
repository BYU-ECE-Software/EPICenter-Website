import type { Loan, LoanStatus, LoanPayload } from "@/types/loan";

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

// --------Create Loan --------
export async function createLoan(payload: LoanPayload): Promise<Loan> {
  const res = await fetch("/api/loans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create loan");
  }

  return res.json();
}

// --------Update Loan --------
export async function updateLoan(
  id: number,
  payload: LoanPayload
): Promise<Loan> {
  const res = await fetch(`/api/loans/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error((await res.text()) || "Failed to update loan");
  return res.json();
}
