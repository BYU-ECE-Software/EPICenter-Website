"use client";

import { useMemo, useState } from "react";
import DataTable, { type DataTableColumn } from "@/components/DataTable";
import {
  FiEdit2,
  FiMoreVertical,
  FiXCircle,
  FiShuffle,
  FiUserPlus,
  FiPlay,
  FiCheckCircle,
  FiShoppingCart,
} from "react-icons/fi";
import RowActionMenu from "./RowActionMenu";
import Pagination from "@/components/Pagination";

type WorkflowStage =
  | "UNFULFILLED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "READY_FOR_PICKUP"
  | "FINISHED"
  | "CANCELED";

const WORKFLOW_STAGES: { key: WorkflowStage; label: string }[] = [
  { key: "UNFULFILLED", label: "Unfulfilled" },
  { key: "ASSIGNED", label: "Assigned" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { key: "FINISHED", label: "Finished" },
  { key: "CANCELED", label: "Canceled" },
];

type ProjectWorkflowProps = {
  columns: DataTableColumn[];
  data: any[];
};

// button to move projects through the workflow
function StageActionButton({
  title,
  icon,
  label,
  onClick,
}: {
  title: string;
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      className="inline-flex items-center gap-2 rounded-lg bg-byu-royal px-2 py-2 text-white text-xs font-medium hover:bg-[#003C9E] transition cursor-pointer"
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// Action dropdown (3 dots) that goes in the last column of the DataTable
function RowActions({
  row,
  onEdit,
  onChangeStatus,
  onCancel,
}: {
  row: any;
  onEdit: (row: any) => void;
  onChangeStatus: (row: any) => void;
  onCancel: (row: any) => void;
}) {
  return (
    <div className="flex items-center justify-end">
      <RowActionMenu
        trigger={<FiMoreVertical className="h-4 w-4" />}
        items={[
          {
            label: "Edit",
            icon: <FiEdit2 className="h-4 w-4" />,
            onClick: () => onEdit(row),
          },
          {
            label: "Change status",
            icon: <FiShuffle className="h-4 w-4" />,
            onClick: () => onChangeStatus(row),
          },
          {
            label: "Cancel Request",
            icon: <FiXCircle className="h-4 w-4" />,
            variant: "danger",
            onClick: () => onCancel(row),
          },
        ]}
      />
    </div>
  );
}

export default function ProjectWorkflow({
  columns,
  data,
}: ProjectWorkflowProps) {
  const [activeStage, setActiveStage] = useState<WorkflowStage>("UNFULFILLED");

  // Pagination state (placeholder for now)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const totalPages = 5; // fake for now

  // filter rows by active tab
  const filteredData = useMemo(
    () => data.filter((r) => r.status === activeStage),
    [data, activeStage],
  );

  // TEMP handlers (buttons visible, no real behavior yet)
  const handleStageAdvance = (row: any) => {
    console.log("advance workflow", row, "stage:", activeStage);
  };

  // TEMP handlers (we’ll replace with real modal openers later)
  const handleEdit = (row: any) => {
    console.log("edit", row, "stage:", activeStage);
  };

  const handleChangeStatus = (row: any) => {
    console.log("change status", row, "stage:", activeStage);
  };

  const handleCancel = (row: any) => {
    console.log("cancel", row, "stage:", activeStage);
  };

  // Left-most workflow action column (only for non-finished/non-canceled)
  const stageActionColumn: DataTableColumn = useMemo(() => {
    return {
      key: "stageAction",
      header: "",
      headerClassName: "w-[1%]",
      cellClassName: "whitespace-nowrap",
      render: (row: any) => {
        if (activeStage === "FINISHED" || activeStage === "CANCELED")
          return null;

        if (activeStage === "UNFULFILLED") {
          return (
            <StageActionButton
              title="Assign Job"
              label="Assign Job"
              icon={<FiUserPlus className="h-4 w-4" />}
              onClick={() => handleStageAdvance(row)}
            />
          );
        }

        if (activeStage === "ASSIGNED") {
          return (
            <StageActionButton
              title="Start Job"
              label="Start Job"
              icon={<FiPlay className="h-4 w-4" />}
              onClick={() => handleStageAdvance(row)}
            />
          );
        }

        if (activeStage === "IN_PROGRESS") {
          return (
            <StageActionButton
              title="Mark Ready for Pickup"
              label="Mark ready for pickup"
              icon={<FiCheckCircle className="h-4 w-4" />}
              onClick={() => handleStageAdvance(row)}
            />
          );
        }

        // READY_FOR_PICKUP
        return (
          <StageActionButton
            title="Add to Cart"
            label="Add to Cart"
            icon={<FiShoppingCart className="h-4 w-4" />}
            onClick={() => handleStageAdvance(row)}
          />
        );
      },
    };
  }, [activeStage]);

  /*Assigned worker name column. Shows on every stage EXCEPT Unfulfilled*/
  const assignedColumn: DataTableColumn | null = useMemo(() => {
    if (activeStage === "UNFULFILLED") return null;

    return {
      key: "assignedTo",
      header: "Assigned",
      render: (row: any) => row.assignedTo ?? "—",
    };
  }, [activeStage]);

  /*Shared columns that appear on all project types (customer name, customer email, date requested, date updated*/
  const sharedTrailingColumns: DataTableColumn[] = useMemo(
    () => [
      { key: "customerName", header: "Customer Name" },
      { key: "customerEmail", header: "Customer Email" },
      { key: "requestedAt", header: "Requested" },
      { key: "updatedAt", header: "Updated" },
    ],
    [],
  );

  // workflow-owned column (always last)
  const actionsColumn: DataTableColumn = useMemo(
    () => ({
      key: "actions",
      header: "",
      headerClassName: "w-[1%]",
      cellClassName: "text-right",
      render: (row: any) => (
        <RowActions
          row={row}
          onEdit={handleEdit}
          onChangeStatus={handleChangeStatus}
          onCancel={handleCancel}
        />
      ),
    }),
    [activeStage],
  );

  // Assemble columns
  const finalColumns = useMemo(() => {
    const cols: DataTableColumn[] = [];
    cols.push(stageActionColumn);
    if (assignedColumn) cols.push(assignedColumn);
    cols.push(...columns);
    cols.push(...sharedTrailingColumns);
    cols.push(actionsColumn);

    return cols;
  }, [
    stageActionColumn,
    assignedColumn,
    columns,
    sharedTrailingColumns,
    actionsColumn,
  ]);

  return (
    <section className="mt-6 space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {WORKFLOW_STAGES.map((stage) => {
          const isActive = activeStage === stage.key;
          return (
            <button
              key={stage.key}
              onClick={() => setActiveStage(stage.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 cursor-pointer transition-colors ${
                isActive
                  ? "border-byu-royal text-byu-royal"
                  : "border-transparent text-gray-500 hover:text-byu-navy"
              }`}
            >
              {stage.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <DataTable data={filteredData} columns={finalColumns} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        itemLabel="Requests"
      />
    </section>
  );
}
