"use client";

import { useEffect, useState, useRef } from "react";
import SearchBar from "@/components/SearchBar";
import PrimaryButton from "@/components/PrimaryButton";
import DataTable from "@/components/DataTable";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import RowActionMenu from "@/components/RowActionMenu";
import ConfirmModal from "@/components/ConfirmModal";
import { formatDBStrings } from "@/lib/utils/formatDBStrings";
import { statusToBadgeClasses } from "@/lib/utils/statusBadge";
import Toast, { type ToastType } from "@/components/Toast";
import { useRole } from "../providers/RoleProvider";
import {
  FiClipboard,
  FiEdit2,
  FiMoreVertical,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import {
  createLabEquipment,
  fetchLabEquipment,
  updateLabEquipment,
  deleteLabEquipment,
} from "../../lib/api/labEquipmentApi";
import type { Equipment, EquipmentPayload } from "@/types/equipment";
import { createLoan } from "@/lib/api/loansApi";

// Action Buttons that go in the last column of the data table.
function RowActions({
  row,
  onLoan,
  onEdit,
  onRemove,
}: {
  row: any;
  onLoan: (row: any) => void;
  onEdit: (row: any) => void;
  onRemove: (row: any) => void;
}) {
  const isOnLoan = row.status === "ON_LOAN";

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Loan Button (ONLY when not on loan) */}
      {!isOnLoan && (
        <button
          type="button"
          title="Loan"
          className="inline-flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-xs font-medium transition cursor-pointer border bg-byu-royal text-white border-byu-royal hover:bg-[#003C9E]"
          onClick={() => onLoan(row)}
        >
          <FiClipboard className="h-4 w-4" />
          <span>Loan</span>
        </button>
      )}

      {/* Pop up with additional Edit and Remove options */}
      <RowActionMenu
        trigger={<FiMoreVertical className="h-4 w-4" />}
        items={[
          {
            label: "Edit",
            icon: <FiEdit2 className="h-4 w-4" />,
            onClick: () => onEdit(row),
          },
          {
            label: "Remove",
            icon: <FiTrash2 className="h-4 w-4" />,
            variant: "danger",
            onClick: () => onRemove(row),
          },
        ]}
      />
    </div>
  );
}

