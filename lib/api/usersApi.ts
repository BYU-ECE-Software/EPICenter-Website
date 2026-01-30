import type { User } from "@/types/user";

// --------Get Users --------
export async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/users", {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to fetch users");
  }

  return res.json();
}
