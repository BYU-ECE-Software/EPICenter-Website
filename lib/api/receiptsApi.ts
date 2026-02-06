import type { Purchase } from "@/types/purchase";

// -------- Get Receipts (Purchases) --------
export async function fetchReceipts(params?: {
  userId?: number;
}): Promise<Purchase[]> {
  const qs = new URLSearchParams();

  if (params?.userId !== undefined) {
    qs.set("userId", String(params.userId));
  }

  const url = `/api/purchases${qs.toString() ? `?${qs.toString()}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    // prevent stale data during development
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to fetch receipts");
  }

  return res.json();
}
