"use client";

import { useEffect, useState, useRef } from "react";
import SearchBar from "@/components/SearchBar";
import PrimaryButton from "@/components/PrimaryButton";
import DataTable from "@/components/DataTable";
import BaseModal from "@/components/BaseModal";
import Pagination from "@/components/Pagination";
import RowActionMenu from "@/components/RowActionMenu";
import ConfirmModal from "@/components/ConfirmModal";
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
  type Equipment,
  type EquipmentPayload,
} from "../../lib/api/labEquipmentApi";

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
  return (
    <div className="flex items-center justify-end gap-1">
      {/* Loan Button */}
      <button
        type="button"
        title="Loan"
        className="inline-flex items-center gap-2 rounded-lg bg-byu-royal px-2 py-2 text-white text-xs font-medium hover:bg-[#003C9E] transition cursor-pointer"
        onClick={() => onLoan(row)}
      >
        <FiClipboard className="h-4 w-4" />
        <span>Loan</span>
      </button>

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
  const [equipmentName, setEquipmentName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<Equipment["status"]>("AVAILABLE");

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
  const [loanDueDate, setLoanDueDate] = useState("");
  const [selectedLoanRow, setSelectedLoanRow] = useState<Equipment | null>(
    null
  );
  const isLoanValid = Boolean(loanDueDate);

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
    setLoanDueDate("");
    setLoanOpen(true);
  };

  const closeLoan = () => {
    setLoanOpen(false);
    setSelectedLoanRow(null);
    setLoanDueDate("");
  };

  const submitLoan = async () => {
    if (!loanDueDate) return;
    console.log("loan submit", { row: selectedLoanRow, dueDate: loanDueDate });
    closeLoan();

    // toast
    showToast(
      "success",
      "Loan submitted",
      `"${selectedLoanRow?.name ?? "Equipment"}" was put on loan.`
    );
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
        `"${rowToRemove.name ?? "Equipment"}" was deleted.`
      );
    } catch (err) {
      console.error("Delete equipment failed:", err);
      showToast(
        "error",
        "Delete failed",
        "Could not remove the equipment. Try again."
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
    { key: "status", header: "Status" },
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

  // Whether or not the Modal submission button should be disabled
  const isSubmitDisabled = !equipmentName.trim() || !serialNumber.trim();

  // Reset Fields in the Equipment Form
  const resetEquipmentForm = () => {
    setEquipmentName("");
    setSerialNumber("");
    setLocation("");
    setStatus("AVAILABLE");
  };

  // Fill Edit Equipment Modal with info from the row
  const fillEquipmentFormFromRow = (row: any) => {
    setEquipmentName(row?.name ?? "");
    setSerialNumber(row?.serialNumber ?? "");
    setLocation(row?.location ?? "");
    setStatus(row?.status ?? "AVAILABLE");
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

  // Submission of Create/Edit Equipment Form
  const handleEquipmentModalSubmit = async () => {
    setSaving(true);
    try {
      const payload: EquipmentPayload = {
        name: equipmentName.trim(),
        serialNumber: serialNumber.trim(),
        location: location.trim() ? location.trim() : null,
        status,
      };

      if (equipmentModalMode === "create") {
        await createLabEquipment(payload);
        const refreshed = await fetchLabEquipment();
        setEquipment(refreshed);

        showToast(
          "success",
          "Equipment created",
          `"${payload.name}" was added.`
        );
      } else {
        if (!editingRow?.id) throw new Error("No equipment selected to edit");

        await updateLabEquipment(editingRow.id, payload);
        const refreshed = await fetchLabEquipment();
        setEquipment(refreshed);

        showToast(
          "success",
          "Equipment updated",
          `"${payload.name}" was saved.`
        );
      }

      handleCloseEquipmentModal();
    } catch (err) {
      console.error("Equipment submit failed:", err);
      showToast(
        "error",
        "Save failed",
        "Could not save the equipment. Try again."
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

      {/* Search + actions row (keep your styling) */}
      <div className="mt-6 mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Create New Equipment Button */}
        {isEmployee && (
          <PrimaryButton
            label="Create New Equipment"
            icon={<FiPlus className="w-4 h-4" />}
            bgClass="bg-white text-byu-royal"
            hoverBgClass="hover:bg-gray-50"
            className="border border-byu-royal text-sm"
            onClick={openCreateEquipment}
          />
        )}

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
      />

      {/* Create/edit Equipment Form Modal */}
      <BaseModal
        open={equipmentModalOpen}
        onClose={handleCloseEquipmentModal}
        onSubmit={handleEquipmentModalSubmit}
        title={modalTitle}
        size="lg"
        saving={saving}
        saveLabel={modalSaveLabel}
        submitDisabled={isSubmitDisabled}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Equipment Name */}
          <div>
            <label className="block text-sm font-medium text-byu-navy mb-1">
              Equipment Name *
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
              placeholder="Enter equipment name..."
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
            />
          </div>

          {/* Serial Number */}
          <div>
            <label className="block text-sm font-medium text-byu-navy mb-1">
              Serial Number *
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
              placeholder="Enter serial number..."
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-byu-navy mb-1">
              Last Seen Location
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
              placeholder="Enter location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-byu-navy mb-1">
              Status
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
              value={status}
              onChange={(e) => setStatus(e.target.value as Equipment["status"])}
            >
              <option value="AVAILABLE">Available</option>
              <option value="ON_LOAN">On Loan</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
        </div>
      </BaseModal>

      {/* Loan Modal */}
      <BaseModal
        open={loanOpen}
        onClose={closeLoan}
        onSubmit={submitLoan}
        title="Loan due date"
        size="sm"
        saving={false}
        saveLabel="Set due date"
        submitDisabled={!isLoanValid}
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium text-byu-navy">
            Due date
          </label>

          <input
            type="date"
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
            value={loanDueDate}
            onChange={(e) => setLoanDueDate(e.target.value)}
          />
        </div>
      </BaseModal>

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
