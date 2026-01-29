"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/app/providers/RoleProvider";
import ProjectWorkflow from "@/components/ProjectWorkflow";

export default function LaserCutPage() {
  const { isEmployee } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isEmployee) {
      router.replace("/projectRequests");
    }
  }, [isEmployee, router]);

  // dummy data with one row for each stage
  const data = [
    {
      id: 1,
      status: "UNFULFILLED",
      assignedTo: null,
      customerName: "Sam Student",
      customerEmail: "sam@byu.edu",
      requestedAt: "2026-01-25",
      updatedAt: "2026-01-25",
    },
    {
      id: 2,
      status: "ASSIGNED",
      projectType: "LASER",
      assignedTo: "Lara",
      customerName: "Taylor Tech",
      customerEmail: "taylor@byu.edu",
      requestedAt: "2026-01-24",
      updatedAt: "2026-01-26",
      projectFileName: "pcb_design_v3.gbr",
    },
    {
      id: 3,
      status: "IN_PROGRESS",
      assignedTo: "M. Alvarez",
      customerName: "Jamie Jay",
      customerEmail: "jamie@byu.edu",
      requestedAt: "2026-01-23",
      updatedAt: "2026-01-26",
    },
    {
      id: 4,
      status: "READY_FOR_PICKUP",
      assignedTo: "Dr. Jensen",
      customerName: "Avery A.",
      customerEmail: "avery@byu.edu",
      requestedAt: "2026-01-21",
      updatedAt: "2026-01-26",
    },
    {
      id: 5,
      status: "FINISHED",
      assignedTo: "S. Kim",
      customerName: "Chris C.",
      customerEmail: "chris@byu.edu",
      requestedAt: "2026-01-20",
      updatedAt: "2026-01-22",
    },
    {
      id: 6,
      status: "CANCELED",
      assignedTo: "Lara",
      customerName: "Pat P.",
      customerEmail: "pat@byu.edu",
      requestedAt: "2026-01-19",
      updatedAt: "2026-01-19",
    },
  ];
  return (
    <main className="min-h-[calc(100vh-8rem)] bg-white px-12 py-8">
      <h1 className="text-3xl font-bold text-byu-navy">Laser Cut Requests</h1>

      {/* Workflow Component */}
      <ProjectWorkflow columns={[]} data={data} />
    </main>
  );
}
