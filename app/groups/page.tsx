"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import PrimaryButton from "@/components/PrimaryButton";
import FormModal from "@/components/FormModal";
import { useRole } from "@/app/providers/RoleProvider";
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";

export default function GroupsPage() {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const totalPages = 5;

  // Group Modal State
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Group form values (single object for FormModal)
  const [groupForm, setGroupForm] = useState({
    groupName: "",
    description: "",
    department: "",
    controllerEmail: "",
    balance: "",
    operatingUnit: "",
    accountCode: "",
    classCode: "",
  });

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
  const openCreateGroup = () => setGroupModalOpen(true);

  // Close Create Group Modal
  const handleCloseGroupModal = () => {
    setGroupModalOpen(false);
    setSaving(false);
  };

  // Placeholder submit New Group Creation to backend
  const handleGroupModalSubmit = async () => {
    // no-op for now (fields + backend later)
    setSaving(false);
    setGroupModalOpen(false);
  };

  // Whether or not the Group Modal submission should be disabled
  const isSubmitDisabled =
    !groupForm.groupName.trim() ||
    !groupForm.balance.trim() ||
    !groupForm.operatingUnit.trim() ||
    !groupForm.accountCode.trim() ||
    !groupForm.classCode.trim() ||
    !groupForm.department.trim() ||
    !groupForm.controllerEmail.trim();

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
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-sm text-gray-500">
          {/* Intentionally blank — table will go here later */}
        </div>
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
        title="Create New Group"
        size="lg"
        saving={saving}
        saveLabel="Create Group"
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
            required: true,
            placeholder: "Ex GRXXXXX change this...",
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
    </main>
  );
}