export default function LabEquipmentPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // role state
  const { role } = useRole();
  const isEmployee = role === "employee";

  // Equipment from DB
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);

  // Equipment Modal State
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // State for fields in the Equipment Modal
  const [equipmentForm, setEquipmentForm] = useState({
    name: "",
    serialNumber: "",
    location: "",
    status: "AVAILABLE" as Equipment["status"],
  });

  // Two modes for Equipment Modal - create or edit.
  type EquipmentModalMode = "create" | "edit";
  const [equipmentModalMode, setEquipmentModalMode] =
    useState<EquipmentModalMode>("create");
  const [editingRow, setEditingRow] = useState<any>(null);
  const isEdit = equipmentModalMode === "edit";
  const modalTitle = isEdit ? "Edit Lab Equipment" : "Create New Lab Equipment";
  const modalSaveLabel = isEdit ? "Save Changes" : "Create Lab Equipment";

  // Removing Equipment State
  const [removing, setRemoving] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [rowToRemove, setRowToRemove] = useState<any>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const totalPages = 5; // fake for now (until backend pagination exists)

  // Loan modal state
  const [loanOpen, setLoanOpen] = useState(false);
  const [selectedLoanRow, setSelectedLoanRow] = useState<Equipment | null>(
    null,
  );
  const [loanForm, setLoanForm] = useState({
    userId: "",
    dueDate: "",
  });
  const parsedUserId = Number(loanForm.userId);

  const isUserIdValid =
    loanForm.userId.trim().length > 0 &&
    Number.isInteger(parsedUserId) &&
    parsedUserId > 0;

  const isLoanValid = Boolean(loanForm.dueDate) && isUserIdValid;

  // Toast State
  const [toast, setToast] = useState<{
    type: ToastType;
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: ToastType, title: string, message: string) => {
    setToast({ type, title, message });
  };

  // Load equipment once on page load
  useEffect(() => {
    const load = async () => {
      setEquipmentLoading(true);
      try {
        const data = await fetchLabEquipment();
        setEquipment(data);
      } catch (err) {
        console.error("Failed to fetch equipment:", err);
      } finally {
        setEquipmentLoading(false);
      }
    };

    load();
  }, []);

  // Loan Handlers
  const openLoan = (row: any) => {
    setSelectedLoanRow(row);
    setLoanForm({ userId: "", dueDate: "" });
    setLoanOpen(true);
  };

  const closeLoan = () => {
    setLoanOpen(false);
    setSelectedLoanRow(null);
    setLoanForm({ userId: "", dueDate: "" });
  };

  const submitLoan = async () => {
    if (!isLoanValid || !selectedLoanRow?.id) return;

    try {
      const returnDateIso = new Date(
        `${loanForm.dueDate}T00:00:00.000Z`,
      ).toISOString();

      await createLoan({
        userId: parsedUserId,
        equipmentId: selectedLoanRow.id,
        returnDate: returnDateIso,
      });

      const refreshed = await fetchLabEquipment();
      setEquipment(refreshed);

      closeLoan();

      showToast(
        "success",
        "Loan created",
        `"${selectedLoanRow?.name ?? "Equipment"}" was put on loan.`,
      );
    } catch (err) {
      console.error("Create loan failed:", err);
      showToast(
        "error",
        "Loan failed",
        "Could not create the loan. Check the User ID and try again.",
      );
    }
  };

  // Remove handlers
  const openRemoveConfirm = (row: any) => {
    setRowToRemove(row);
    setRemoveOpen(true);
  };

  const closeRemoveConfirm = () => {
    setRemoveOpen(false);
    setRowToRemove(null);
  };

  const confirmRemove = async () => {
    if (!rowToRemove?.id) return;

    setRemoving(true);
    try {
      await deleteLabEquipment(rowToRemove.id);

      const refreshed = await fetchLabEquipment();
      setEquipment(refreshed);

      closeRemoveConfirm();
      showToast(
        "success",
        "Equipment removed",
        `"${rowToRemove.name ?? "Equipment"}" was deleted.`,
      );
    } catch (err) {
      console.error("Delete equipment failed:", err);
      showToast(
        "error",
        "Delete failed",
        "Could not remove the equipment. Try again.",
      );
    } finally {
      setRemoving(false);
    }
  };

  // Columns for the Lab Equipment Table (keep your format + add actions render)
  const columns = [
    { key: "name", header: "Name" },
    { key: "serialNumber", header: "Serial Number" },
    { key: "location", header: "Location" },
    {
      key: "status",
      header: "Status",
      render: (row: any) => (
        <span
          className={[
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
            statusToBadgeClasses(row.status),
          ].join(" ")}
        >
          {formatDBStrings(row.status)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-[1%]",
      cellClassName: "text-right",
      render: (row: any) => {
        if (!isEmployee) return null;

        return (
          <RowActions
            row={row}
            onLoan={openLoan}
            onEdit={openEditEquipment}
            onRemove={openRemoveConfirm}
          />
        );
      },
    },
  ];

  // Reset Fields in the Equipment Form
  const resetEquipmentForm = () => {
    setEquipmentForm({
      name: "",
      serialNumber: "",
      location: "",
      status: "AVAILABLE",
    });
  };

  // Fill Edit Equipment Modal with info from the row
  const fillEquipmentFormFromRow = (row: any) => {
    setEquipmentForm({
      name: row?.name ?? "",
      serialNumber: row?.serialNumber ?? "",
      location: row?.location ?? "",
      status: (row?.status ?? "AVAILABLE") as Equipment["status"],
    });
  };

  // Open Equipment Modal in Create Mode
  const openCreateEquipment = () => {
    setEquipmentModalMode("create");
    setEditingRow(null);
    resetEquipmentForm();
    setEquipmentModalOpen(true);
  };

  // Open Equipment Modal in Edit Mode
  const openEditEquipment = (row: any) => {
    setEquipmentModalMode("edit");
    setEditingRow(row);
    fillEquipmentFormFromRow(row);
    setEquipmentModalOpen(true);
  };

  // Close the Equipment Form Modal
  const handleCloseEquipmentModal = () => {
    resetEquipmentForm();
    setEditingRow(null);
    setEquipmentModalOpen(false);
    setEquipmentModalMode("create");
  };

  // Whether or not the Modal submission button should be disabled
  const isSubmitDisabled =
    !equipmentForm.name.trim() || !equipmentForm.serialNumber.trim();

  // Submission of Create/Edit Equipment Form
  const handleEquipmentModalSubmit = async () => {
    setSaving(true);
    try {
      const payload: EquipmentPayload = {
        name: equipmentForm.name.trim(),
        serialNumber: equipmentForm.serialNumber.trim(),
        location: equipmentForm.location.trim()
          ? equipmentForm.location.trim()
          : null,
        status: equipmentForm.status,
      };

      if (equipmentModalMode === "create") {
        await createLabEquipment(payload);
        const refreshed = await fetchLabEquipment();
        setEquipment(refreshed);

        showToast(
          "success",
          "Equipment created",
          `"${payload.name}" was added.`,
        );
      } else {
        if (!editingRow?.id) throw new Error("No equipment selected to edit");

        await updateLabEquipment(editingRow.id, payload);
        const refreshed = await fetchLabEquipment();
        setEquipment(refreshed);

        showToast(
          "success",
          "Equipment updated",
          `"${payload.name}" was saved.`,
        );
      }

      handleCloseEquipmentModal();
    } catch (err) {
      console.error("Equipment submit failed:", err);
      showToast(
        "error",
        "Save failed",
        "Could not save the equipment. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-white px-12 py-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 w-[min(420px,calc(100vw-2rem))]">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
            duration={4000}
          />
        </div>
      )}

      <h1 className="text-3xl font-bold text-byu-navy">Lab Equipment</h1>

      {/* Search + actions row  */}
      <div className="mt-6 mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: actions (employee) OR empty spacer (student) */}
        <div className="flex items-center">
          {isEmployee ? (
            <PrimaryButton
              label="Create New Equipment"
              icon={<FiPlus className="w-4 h-4" />}
              bgClass="bg-white text-byu-royal"
              hoverBgClass="hover:bg-gray-50"
              className="border border-byu-royal text-sm"
              onClick={openCreateEquipment}
            />
          ) : (
            // spacer keeps layout stable so SearchBar stays on the right
            <div className="h-10" />
          )}
        </div>

        {/* Right: Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search equipment…"
          widthClass="w-full sm:w-80 md:w-96"
        />
      </div>

      <div>
        <DataTable
          data={equipment}
          loading={equipmentLoading}
          columns={columns}
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        itemLabel="Equipment"
      />

      {/* Create/edit Equipment Form Modal */}
      <FormModal
        open={equipmentModalOpen}
        onClose={handleCloseEquipmentModal}
        onSubmit={handleEquipmentModalSubmit}
        title={modalTitle}
        size="lg"
        saving={saving}
        saveLabel={modalSaveLabel}
        submitDisabled={isSubmitDisabled}
        values={equipmentForm}
        setValues={setEquipmentForm}
        fields={[
          {
            key: "name",
            label: "Equipment Name",
            required: true,
          },
          {
            key: "serialNumber",
            label: "Serial Number",
            required: true,
          },
          {
            key: "location",
            label: "Last Seen Location",
          },
          {
            key: "status",
            label: "Status",
            kind: "select",
            options: [
              { label: "Available", value: "AVAILABLE" },
              { label: "On Loan", value: "ON_LOAN" },
              { label: "Maintenance", value: "MAINTENANCE" },
              { label: "Retired", value: "RETIRED" },
            ],
          },
        ]}
      />

      {/* Loan Modal */}
      <FormModal
        open={loanOpen}
        onClose={closeLoan}
        onSubmit={submitLoan}
        title="Loan due date"
        size="sm"
        saving={false}
        saveLabel="Add to Cart"
        submitDisabled={!isLoanValid}
        values={loanForm}
        setValues={setLoanForm}
        errors={{
          userId: !loanForm.userId.trim()
            ? ""
            : !isUserIdValid
              ? "Enter a valid positive integer User ID."
              : "",
        }}
        fields={[
          {
            key: "userId",
            label: "User ID",
            required: true,
            type: "number",
            colSpan: 2,
            placeholder: "Enter loanee user id...",
          },
          {
            key: "dueDate",
            label: "Due date",
            required: true,
            type: "date",
            colSpan: 2,
          },
        ]}
      />

      {/* Confirm Removal */}
      <ConfirmModal
        open={removeOpen}
        title="Remove equipment?"
        message={
          rowToRemove?.name
            ? `Are you sure you want to remove "${rowToRemove.name}"?`
            : "Are you sure you want to remove this equipment?"
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        busy={removing}
        busyLabel="Removing…"
        variant="primary"
        closeOnBackdrop={true}
        onCancel={closeRemoveConfirm}
        onConfirm={confirmRemove}
      />
    </main>
  );
}
