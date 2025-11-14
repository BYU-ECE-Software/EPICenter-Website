"use client";

import { useEffect, useState } from "react";

type Check = { name: string; path: string };
const CHECKS: Check[] = [
  { name: "App", path: "/api/health" },
  { name: "Database", path: "/api/health/db" },
];

type Status = "unknown" | "ok" | "down";

export default function HealthPage() {
  const [statuses, setStatuses] = useState<
    Record<string, { status: Status; info?: any }>
  >({});

  const runChecks = async () => {
    const next: Record<string, { status: Status; info?: any }> = {};
    await Promise.all(
      CHECKS.map(async (c) => {
        try {
          const res = await fetch(c.path, { cache: "no-store" });
          next[c.name] = {
            status: res.ok ? "ok" : "down",
            info: await res.json().catch(() => undefined),
          };
        } catch (e) {
          next[c.name] = { status: "down", info: String(e) };
        }
      })
    );
    setStatuses(next);
  };

  useEffect(() => {
    runChecks();
    const ms = Number(process.env.NEXT_PUBLIC_HEALTH_POLL_MS || 0);
    if (ms > 0) {
      const id = setInterval(runChecks, ms);
      return () => clearInterval(id);
    }
  }, []);

  return (
    <main>
      <h1 className="text-3xl font-bold">Service Health</h1>
      <p className="mt-2 text-sm text-gray-600">
        Live status of backend services.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {CHECKS.map((c) => {
          const s = statuses[c.name]?.status ?? "unknown";
          const badge =
            s === "ok"
              ? "bg-green-100 text-green-700"
              : s === "down"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-700";
          const label = s === "ok" ? "OK" : s === "down" ? "DOWN" : "UNKNOWN";
          return (
            <div
              key={c.name}
              className="rounded-2xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{c.name}</div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${badge}`}
                >
                  {label}
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-500">{c.path}</div>
              {statuses[c.name]?.info && (
                <pre className="mt-3 overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-700">
                  {JSON.stringify(statuses[c.name].info, null, 2)}
                </pre>
              )}
              <button
                onClick={runChecks}
                className="mt-4 w-full rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Recheck
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-sm text-gray-600">
        <p>
          Tip: add more checks under <code>/api/health/*</code> and include them
          in <code>CHECKS</code>.
        </p>
        <p>
          Note if you are reading this on localhost then nginx works (at least
          for dev haha)
        </p>
      </div>
    </main>
  );
}
