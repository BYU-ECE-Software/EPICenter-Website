import type {
  PurchasingGroup,
  PurchasingGroupPayload,
} from "@/types/purchaseGroup";

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

// -------- Get Purchasing Groups --------
type PurchaseGroupsResponse = {
  data: PurchasingGroup[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  q: string;
};

export async function fetchPurchasingGroups(): Promise<PurchaseGroupsResponse> {
  const res = await fetch("/api/purchaseGroups", { method: "GET" });
  if (!res.ok)
    throw new Error((await res.text()) || "Failed to fetch purchase groups");

  return res.json();
}

// --------Update Equipment --------
export async function updatePurchasingGroups(
  id: number,
  payload: PurchasingGroupPayload,
) {
  const res = await fetch(`/api/purchaseGroups/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok)
    throw new Error((await res.text()) || "Failed to update purchase group");
  return res.json();
}
