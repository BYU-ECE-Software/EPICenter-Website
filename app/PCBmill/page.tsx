"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/app/providers/RoleProvider";
import ProjectWorkflow from "@/components/ProjectWorkflow";
import type { DataTableColumn } from "@/components/DataTable";

export default function PCBMillPage() {
  const { isEmployee } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isEmployee) {
      router.replace("/projectRequests");
    }
  }, [isEmployee, router]);

  const printColumns = useMemo<DataTableColumn[]>(
    () => [
      { key: "quantity", header: "Quantity" },
      { key: "siding", header: "Board Sides" },
      {
        key: "features",
        header: "Features",
        render: (row: any) => {
          const features: string[] = [];

          if (row.silkscreen) features.push("Silkscreen");
          if (row.rubout) features.push("Rubout");

          return features.length ? features.join(", ") : "None";
        },
      },
    ],
    [],
  );

  // dummy data with one row for each stage
  const data = [
    {
      id: 1,
      status: "UNFULFILLED",
      assignedTo: null,
      quantity: 2,
      siding: "Single",
      silkscreen: true,
      rubout: true,
      customerName: "Sam Student",
      customerEmail: "sam@byu.edu",
      requestedAt: "2026-01-25",
      updatedAt: "2026-01-25",
    },
    {
      id: 2,
      projectType: "PCB",
      status: "ASSIGNED",
      assignedTo: "Lara",
      quantity: 1,
      boardArea: 12.5,
      siding: "Single",
      silkscreen: false,
      rubout: true,
      customerName: "Taylor Tech",
      customerEmail: "taylor@byu.edu",
      requestedAt: "2026-01-24",
      updatedAt: "2026-01-26",
      comments: "Please prioritize if possible.",
      projectFileName: "pcb_design_v3.gbr",
    },
    {
      id: 3,
      projectType: "PCB",
      status: "IN_PROGRESS",
      assignedTo: "M. Alvarez",
      quantity: 3,
      siding: "Single",
      silkscreen: true,
      rubout: false,
      customerName: "Jamie Jay",
      customerEmail: "jamie@byu.edu",
      requestedAt: "2026-01-23",
      updatedAt: "2026-01-26",
    },
    {
      id: 4,
      status: "READY_FOR_PICKUP",
      assignedTo: "Dr. Jensen",
      quantity: 1,
      siding: "Double",
      silkscreen: false,
      rubout: false,
      customerName: "Avery A.",
      customerEmail: "avery@byu.edu",
      requestedAt: "2026-01-21",
      updatedAt: "2026-01-26",
    },
    {
      id: 5,
      status: "FINISHED",
      assignedTo: "S. Kim",
      quantity: 2,
      siding: "Single",
      silkscreen: false,
      rubout: false,
      customerName: "Chris C.",
      customerEmail: "chris@byu.edu",
      requestedAt: "2026-01-20",
      updatedAt: "2026-01-22",
    },
    {
      id: 6,
      status: "CANCELED",
      assignedTo: "Lara",
      quantity: 1,
      siding: "Single",
      silkscreen: true,
      rubout: false,
      customerName: "Pat P.",
      customerEmail: "pat@byu.edu",
      requestedAt: "2026-01-19",
      updatedAt: "2026-01-19",
    },
  ];
  return (
    <main className="min-h-[calc(100vh-8rem)] bg-white px-12 py-8">
      <h1 className="text-3xl font-bold text-byu-navy">PCB Mill Requests</h1>

      {/* Workflow Component */}
      <ProjectWorkflow columns={printColumns} data={data} />
    </main>
  );
}
