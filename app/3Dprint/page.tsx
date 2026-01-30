"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/app/providers/RoleProvider";
import ProjectWorkflow from "@/components/ProjectWorkflow";
import type { DataTableColumn } from "@/components/DataTable";

export default function PrintPage() {
  const { isEmployee } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isEmployee) {
      router.replace("/projectRequests");
    }
  }, [isEmployee, router]);

  const printColumns = useMemo<DataTableColumn[]>(
    () => [{ key: "quantity", header: "Quantity" }],
    [],
  );

  // dummy data with one row for each stage
  const data = [
    {
      id: 1,
      projectType: "PRINT3D",
      status: "UNFULFILLED",
      assignedTo: null,
      quantity: 2,
      customerName: "Sam Student",
      customerEmail: "sam@byu.edu",
      requestedAt: "2026-01-25",
      updatedAt: "2026-01-25",
      comments: "Please prioritize if possible.",
      projectFileName: "pcb_design_v3.gbr",
    },
    {
      id: 2,
      projectType: "PRINT3D",
      status: "ASSIGNED",
      assignedTo: "Lara",
      quantity: 1,
      color: "Black",
      customerName: "Taylor Tech",
      customerEmail: "taylor@byu.edu",
      requestedAt: "2026-01-24",
      updatedAt: "2026-01-26",
      comments: "Please prioritize if possible.",
      projectFileName: "pcb_design_v3.gbr",
    },
    {
      id: 3,
      projectType: "PRINT3D",
      status: "IN_PROGRESS",
      assignedTo: "M. Alvarez",
      quantity: 3,
      customerName: "Jamie Jay",
      customerEmail: "jamie@byu.edu",
      requestedAt: "2026-01-23",
      updatedAt: "2026-01-26",
      projectFileName: "pcb_design_v3.gbr",
      comments: "Please prioritize if possible.",
    },
    {
      id: 4,
      status: "READY_FOR_PICKUP",
      projectType: "PRINT3D",
      assignedTo: "Dr. Jensen",
      quantity: 1,
      customerName: "Avery A.",
      customerEmail: "avery@byu.edu",
      requestedAt: "2026-01-21",
      updatedAt: "2026-01-26",
      projectFileName: "pcb_design_v3.gbr",
      comments: "Please prioritize if possible.",
    },
    {
      id: 5,
      status: "FINISHED",
      projectType: "PRINT3D",
      assignedTo: "S. Kim",
      quantity: 2,
      customerName: "Chris C.",
      customerEmail: "chris@byu.edu",
      requestedAt: "2026-01-20",
      updatedAt: "2026-01-22",
      projectFileName: "pcb_design_v3.gbr",
      comments: "Please prioritize if possible.",
    },
    {
      id: 6,
      status: "CANCELED",
      projectType: "PRINT3D",
      assignedTo: "Lara",
      quantity: 1,
      customerName: "Pat P.",
      customerEmail: "pat@byu.edu",
      requestedAt: "2026-01-19",
      updatedAt: "2026-01-19",
      projectFileName: "pcb_design_v3.gbr",
      comments: "Please prioritize if possible.",
    },
  ];
  return (
    <main className="min-h-[calc(100vh-8rem)] bg-white px-12 py-8">
      <h1 className="text-3xl font-bold text-byu-navy">3D Print Requests</h1>

      {/* Workflow Component */}
      <ProjectWorkflow columns={printColumns} data={data} />
    </main>
  );
}
