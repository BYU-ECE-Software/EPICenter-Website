// --------Create Item --------
// Create Item Payload
export type CreateItemPayload = {
  name: string;
  priceCents: number;
  description: string;
  location: string;
  // add photoURL and datasheet later
};

// Create Item API Call
export async function createItem(payload: CreateItemPayload) {
  const res = await fetch("/api/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create item");
  }

  return res.json();
}
