"use client";

import { useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import DataTable from "@/components/DataTable";
import Pagination from "@/components/Pagination";
import { fetchLoans, updateLoan } from "@/lib/api/loansApi";
import type { Loan } from "@/types/loan";
import { useRouter } from "next/navigation";
import { useRole } from "@/app/providers/RoleProvider";
import { FiCornerDownLeft } from "react-icons/fi";
import { formatDBStrings } from "@/lib/utils/formatDBStrings";
import { statusToBadgeClasses } from "@/lib/utils/statusBadge";
import ConfirmModal from "@/components/ConfirmModal";

// Action button that goes in the last column of the data table.
function RowActions({
  row,
  onCheckIn,
  disabled,
}: {
  row: Loan;
  onCheckIn: (row: Loan) => void;
  disabled?: boolean;
}) {
  const show = row.status === "ONGOING";
  if (!show) return null;

  return (
    <div className="flex items-center justify-end">
      <button
        type="button"
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-lg bg-byu-royal px-1.5 py-1.5 text-white text-xs font-medium hover:bg-[#003C9E] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onCheckIn(row)}
      >
        <FiCornerDownLeft className="h-4 w-4" />
        <span>Check-in</span>
      </button>
    </div>
  );
}

export default function LoansPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // DB loans
  const [loans, setLoans] = useState<Loan[]>([]);
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

  // Check-in modal state
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // Reusable reload helper (so we can refresh after update)
  const reloadLoans = async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;

    if (silent) setRefreshing(true);
    else setLoading(true);

    setLoadError(null);

    try {
      const data = await fetchLoans();
      setLoans(data);
    } catch (err: any) {
      console.error("Failed to fetch loans:", err);
      setLoadError(err?.message ?? "Failed to fetch loans");
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  };

  // Page only loads when user has employee role. Redirects to home page if in student view
  useEffect(() => {
    if (!isEmployee) {
      router.replace("/");
    }
  }, [isEmployee, router]);

  // Load loans in table on page load
  useEffect(() => {
    reloadLoans();
  }, []);

  // Open Check-in Modal
  const openCheckIn = (row: Loan) => {
    if (row.status !== "ONGOING") return;
    setSelectedLoan(row);
    setCheckInOpen(true);
  };

  // Close Check-in Modal
  const closeCheckIn = () => {
    if (checkingIn) return;
    setCheckInOpen(false);
    setSelectedLoan(null);
  };

  // Update the loan to RETURNED in the db
  const confirmCheckIn = async () => {
    if (!selectedLoan?.id) return;

    setCheckingIn(true);
    try {
      await updateLoan(selectedLoan.id, {
        status: "RETURNED",
      });

      closeCheckIn();
      await reloadLoans({ silent: true });
    } catch (err: any) {
      console.error("Check-in failed:", err);
      setLoadError(err?.message ?? "Failed to check-in loan");
    } finally {
      setCheckingIn(false);
    }
  };

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  // Optional: client-side filter for now (until you implement search server-side)
  const filteredLoans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return loans;

    return loans.filter((l) => {
      const haystack = [
        l.equipment?.name,
        l.equipment?.serialNumber,
        l.user?.name,
        l.user?.netID,
        l.user?.email,
        l.status,
        l.loanDate,
        l.returnDate ?? "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [loans, searchQuery]);

  // Columns for the Loans Table
  const columns = [
    {
      key: "equipment",
      header: "Loaned Item Name",
      render: (row: Loan) => row?.equipment?.name ?? "",
    },
    {
      key: "equipmentSerial",
      header: "Serial Number",
      render: (row: Loan) => row?.equipment?.serialNumber ?? "",
    },
    {
      key: "userName",
      header: "Loanee Name",
      render: (row: Loan) => row?.user?.name ?? "",
    },
    {
      key: "userEmail",
      header: "Email",
      render: (row: Loan) => row?.user?.email ?? "",
    },
    {
      key: "group",
      header: "Group",
    },
    {
      key: "loanDate",
      header: "Checkout Date",
      render: (row: Loan) => formatDate(row?.loanDate),
    },
    {
      key: "returnDate",
      header: "Due Date",
      render: (row: Loan) => formatDate(row?.returnDate),
    },
    {
      key: "loanStatus",
      header: "Status",
      render: (row: any) => (
        <span
          className={[
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
            statusToBadgeClasses(row?.status),
          ].join(" ")}
        >
          {formatDBStrings(row?.status)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-[1%]",
      cellClassName: "text-right",
      render: (row: Loan) => (
        <RowActions
          row={row}
          onCheckIn={openCheckIn}
          disabled={refreshing || checkingIn}
        />
      ),
    },
  ];

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-white px-12 py-8">
      <h1 className="text-3xl font-bold text-byu-navy">Loans</h1>

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

      {/* Optional error banner */}
      {loadError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div>
        <DataTable data={filteredLoans} loading={loading} columns={columns} />
      </div>

      {/* Check-in Modal */}
      <ConfirmModal
        open={checkInOpen}
        title="Confirm return"
        confirmLabel="Confirm return"
        cancelLabel="Cancel"
        busy={checkingIn}
        busyLabel="Checking in…"
        variant="primary"
        closeOnBackdrop={true}
        onCancel={closeCheckIn}
        onConfirm={confirmCheckIn}
      >
        <div className="text-sm text-gray-700 whitespace-pre-line">
          Confirm{" "}
          <span className="font-medium text-byu-navy">
            {selectedLoan?.user?.name ??
              selectedLoan?.user?.email ??
              "this user"}
          </span>{" "}
          returned{" "}
          <span className="font-medium text-byu-navy">
            {selectedLoan?.equipment?.name ?? "this equipment"}
          </span>
          ?
        </div>
      </ConfirmModal>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        itemLabel="Loans"
      />
    </main>
  );
}
