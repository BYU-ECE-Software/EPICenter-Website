"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/app/providers/RoleProvider";

export default function PCBMillPage() {
  const { isEmployee } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isEmployee) {
      router.replace("/");
    }
  }, [isEmployee, router]);
  return (
    <main className="min-h-[calc(100vh-8rem)] bg-white px-12 py-8">
      <h1 className="text-3xl font-bold text-byu-navy">PCB Mill Requests</h1>
    </main>
  );
}
