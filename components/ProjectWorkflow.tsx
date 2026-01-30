"use client";

import { useEffect, useMemo, useState } from "react";
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
import FormModal, { FormModalField } from "@/components/FormModal";
import { fetchUsers } from "@/lib/api/usersApi";
import { User } from "@/types/user";
import ConfirmModal from "./ConfirmModal";

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

// 3 types of Project Requests
type ProjectType = "LASER" | "PRINT3D" | "PCB";

// Defines how a single detail field is displayed in the Start Job modal
type DetailRow = {
  label: string;
  value: (row: any) => React.ReactNode;
  showIf?: (row: any) => boolean;
};

// Start Job modal details for each project type
const START_JOB_DETAILS: Record<string, DetailRow[]> = {
  // Laser cut has no project-specific details
  LASER: [],

  // 3D Print details
  PRINT3D: [
    {
      label: "Print Quantity",
      value: (r) => r.quantity ?? "",
    },
    {
      label: "Color",
      value: (r) => r.color ?? "",
    },
  ],

  // PCB Mill details
  PCB: [
    {
      label: "Board Quantity",
      value: (r) => r.quantity ?? "",
    },
    {
      label: "Board Area",
      value: (r) => (r.boardArea ? `${r.boardArea} in²` : ""),
    },
    {
      label: "Siding",
      value: (r) => r.siding ?? "", // "Single" or "Double"
    },
    {
      label: "Details",
      value: (r) => (
        <div className="space-y-0.5">
          <div>{r.silkscreen ? "Silkscreen" : "No Silkscreen"}</div>

          {r.rubout ? "Rubout" : "No Rubout"}
        </div>
      ),
    },
  ],
};

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
  activeStage,
  onEdit,
  onChangeStatus,
  onCancel,
}: {
  row: any;
  activeStage: WorkflowStage;
  onEdit: (row: any) => void;
  onChangeStatus: (row: any) => void;
  onCancel: (row: any) => void;
}) {
  const canCancel = activeStage !== "FINISHED" && activeStage !== "CANCELED";

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
          ...(canCancel
            ? [
                {
                  label: "Cancel Request",
                  icon: <FiXCircle className="h-4 w-4" />,
                  variant: "danger" as const,
                  onClick: () => onCancel(row),
                },
              ]
            : []),
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

  // User-friendly Words to match Backend Project Type
  const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
    LASER: "Laser Cut",
    PRINT3D: "3D Print",
    PCB: "PCB Mill",
  };

  // -------- Assign Job Modal Code --------

  // Assign modal state
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignTargetRow, setAssignTargetRow] = useState<any | null>(null);

  // Form values for the assign modal
  const [assignForm, setAssignForm] = useState({
    technicianUserId: "", // store as string for <select>
  });

  // Users for Assign Job dropdown
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Load technicians when the Assign Job Modal opens
  useEffect(() => {
    if (!assignOpen) return;

    // Only fetch once per session
    if (users.length) return;

    setUsersLoading(true);
    setUsersError(null);

    fetchUsers()
      .then((data) => setUsers(data))
      .catch((e) => setUsersError(e.message ?? "Failed to load users"))
      .finally(() => setUsersLoading(false));
  }, [assignOpen, users.length]);

  // open Assign Job Modal
  const openAssignModal = (row: any) => {
    setAssignTargetRow(row);
    setAssignForm({ technicianUserId: "" });
    setAssignOpen(true);
  };

  // close Assign Job Modal
  const closeAssignModal = () => {
    setAssignOpen(false);
    setAssignTargetRow(null);
  };

  // Disable Submission of the Job Assignment Modal until a technician has been selected
  const isAssignSubmitDisabled =
    assignSaving || usersLoading || !assignForm.technicianUserId;

  // Submit Assign Job Modal
  const submitAssignModal = async () => {
    // Look-only for now
    console.log("assign", {
      row: assignTargetRow,
      technicianUserId: assignForm.technicianUserId,
    });

    // fake save feel
    setAssignSaving(true);
    try {
      // later: call backend to assign
      closeAssignModal();
    } finally {
      setAssignSaving(false);
    }
  };

  // -------- Start Job Modal Code --------

  // state
  const [startOpen, setStartOpen] = useState(false);
  const [startSaving, setStartSaving] = useState(false);
  const [startTargetRow, setStartTargetRow] = useState<any | null>(null);

  const [startForm, setStartForm] = useState({
    notes: "",
  });

  // open Start Job Modal
  const openStartModal = (row: any) => {
    setStartTargetRow(row);
    setStartForm({ notes: "" });
    setStartOpen(true);
  };

  // close Start Job Modal
  const closeStartModal = () => {
    setStartOpen(false);
    setStartTargetRow(null);
  };

  // Submit Start Job Modal
  const submitStartModal = async () => {
    console.log("start job", {
      row: startTargetRow,
      notes: startForm.notes,
    });

    setStartSaving(true);
    try {
      // later: call backend to mark as started
      closeStartModal();
    } finally {
      setStartSaving(false);
    }
  };

  // -------- Complete Job Modal Code --------

  // state
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeSaving, setCompleteSaving] = useState(false);
  const [completeTargetRow, setCompleteTargetRow] = useState<any | null>(null);

  // different fields per project type
  const [completeForm, setCompleteForm] = useState({
    price: "", // LASER
    totalGrams: "", // PRINT3D
    boardArea: "", // PCB
  });

  // open Complete Job Modal
  const openCompleteModal = (row: any) => {
    setCompleteTargetRow(row);
    setCompleteForm({ price: "", totalGrams: "", boardArea: "" });
    setCompleteOpen(true);
  };

  // close Complete Job Modal
  const closeCompleteModal = () => {
    setCompleteOpen(false);
    setCompleteTargetRow(null);
  };

  // Submit Complete Job Modal
  const submitCompleteModal = async () => {
    console.log("complete job", {
      row: completeTargetRow,
      values: completeForm,
    });

    setCompleteSaving(true);
    try {
      // later: call backend to mark as complete
      closeCompleteModal();
    } finally {
      setCompleteSaving(false);
    }
  };

  // Different Fields in the Mark Ready for Pickup (Complete) Modal depending on project type
  const fieldsForCompleteModal = (): FormModalField[] => {
    if (completeTargetRow?.projectType === "PCB") {
      return [
        {
          kind: "input",
          key: "boardArea",
          label: "Board Area",
          type: "number",
          required: true,
          colSpan: 1,
          adornment: { text: "in²", position: "end" },
        },
      ];
    }
    if (completeTargetRow?.projectType === "PRINT3D") {
      return [
        {
          kind: "input",
          key: "totalGrams",
          label: "Total Grams",
          type: "number",
          required: true,
          colSpan: 1,
          adornment: { text: "g", position: "end" },
        },
      ];
    }
    return [
      {
        kind: "input",
        key: "price",
        label: "Price",
        type: "number",
        required: true,
        colSpan: 1,
        adornment: { text: "$", position: "start" },
      },
    ];
  };

  // -------- Change Status Modal Code (FormModal) --------

  // Workflow stages that are allowed for manual status changes
  // (Canceled has its own dedicated workflow and modal)
  type NonCanceledStage = Exclude<WorkflowStage, "CANCELED">;

  // List of selectable workflow stages for the dropdown,
  // excluding "CANCELED"
  const NON_CANCELED_STAGES: { key: NonCanceledStage; label: string }[] =
    WORKFLOW_STAGES.filter((s) => s.key !== "CANCELED") as {
      key: NonCanceledStage;
      label: string;
    }[];

  // Change Status modal state
  const [changeStatusOpen, setChangeStatusOpen] = useState(false);
  const [changeStatusSaving, setChangeStatusSaving] = useState(false);
  const [changeStatusTargetRow, setChangeStatusTargetRow] = useState<
    any | null
  >(null);

  // Form values for the Change Status modal
  const [changeStatusForm, setChangeStatusForm] = useState<{
    status: NonCanceledStage | "";
  }>({ status: "" });

  // Open Change Status modal
  const openChangeStatusModal = (row: any) => {
    setChangeStatusTargetRow(row);

    // Default to the current status if it is not "CANCELED";
    // otherwise require the user to select a new status
    const current = row?.status as WorkflowStage | undefined;
    setChangeStatusForm({
      status:
        current && current !== "CANCELED" ? (current as NonCanceledStage) : "",
    });

    setChangeStatusOpen(true);
  };

  // Close Change Status modal and reset state
  const closeChangeStatusModal = () => {
    setChangeStatusOpen(false);
    setChangeStatusTargetRow(null);
    setChangeStatusForm({ status: "" });
  };

  // Submit Change Status modal (manual override)
  const submitChangeStatusModal = async () => {
    console.log("manual change status", {
      row: changeStatusTargetRow,
      newStatus: changeStatusForm.status,
    });

    setChangeStatusSaving(true);
    try {
      // later: call backend to manually update workflow status
      closeChangeStatusModal();
    } finally {
      setChangeStatusSaving(false);
    }
  };

  // -------- Cancel Project Modal Code --------

  // state
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelSaving, setCancelSaving] = useState(false);
  const [cancelTargetRow, setCancelTargetRow] = useState<any | null>(null);

  const [cancelForm, setCancelForm] = useState({
    cancelReason: "",
  });

  // open Cancel modal
  const openCancelModal = (row: any) => {
    setCancelTargetRow(row);
    setCancelForm({ cancelReason: "" });
    setCancelOpen(true);
  };

  // close Cancel modal
  const closeCancelModal = () => {
    setCancelOpen(false);
    setCancelTargetRow(null);
  };

  // submit cancel (no backend yet)
  const submitCancelModal = async () => {
    console.log("cancel project", {
      row: cancelTargetRow,
      reason: cancelForm.cancelReason,
      // later: email requester
    });

    setCancelSaving(true);
    try {
      // later: call backend to cancel + send email
      closeCancelModal();
    } finally {
      setCancelSaving(false);
    }
  };

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
              onClick={() => openAssignModal(row)}
            />
          );
        }

        if (activeStage === "ASSIGNED") {
          return (
            <StageActionButton
              title="Start Job"
              label="Start Job"
              icon={<FiPlay className="h-4 w-4" />}
              onClick={() => openStartModal(row)}
            />
          );
        }

        if (activeStage === "IN_PROGRESS") {
          return (
            <StageActionButton
              title="Mark Ready for Pickup"
              label="Mark ready for pickup"
              icon={<FiCheckCircle className="h-4 w-4" />}
              onClick={() => openCompleteModal(row)}
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
          activeStage={activeStage}
          onEdit={handleEdit}
          onChangeStatus={openChangeStatusModal}
          onCancel={openCancelModal}
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

      {/* Assign Job Modal */}
      <FormModal
        open={assignOpen}
        onClose={closeAssignModal}
        onSubmit={submitAssignModal}
        title="Assign Job"
        size="sm"
        saving={assignSaving}
        saveLabel="Assign"
        submitDisabled={isAssignSubmitDisabled}
        values={assignForm}
        setValues={setAssignForm}
        fields={[
          {
            kind: "select",
            key: "technicianUserId",
            label: "Technician",
            required: true,
            colSpan: 2,
            placeholder: "Select a technician",
            options: users
              .slice()
              .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
              .map((u) => ({
                value: String(u.id),
                label: u.name ?? u.email,
              })),
          },
        ]}
      />

      {/* Start Job Modal */}
      <ConfirmModal
        open={startOpen}
        title={`Start Job for ${startTargetRow?.customerName ?? "this request"}`}
        message={
          startTargetRow ? (
            <div className="space-y-4 text-sm">
              {/* Email */}
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-500">Email:</span>
                <span className="text-sm font-medium text-byu-navy">
                  {startTargetRow.customerEmail ?? ""}
                </span>
              </div>

              {/* File */}
              <div>
                <div className="text-xs text-gray-500">Project File</div>
                <div className="mt-1 flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                  <div className="min-w-0 truncate font-medium text-byu-navy">
                    {startTargetRow.projectFileName ?? ""}
                  </div>

                  <button
                    type="button"
                    className="shrink-0 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      // TODO: wire up download later
                      console.log("download file", startTargetRow);
                    }}
                    disabled={!startTargetRow.projectFileName}
                    title={
                      startTargetRow.projectFileName
                        ? "Download"
                        : "No file available"
                    }
                  >
                    Download
                  </button>
                </div>
              </div>

              {/* Project-type details */}
              {START_JOB_DETAILS[startTargetRow.projectType as ProjectType]
                ?.length ? (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {START_JOB_DETAILS[
                      startTargetRow.projectType as ProjectType
                    ]
                      .filter((d) =>
                        d.showIf ? d.showIf(startTargetRow) : true,
                      )
                      .map((d) => (
                        <div
                          key={d.label}
                          className="flex items-baseline gap-2"
                        >
                          <span className="text-sm text-gray-500">
                            {d.label}:
                          </span>
                          <span className="text-sm font-medium text-byu-navy">
                            {d.value(startTargetRow) || ""}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : null}

              {/* Comments (optional) */}
              {startTargetRow.comments ? (
                <div>
                  <div className="text-sm font-medium text-byu-navy mb-1">
                    Comments
                  </div>
                  <div className="text-xs text-gray-600 whitespace-pre-wrap">
                    {startTargetRow.comments}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null
        }
        confirmLabel="Start Job"
        cancelLabel="Cancel"
        busy={startSaving}
        busyLabel="Saving…"
        variant="primary"
        closeOnBackdrop={true}
        onCancel={closeStartModal}
        onConfirm={submitStartModal}
      />

      {/* Ready for Pickup/Complete Job Modal */}
      <FormModal
        open={completeOpen}
        onClose={closeCompleteModal}
        onSubmit={submitCompleteModal}
        title={`Mark ${completeTargetRow?.customerName ?? "this request"}'s project as "Ready for Pickup"`}
        size="sm"
        saving={completeSaving}
        saveLabel="Complete"
        submitDisabled={
          completeSaving ||
          (completeTargetRow?.projectType === "PCB" &&
            !completeForm.boardArea) ||
          (completeTargetRow?.projectType === "PRINT3D" &&
            !completeForm.totalGrams) ||
          (completeTargetRow?.projectType === "LASER" && !completeForm.price)
        }
        values={completeForm}
        setValues={setCompleteForm}
        fields={fieldsForCompleteModal()}
      />

      {/* Change Status Modal */}
      <FormModal
        open={changeStatusOpen}
        onClose={closeChangeStatusModal}
        onSubmit={submitChangeStatusModal}
        title={
          changeStatusTargetRow
            ? `Change status for ${changeStatusTargetRow.customerName}'s ${
                PROJECT_TYPE_LABEL[
                  changeStatusTargetRow.projectType as ProjectType
                ] ?? changeStatusTargetRow.projectType
              } Project`
            : "Change status"
        }
        size="sm"
        saving={changeStatusSaving}
        saveLabel="Change Status"
        submitDisabled={changeStatusSaving || !changeStatusForm.status}
        values={changeStatusForm}
        setValues={setChangeStatusForm}
        fields={[
          {
            kind: "custom",
            key: "manualStatusWarning",
            colSpan: 2,
            render: () => (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-yellow-900">
                <div className="text-sm font-semibold">
                  Manual status change
                </div>
                <div className="mt-1 text-xs leading-5 text-yellow-900/90">
                  This will manually update the workflow status and may skip
                  required steps for proper tracking. Use only when needed.
                </div>
              </div>
            ),
          },
          {
            kind: "select",
            key: "status",
            label: "New Status",
            required: true,
            colSpan: 2,
            placeholder: "Select a status",
            options: NON_CANCELED_STAGES.map((s) => ({
              value: s.key,
              label: s.label,
            })),
          },
        ]}
      />

      {/* Cancel Project Modal */}
      <FormModal
        open={cancelOpen}
        onClose={closeCancelModal}
        onSubmit={submitCancelModal}
        title="Cancel Project?"
        size="sm"
        saving={cancelSaving}
        saveLabel="Cancel Project and Email Requester"
        submitDisabled={cancelSaving || !cancelForm.cancelReason.trim()}
        values={cancelForm}
        setValues={setCancelForm}
        fields={[
          {
            kind: "input",
            key: "cancelReason",
            label: cancelTargetRow
              ? `Explain why ${cancelTargetRow.customerName}'s ${
                  PROJECT_TYPE_LABEL[
                    cancelTargetRow.projectType as ProjectType
                  ] ?? cancelTargetRow.projectType
                } project has been canceled`
              : "Explain why this project has been canceled",
            type: "textarea",
            required: true,
            colSpan: 2,
            placeholder: "Explanation will be sent to the requester…",
          },
        ]}
      />
    </section>
  );
}
