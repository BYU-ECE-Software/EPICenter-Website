"use client";
import { useEffect, useState } from "react";

type User = { id: number; email: string; name?: string | null };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  async function refresh() {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function createUser() {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    if (res.ok) {
      setEmail("");
      setName("");
      refresh();
    }
  }

  async function deleteUser(id: number) {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) refresh();
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="flex gap-2">
        <input
          className="border p-2 flex-1"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 flex-1"
          placeholder="name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="border px-3" onClick={createUser}>
          Create
        </button>
      </div>

      <ul className="space-y-2">
        {users.map((u) => (
          <li
            key={u.id}
            className="border p-3 flex items-center justify-between"
          >
            <span>
              {u.email} {u.name ? `— ${u.name}` : null}
            </span>
            <button className="text-red-600" onClick={() => deleteUser(u.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
