"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import PrimaryButton from "@/components/PrimaryButton";
import BaseModal from "@/components/BaseModal";
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

  // State for fields in the Group Modal
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [balance, setBalance] = useState("");
  const [operatingUnit, setOperatingUnit] = useState("");
  const [accountCode, setAccountCode] = useState("");
  const [classCode, setClassCode] = useState("");
  const [department, setDepartment] = useState("");
  const [controllerEmail, setControllerEmail] = useState("");

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
    !groupName.trim() ||
    !balance.trim() ||
    !operatingUnit.trim() ||
    !accountCode.trim() ||
    !classCode.trim() ||
    !department.trim() ||
    !controllerEmail.trim();

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

      {/* Group Modal */}
      <BaseModal
        open={groupModalOpen}
        onClose={handleCloseGroupModal}
        onSubmit={handleGroupModalSubmit}
        title="Create New Group"
        size="lg"
        saving={saving}
        saveLabel="Create Group"
        submitDisabled={isSubmitDisabled}
      >
        <div className="grid grid-cols-1 gap-6">
          {/* General Information Section */}
          <section className="text-left">
            <h3 className="text-base font-semibold text-byu-navy mb-4">
              General Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-byu-navy mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                  placeholder="Enter group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              {/* Description (optional) */}
              <div>
                <label className="block text-sm font-medium text-byu-navy mb-1">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                  placeholder="Optional description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-byu-navy mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                  placeholder="Enter department..."
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              {/* Controller Email */}
              <div>
                <label className="block text-sm font-medium text-byu-navy mb-1">
                  Controller Email *
                </label>
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                  placeholder="name@byu.edu"
                  value={controllerEmail}
                  onChange={(e) => setControllerEmail(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Section divider */}
          <div className="border-t border-gray-200" />

          {/* Account Information Section */}
          <section className="text-left">
            <h3 className="text-base font-semibold text-byu-navy mb-4">
              Account Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Balance */}
              <div>
                <label className="block text-sm font-medium text-byu-navy mb-1">
                  Balance *
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                  placeholder="Enter balance..."
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </div>

              {/* Funding Code */}
              <div>
                <label className="block text-sm font-medium text-byu-navy mb-1">
                  Funding Code *
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                  placeholder="Enter funding code..."
                  value={operatingUnit}
                  onChange={(e) => setOperatingUnit(e.target.value)}
                />
              </div>

              {/* Spend Category */}
              <div>
                <label className="block text-sm font-medium text-byu-navy mb-1">
                  Spend Category *
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                  placeholder="Enter spend category..."
                  value={accountCode}
                  onChange={(e) => setAccountCode(e.target.value)}
                />
              </div>

              {/* Class Code */}
              <div>
                <label className="block text-sm font-medium text-byu-navy mb-1">
                  Class Code *
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                  placeholder="Enter class code..."
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>
      </BaseModal>
    </main>
  );
}
