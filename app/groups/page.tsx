"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import PrimaryButton from "@/components/PrimaryButton";
import FormModal from "@/components/FormModal";
import DataTable from "@/components/DataTable";
import RowActionMenu from "@/components/RowActionMenu";
import Toast, { type ToastType } from "@/components/Toast";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import DateRangePicker from "@/components/DateRangePicker";
import ConfirmModal from "@/components/ConfirmModal";
import { useRole } from "@/app/providers/RoleProvider";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit2, FiMoreVertical, FiTrash2 } from "react-icons/fi";
import {
  createPurchasingGroup,
  fetchPurchasingGroups,
  updatePurchasingGroups,
  deletePurchasingGroups,
} from "@/lib/api/purchaseGroupsApi";
import type { PurchasingGroup } from "@/types/purchaseGroup";

// Action Buttons (edit and delete) that go in the last column of the data table.
function RowActions({
  row,
  onEdit,
  onRemove,
}: {
  row: PurchasingGroup;
  onEdit: (row: PurchasingGroup) => void;
  onRemove: (row: PurchasingGroup) => void;
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

export default function GroupsPage() {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // DB groups
  const [groups, setGroups] = useState<PurchasingGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const totalPages = 5;

  // Group Modal State - functionality for both create and edit
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  type GroupModalMode = "create" | "edit";
  const [groupModalMode, setGroupModalMode] =
    useState<GroupModalMode>("create");
  const [editingRow, setEditingRow] = useState<PurchasingGroup | null>(null);
  const isEdit = groupModalMode === "edit";
  const modalTitle = isEdit ? "Edit Group" : "Create New Group";
  const modalSaveLabel = isEdit ? "Save Changes" : "Create Group";

  // Remove Confirm Modal State
  const [removeOpen, setRemoveOpen] = useState(false);
  const [rowToRemove, setRowToRemove] = useState<PurchasingGroup | null>(null);
  const [removing, setRemoving] = useState(false);

  // Generate Group Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{
    type: ToastType;
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: ToastType, title: string, message: string) => {
    setToast({ type, title, message });
  };

  // Reusable reload helper (so we can refresh after update)
  const reloadGroups = async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;

    if (silent) setRefreshing(true);
    else setLoading(true);

    setLoadError(null);

    try {
      const res = await fetchPurchasingGroups();
      setGroups(res.data);
    } catch (err: any) {
      console.error("Failed to fetch groups:", err);
      setLoadError(err?.message ?? "Failed to fetch groups");
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  };

  // Group form values (single object for FormModal)
  const [groupForm, setGroupForm] = useState({
    name: "",
    supervisor: "",
    workTag: "",
    comments: "",
  });

  // Form Values for Generate Group Report Form
  const [reportForm, setReportForm] = useState<{
    groupIds: number[];
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
  }>({
    groupIds: [],
    startDate: "",
    endDate: "",
  });

  // Role for student vs employee auth
  const router = useRouter();
  const { role } = useRole();
  const isEmployee = role === "employee";

  // Page only loads when user has employee role. Redirects to home page if in student view
  useEffect(() => {
    if (!isEmployee) router.replace("/");
  }, [isEmployee, router]);

  // Load group in table on page load
  useEffect(() => {
    if (!isEmployee) return;
    reloadGroups();
  }, [isEmployee]);

  // Open Generate Report Modal
  const openReportModal = () => setReportModalOpen(true);

  // Close Generate Report Modal
  const closeReportModal = () => {
    setReportModalOpen(false);
    setReportForm({ groupIds: [], startDate: "", endDate: "" });
  };

  // checks whether date range is logically valid (dates exist, end date is after start date)
  const isDateRangeValid =
    Boolean(reportForm.startDate) &&
    Boolean(reportForm.endDate) &&
    reportForm.endDate >= reportForm.startDate;

  // whether or not Filter Receipts button is disabled
  const isReportSubmitDisabled =
    reportForm.groupIds.length === 0 || !isDateRangeValid;

  // Placeholder submit
  const submitReport = async () => {
    // no backend yet — just close
    closeReportModal();
  };

  // Open Create Group Modal
  const openCreateGroup = () => {
    setGroupModalMode("create");
    setEditingRow(null);
    resetGroupForm();
    setGroupModalOpen(true);
  };

  // Open Edit Group Modal
  const openEditGroup = (row: PurchasingGroup) => {
    setGroupModalMode("edit");
    setEditingRow(row);
    fillGroupFormFromRow(row);
    setGroupModalOpen(true);
  };

  // Close Create Group Modal
  const handleCloseGroupModal = () => {
    resetGroupForm();
    setEditingRow(null);
    setGroupModalOpen(false);
    setGroupModalMode("create");
  };

  // Placeholder submit New Group Creation to backend
  const handleGroupModalSubmit = async () => {
    setSaving(true);

    try {
      const payload = {
        name: groupForm.name.trim(),
        supervisor: groupForm.supervisor?.trim() || null,
        workTag: groupForm.workTag.trim(),
        comments: groupForm.comments?.trim() || null,
      };

      if (groupModalMode === "create") {
        await createPurchasingGroup(payload);

        showToast("success", "Group created", `"${payload.name}" was added.`);
      } else {
        // EDIT mode
        if (!editingRow?.id) throw new Error("No group selected for editing.");
        await updatePurchasingGroups(editingRow.id, payload);

        showToast("success", "Group updated", `"${payload.name}" was saved.`);
      }

      handleCloseGroupModal();
      await reloadGroups({ silent: true });
    } catch (err) {
      console.error(err);
      showToast("error", "Save failed", "Could not save the group. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // Whether or not the Group Modal submission should be disabled
  const isSubmitDisabled = !groupForm.name.trim() || !groupForm.workTag.trim();

  // reset all fields in the group modal form
  const resetGroupForm = () => {
    setGroupForm({
      name: "",
      supervisor: "",
      workTag: "",
      comments: "",
    });
  };

  // fill the fields in the group form with current data when editing a group
  const fillGroupFormFromRow = (row: PurchasingGroup) => {
    setGroupForm({
      name: row.name ?? "",
      supervisor: row.supervisor ?? "",
      workTag: row.workTag ?? "",
      comments: row.comments ?? "",
    });
  };

  // Remove Confirmation Handlers
  const openRemoveConfirm = (row: PurchasingGroup) => {
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
      await deletePurchasingGroups(rowToRemove.id);

      closeRemoveConfirm();
      await reloadGroups({ silent: true });

      showToast(
        "success",
        "Group removed",
        `"${rowToRemove.name ?? "Group"}" was deleted.`,
      );
    } catch (err) {
      console.error("Delete group failed:", err);
      showToast(
        "error",
        "Delete failed",
        "Could not remove the group. Try again.",
      );
    } finally {
      setRemoving(false);
    }
  };

  // columns in the data table
  const columns = [
    { key: "name", header: "Group Name" },
    { key: "supervisor", header: "Supervisor" },
    { key: "workTag", header: "Work Tag" },
    { key: "comments", header: "Comments" },
    {
      key: "actions",
      header: "",
      headerClassName: "w-[1%]",
      cellClassName: "text-right",
      render: (row: PurchasingGroup) => (
        <RowActions
          row={row}
          onEdit={openEditGroup}
          onRemove={openRemoveConfirm}
        />
      ),
    },
  ];

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

      {/* Page header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-byu-navy">Groups</h1>

        <PrimaryButton
          label="Generate Group Report"
          bgClass="bg-byu-royal text-white"
          hoverBgClass="hover:bg-[#003C9E]"
          onClick={openReportModal}
        />
      </div>

      {/* Search + actions row */}
      <div className="mt-6 mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Create button */}
        <div className="flex items-center">
          <PrimaryButton
            label="Create New Group"
            icon={<FiPlus className="w-4 h-4" />}
            bgClass="bg-white text-byu-royal"
            hoverBgClass="hover:bg-gray-50"
            className="border border-byu-royal text-sm"
            onClick={openCreateGroup}
          />
        </div>

        {/* Right: Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search..."
          widthClass="w-full sm:w-80 md:w-96"
        />
      </div>

      {/* Optional error banner (placeholder) */}
      {loadError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="mb-6">
        <DataTable data={groups} loading={loading} columns={columns} />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        itemLabel="Groups"
      />

      {/* Generate Group Report Modal */}
      <FormModal
        open={reportModalOpen}
        onClose={closeReportModal}
        onSubmit={submitReport}
        title="Generate Group Report"
        size="lg"
        saving={false}
        saveLabel="Filter Receipts"
        submitDisabled={isReportSubmitDisabled}
        values={reportForm}
        setValues={setReportForm}
        errors={{
          endDate:
            reportForm.startDate && reportForm.endDate && !isDateRangeValid
              ? "End date must be on or after the start date."
              : "",
        }}
        fields={[
          {
            kind: "custom",
            key: "groupPicker",
            colSpan: 2,
            render: () => (
              <div>
                <label className="flex items-baseline gap-2 mb-1">
                  <span className="block text-sm font-medium text-byu-navy">
                    Groups *
                  </span>
                </label>

                <MultiSelectDropdown
                  items={groups}
                  selectedIds={reportForm.groupIds}
                  onChangeSelectedIds={(next) =>
                    setReportForm((p) => ({ ...p, groupIds: next as number[] }))
                  }
                  getId={(g) => g.id}
                  getPrimaryText={(g) => g.name ?? ""}
                  getSecondaryText={(g) => g.workTag ?? ""}
                  placeholder="Select groups…"
                  emptyText="Choose one or more groups"
                  selectAllText="Select all"
                  disabled={groups.length === 0}
                />
              </div>
            ),
          },
          {
            kind: "custom",
            key: "dateRange",
            colSpan: 2,
            render: () => (
              <div>
                <label className="flex items-baseline gap-2 mb-2">
                  <span className="block text-sm font-medium text-byu-navy">
                    Date range *
                  </span>
                </label>

                <DateRangePicker
                  startDate={reportForm.startDate}
                  endDate={reportForm.endDate}
                  onChange={(next) =>
                    setReportForm((p) => ({
                      ...p,
                      startDate: next.startDate,
                      endDate: next.endDate,
                    }))
                  }
                />
              </div>
            ),
          },
        ]}
      />

      {/* Group Modal - Create and Edit */}
      <FormModal
        open={groupModalOpen}
        onClose={handleCloseGroupModal}
        onSubmit={handleGroupModalSubmit}
        title={modalTitle}
        size="lg"
        saving={saving}
        saveLabel={modalSaveLabel}
        submitDisabled={isSubmitDisabled}
        values={groupForm}
        setValues={setGroupForm}
        fields={[
          {
            key: "name",
            label: "Group Name",
            required: true,
            colSpan: 2,
          },
          {
            key: "supervisor",
            label: "Supervisor",
          },
          {
            key: "workTag",
            label: "Work Tag",
            helperText: "2 letters (GR, AC, etc), and 5 numbers",
            required: true,
            placeholder: "GRXXXXX",
          },
          {
            key: "comments",
            label: "Comments",
            type: "textarea",
            colSpan: 2,
            placeholder: "Any special notes about the group...",
          },
        ]}
      />

      {/* Confirm Removal of a Group */}
      <ConfirmModal
        open={removeOpen}
        title="Remove group?"
        message={
          rowToRemove?.name
            ? `Are you sure you want to remove "${rowToRemove.name}"?`
            : "Are you sure you want to remove this group?"
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
