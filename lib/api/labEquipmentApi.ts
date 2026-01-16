import type { Equipment, EquipmentPayload } from "@/types/equipment";

// --------Create Equipment --------
export async function createLabEquipment(payload: EquipmentPayload) {
  const res = await fetch("/api/equipment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create equipment");
  }

  return res.json();
}

// --------Get Equipment --------
export async function fetchLabEquipment(): Promise<Equipment[]> {
  const res = await fetch("/api/equipment", { method: "GET" });
  if (!res.ok)
    throw new Error((await res.text()) || "Failed to fetch equipment");
  return res.json();
}

// --------Update Equipment --------
export async function updateLabEquipment(
  id: number,
  payload: EquipmentPayload
) {
  const res = await fetch(`/api/equipment/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok)
    throw new Error((await res.text()) || "Failed to update equipment");
  return res.json();
}

// --------Delete Equipment --------
export async function deleteLabEquipment(id: number) {
  const res = await fetch(`/api/equipment/${id}`, { method: "DELETE" });
  if (!res.ok)
    throw new Error((await res.text()) || "Failed to delete equipment");
  return res.json();
}
