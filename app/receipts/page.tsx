"use client";

import { useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import DataTable from "@/components/DataTable";
import Pagination from "@/components/Pagination";
import { useRole } from "@/app/providers/RoleProvider";
import { FiFileText } from "react-icons/fi";
import { toYMDUTC } from "@/lib/utils/formatDate";
import { useRouter } from "next/navigation";
import type { Purchase } from "@/types/purchase";
import { fetchReceipts } from "@/lib/api/receiptsApi";
import { formatCents } from "@/lib/utils/money";

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
        <FiFileText className="h-4 w-4" />
        <span>View</span>
      </button>
    </div>
  );
}

export default function ReceiptsPage() {
  //Search State
  const [searchQuery, setSearchQuery] = useState("");

  // DB Receipts (Purchases) state
  const [receipts, setReceipts] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  // Reusable reload helper
  const reloadReceipts = async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;

    if (silent) setRefreshing(true);
    else setLoading(true);

    setLoadError(null);

    try {
      // If later you want employee to see all and student to see their own,
      // you can pass userId here (once you have it).
      const data = await fetchReceipts();
      setReceipts(data);
    } catch (err: any) {
      console.error("Failed to fetch receipts:", err);
      setLoadError(err?.message ?? "Failed to fetch receipts");
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  };

  // Load receipts in table on page load
  useEffect(() => {
    reloadReceipts();
  }, []);

  // Columns for the Receipts table
  const columns = [
    {
      key: "purchaser",
      header: "Purchaser",
      render: (row: Purchase) => row?.user?.name ?? row?.user?.email ?? "",
    },
    {
      key: "email",
      header: "Email",
      render: (row: Purchase) => row?.user?.email ?? "",
    },
    {
      key: "group",
      header: "Group",
      render: (row: Purchase) => row?.purchasingGroup?.name ?? "",
    },
    {
      key: "total",
      header: "Total",
      render: (row: Purchase) => formatCents(row?.totalCents),
    },
    {
      key: "purchaseDate",
      header: "Date of Purchase",
      render: (row: Purchase) => toYMDUTC(row?.createdAt),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-[1%]",
      cellClassName: "text-right",
      render: () => <RowActions disabled={refreshing || loading} />,
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
        <DataTable data={receipts} loading={loading} columns={columns} />
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
