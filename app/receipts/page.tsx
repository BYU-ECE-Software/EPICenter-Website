"use client";

import { useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import DataTable from "@/components/DataTable";
import Pagination from "@/components/Pagination";
import { useRole } from "@/app/providers/RoleProvider";
import { FiEye } from "react-icons/fi";
import { toYMDUTC } from "@/lib/utils/formatDate";
import { useRouter } from "next/navigation";

// View button that goes in the last column of the data table.
function RowActions({ disabled }: { disabled?: boolean }) {
  return (
    <div className="flex items-center justify-end">
      <button
        type="button"
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-lg bg-byu-royal px-1.5 py-1.5 text-white text-xs font-medium hover:bg-[#003C9E] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => {}}
      >
        <FiEye className="h-4 w-4" />
        <span>View</span>
      </button>
    </div>
  );
}

export default function ReceiptsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // One dummy receipt row for styling preview
  const [receipts] = useState<any[]>([
    {
      purchaser: "Jane Doe",
      email: "jane.doe@byu.edu",
      group: "ECE 110",
      total: "$42.75",
      purchaseDate: "2025-02-12T00:00:00Z",
    },
  ]);
  const [loading] = useState(false);
  const [refreshing] = useState(false);
  const [loadError] = useState<string | null>(null);

  // Pagination state (placeholder for now)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const totalPages = 5; // fake for now

  // Role for student vs employee auth
  const router = useRouter();
  const { role } = useRole();
  const isEmployee = role === "employee";

  // Page only loads when user has employee role. Redirects to home page if in student view
  useEffect(() => {
    if (!isEmployee) {
      router.replace("/");
    }
  }, [isEmployee, router]);

  // Optional: client-side filter (kept for consistency; currently empty)
  const filteredReceipts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return receipts;

    return receipts.filter((r) => {
      const haystack = [r.purchaser, r.email, r.group, r.total, r.purchaseDate]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [receipts, searchQuery]);

  // Columns for the Receipts table
  const columns = [
    {
      key: "purchaser",
      header: "Purchaser",
      render: (row: any) => row?.purchaser ?? "",
    },
    {
      key: "email",
      header: "Email",
      render: (row: any) => row?.email ?? "",
    },
    {
      key: "group",
      header: "Group",
      render: (row: any) => row?.group ?? "",
    },
    {
      key: "total",
      header: "Total",
      render: (row: any) => row?.total ?? "",
    },
    {
      key: "purchaseDate",
      header: "Date of Purchase",
      render: (row: any) => toYMDUTC(row?.purchaseDate),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-[1%]",
      cellClassName: "text-right",
      render: (_row: any) => (
        <RowActions disabled={refreshing || loading || !isEmployee} />
      ),
    },
  ];

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-white px-12 py-8">
      <h1 className="text-3xl font-bold text-byu-navy">Receipts</h1>

      {/* Search row */}
      <div className="mt-6 mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div />
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search..."
          widthClass="w-full sm:w-80 md:w-96"
        />
      </div>

      {/* Optional error banner (won't show for now, but kept for consistency) */}
      {loadError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div>
        <DataTable
          data={filteredReceipts}
          loading={loading}
          columns={columns}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        itemLabel="Receipts"
      />
    </main>
  );
}
