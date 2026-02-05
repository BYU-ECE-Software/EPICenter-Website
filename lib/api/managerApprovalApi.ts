// lib/api/managerApprovalApi.ts

export async function verifyManagerApproval(pin: string): Promise<void> {
  const res = await fetch("/api/manager-approval", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });

  const data = await res.json().catch(() => ({}) as any);

  // Keep error handling consistent with your other helpers
  if (!res.ok || !data?.ok) {
    throw new Error(data?.message || "Manager approval failed.");
  }
}
