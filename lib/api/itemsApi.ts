// Item Type
import type { Item, ItemPayload } from "@/types/item";

// -------- Create Item --------
export async function createItem(payload: ItemPayload) {
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

// -------- Fetch Items --------
export async function fetchItems(): Promise<Item[]> {
  const res = await fetch("/api/items", {
    method: "GET",
    // prevents “why isn’t it updating?” issues in dev with caching
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch items");
  }

  return res.json();
}

// -------- Update Item --------
export async function updateItem(id: number, payload: ItemPayload) {
  const res = await fetch(`/api/items/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update item");
  }

  return res.json();
}

// -------- Delete Item --------
export async function deleteItem(id: number) {
  const res = await fetch(`/api/items/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to delete item");
  }

  return res.json();
}

// -------- Upload Item Photo --------
export async function uploadItemPhoto(photo: File): Promise<{ key: string }> {
  const form = new FormData();
  form.append("photo", photo);

  const res = await fetch("/api/minio/item-image", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Image upload failed");
  }

  return res.json();
}
