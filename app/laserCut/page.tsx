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
      projectType: "LASER",
      status: "UNFULFILLED",
      assignedTo: null,
      customerName: "Sam Student",
      customerEmail: "sam@byu.edu",
      requestedAt: "2026-01-25",
      updatedAt: "2026-01-25",
      projectFileName: "pcb_design_v3.gbr",
      comments: "Please prioritize if possible.",
    },
    {
      id: 2,
      status: "ASSIGNED",
      projectType: "LASER",
      assignedTo: "Lara",
      technicianUserId: 2,
      customerName: "Taylor Tech",
      customerEmail: "taylor@byu.edu",
      requestedAt: "2026-01-24",
      updatedAt: "2026-01-26",
      projectFileName: "pcb_design_v3.gbr",
      comments: "Please prioritize if possible.",
    },
    {
      id: 3,
      projectType: "LASER",
      status: "IN_PROGRESS",
      assignedTo: "M. Alvarez",
      technicianUserId: 2,
      customerName: "Jamie Jay",
      customerEmail: "jamie@byu.edu",
      requestedAt: "2026-01-23",
      updatedAt: "2026-01-26",
      projectFileName: "pcb_design_v3.gbr",
      comments: "Please prioritize if possible.",
    },
    {
      id: 4,
      projectType: "LASER",
      status: "READY_FOR_PICKUP",
      assignedTo: "Dr. Jensen",
      technicianUserId: 2,
      customerName: "Avery A.",
      customerEmail: "avery@byu.edu",
      requestedAt: "2026-01-21",
      updatedAt: "2026-01-26",
      projectFileName: "pcb_design_v3.gbr",
      comments: "Please prioritize if possible.",
    },
    {
      id: 5,
      projectType: "LASER",
      status: "FINISHED",
      assignedTo: "S. Kim",
      technicianUserId: 2,
      customerName: "Chris C.",
      customerEmail: "chris@byu.edu",
      requestedAt: "2026-01-20",
      updatedAt: "2026-01-22",
      projectFileName: "pcb_design_v3.gbr",
      comments: "Please prioritize if possible.",
    },
    {
      id: 6,
      projectType: "LASER",
      status: "CANCELED",
      assignedTo: "Lara",
      technicianUserId: 2,
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
      <h1 className="text-3xl font-bold text-byu-navy">Laser Cut Requests</h1>

      {/* Workflow Component */}
      <ProjectWorkflow columns={[]} data={data} />
    </main>
  );
}
