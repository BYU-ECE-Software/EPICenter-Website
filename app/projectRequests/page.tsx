"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/app/providers/RoleProvider";

export default function Page() {
  const { isEmployee } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (isEmployee) {
      router.replace("/3Dprint");
    }
  }, [isEmployee, router]);
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Student Project Requests</h1>
      <p>
        This page will be what students see for their individual project
        requests
      </p>
    </main>
  );
}
