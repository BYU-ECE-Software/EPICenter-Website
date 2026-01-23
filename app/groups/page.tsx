"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import PrimaryButton from "@/components/PrimaryButton";
import FormModal from "@/components/FormModal";
import DataTable from "@/components/DataTable";
import RowActionMenu from "@/components/RowActionMenu";
import ConfirmModal from "@/components/ConfirmModal";
import { useRole } from "@/app/providers/RoleProvider";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit2, FiMoreVertical, FiTrash2 } from "react-icons/fi";

// Eventually take this out and use the actual type file. The type just doesn't match this table yet. Once schema changes are made.
type GroupRow = {
  id: number;
  groupName: string;
  supervisor: string;
  workTag: string;
  comments: string;
};

// Action Buttons (edit and delete) that go in the last column of the data table.
function RowActions({
  row,
  onEdit,
  onRemove,
}: {
  row: any;
  onEdit: (row: any) => void;
  onRemove: (row: any) => void;
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
  const [editingRow, setEditingRow] = useState<GroupRow | null>(null);
  const isEdit = groupModalMode === "edit";
  const modalTitle = isEdit ? "Edit Group" : "Create New Group";
  const modalSaveLabel = isEdit ? "Save Changes" : "Create Group";

  // Remove Confirm Modal State
  const [removeOpen, setRemoveOpen] = useState(false);
  const [rowToRemove, setRowToRemove] = useState<GroupRow | null>(null);
  const [removing, setRemoving] = useState(false);

  // Group form values (single object for FormModal)
  const [groupForm, setGroupForm] = useState({
    groupName: "",
    supervisor: "",
    workTag: "",
    comments: "",
  });

  // Temp dummy data
  const [groups] = useState<GroupRow[]>([
    {
      id: 1,
      groupName: "Chemistry Stockroom",
      supervisor: "Dr. Jensen",
      workTag: "GR12345",
      comments: "Handles general chemical inventory requests.",
    },
    {
      id: 2,
      groupName: "Physics Lab Support",
      supervisor: "M. Alvarez",
      workTag: "AC54321",
      comments: "Priority: labs 100–200 level.",
    },
    {
      id: 3,
      groupName: "Biohazard Supplies",
      supervisor: "S. Kim",
      workTag: "GR77777",
      comments: "",
    },
  ]);

  // Optional error banner placeholder
  const [loadError] = useState<string | null>(null);

  // Role for student vs employee auth
  const router = useRouter();
  const { role } = useRole();
  const isEmployee = role === "employee";

  // Page only loads when user has employee role. Redirects to home page if in student view
  useEffect(() => {
    if (!isEmployee) router.replace("/");
  }, [isEmployee, router]);

  // Open Create Group Modal
  const openCreateGroup = () => {
    setGroupModalMode("create");
    setEditingRow(null);
    resetGroupForm();
    setGroupModalOpen(true);
  };

  // Open Edit Group Modal
  const openEditGroup = (row: GroupRow) => {
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
    setSaving(false);
  };

  // Placeholder submit New Group Creation to backend
  const handleGroupModalSubmit = async () => {
    handleCloseGroupModal();
  };

  // Whether or not the Group Modal submission should be disabled
  const isSubmitDisabled =
    !groupForm.groupName.trim() || !groupForm.workTag.trim();

  // reset all fields in the group modal form
  const resetGroupForm = () => {
    setGroupForm({
      groupName: "",
      supervisor: "",
      workTag: "",
      comments: "",
    });
  };

  // fill the fields in the group form with current data when editing a group
  const fillGroupFormFromRow = (row: GroupRow) => {
    setGroupForm({
      groupName: row.groupName ?? "",
      supervisor: row.supervisor ?? "",
      workTag: row.workTag ?? "",
      comments: row.comments ?? "",
    });
  };

  // Remove Confirmation Handlers
  const openRemoveConfirm = (row: GroupRow) => {
    setRowToRemove(row);
    setRemoveOpen(true);
  };

  const closeRemoveConfirm = () => {
    setRemoveOpen(false);
    setRowToRemove(null);
  };

  const confirmRemove = async () => {
    // no backend yet — just close
    setRemoving(true);
    try {
      closeRemoveConfirm();
    } finally {
      setRemoving(false);
    }
  };

  // columns in the data table
  const columns = [
    { key: "groupName", header: "Group Name" },
    { key: "supervisor", header: "Supervisor" },
    { key: "workTag", header: "Work Tag" },
    { key: "comments", header: "Comments" },
    {
      key: "actions",
      header: "",
      headerClassName: "w-[1%]",
      cellClassName: "text-right",
      render: (row: GroupRow) => (
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
      <h1 className="text-3xl font-bold text-byu-navy">Groups</h1>

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

      {/* Table placeholder space (intentionally empty for now) */}
      <div className="mb-6">
        <DataTable data={groups} loading={false} columns={columns} />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        itemLabel="Groups"
      />

      {/* Group Modal (FormModal) */}
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
            key: "groupName",
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
          rowToRemove?.groupName
            ? `Are you sure you want to remove "${rowToRemove.groupName}"?`
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
