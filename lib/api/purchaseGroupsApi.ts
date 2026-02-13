import type { PurchasingGroupPayload } from "@/types/purchaseGroup";

// -------- Create Purchasing Group --------
export async function createPurchasingGroup(payload: PurchasingGroupPayload) {
  const res = await fetch("/api/purchaseGroups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create purchasing group");
  }

  return res.json();
}
