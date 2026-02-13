"use client";

import { useEffect, useState, useRef } from "react";
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
import {
  createPurchasingGroup,
  fetchPurchasingGroups,
  updatePurchasingGroups,
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
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const groupDropdownRef = useRef<HTMLDivElement | null>(null);

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

  // adds or removes a group ID from the selected groups list depending on if it is in the list or not
  const toggleGroup = (id: number) => {
    setReportForm((prev) => {
      const exists = prev.groupIds.includes(id);
      return {
        ...prev,
        groupIds: exists
          ? prev.groupIds.filter((x) => x !== id)
          : [...prev.groupIds, id],
      };
    });
  };

  // force removal of a group from the selected list (clicking the "x" on a selected group chip)
  const removeSelectedGroup = (id: number) => {
    setReportForm((prev) => ({
      ...prev,
      groupIds: prev.groupIds.filter((x) => x !== id),
    }));
  };

  // close group dropdown on outside click
  useEffect(() => {
    if (!groupDropdownOpen) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        groupDropdownRef.current &&
        !groupDropdownRef.current.contains(target)
      ) {
        setGroupDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [groupDropdownOpen]);

  // ------- Calendar helpers (date range picker) -------
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const toYMD = (d: Date) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  const fromYMD = (ymd: string) => {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const addMonths = (d: Date, delta: number) =>
    new Date(d.getFullYear(), d.getMonth() + delta, 1);

  // Build a 6-week grid (Sunday start) like most booking calendars
  const getMonthGrid = (monthDate: Date) => {
    const first = startOfMonth(monthDate);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay()); // back to Sunday

    const days: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push({ date, inMonth: date.getMonth() === monthDate.getMonth() });
    }
    return days;
  };

  // Calendar "current month" state (defaults to current month, or startDate month if set)
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    return reportForm.startDate
      ? startOfMonth(fromYMD(reportForm.startDate))
      : startOfMonth(new Date());
  });

  // User Selecting Dates for Group Reports
  const onPickDate = (picked: Date) => {
    const pickedYMD = toYMD(picked);

    setReportForm((prev) => {
      const hasStart = Boolean(prev.startDate);
      const hasEnd = Boolean(prev.endDate);

      // No start yet → set start
      if (!hasStart) return { ...prev, startDate: pickedYMD, endDate: "" };

      // Start exists but no end → set end (and auto-swap if user clicked earlier date)
      if (hasStart && !hasEnd) {
        if (pickedYMD >= prev.startDate) {
          return { ...prev, endDate: pickedYMD };
        }
        // clicked before start → swap
        return { ...prev, startDate: pickedYMD, endDate: prev.startDate };
      }

      // Both exist → restart selection with new start
      return { ...prev, startDate: pickedYMD, endDate: "" };
    });
  };

  // format date for summary as MM-DD-YYYY
  const formatMDY = (ymd: string) => {
    if (!ymd) return "";
    const [y, m, d] = ymd.split("-");
    return `${m}/${d}/${y}`;
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
      } else {
        // EDIT mode
        if (!editingRow?.id) throw new Error("No group selected for editing.");
        await updatePurchasingGroups(editingRow.id, payload);
      }

      handleCloseGroupModal();
      await reloadGroups({ silent: true });
    } catch (err) {
      console.error(err);
      alert("Failed to save purchasing group.");
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
            render: () => {
              const selected = groups.filter((g) =>
                reportForm.groupIds.includes(g.id),
              );

              return (
                <div>
                  <label className="flex items-baseline gap-2 mb-1">
                    <span className="block text-sm font-medium text-byu-navy">
                      Groups *
                    </span>
                  </label>

                  <div ref={groupDropdownRef} className="relative">
                    {/* “Tags input” + caret (closed state) */}
                    <button
                      type="button"
                      onClick={() => setGroupDropdownOpen((v) => !v)}
                      className={[
                        "w-full rounded-md border border-gray-300 bg-white px-3 py-2",
                        "flex items-center gap-2",
                        "focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal",
                        groupDropdownOpen
                          ? "ring-1 ring-byu-royal border-byu-royal"
                          : "",
                      ].join(" ")}
                    >
                      {/* Chip area (wraps + grows vertically) */}
                      <div
                        className={[
                          "flex-1 min-w-0",
                          "flex flex-wrap items-start gap-2",
                          "min-h-[2.25rem]",
                          "max-h-28 overflow-y-auto",
                          "py-0.5",
                        ].join(" ")}
                      >
                        {selected.length > 0 ? (
                          selected.map((g) => (
                            <span
                              key={g.id}
                              className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-800"
                            >
                              <span className="font-medium">{g.name}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation(); // don’t toggle dropdown when removing chip
                                  removeSelectedGroup(g.id);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                                title="Remove"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 leading-8">
                            Select groups…
                          </span>
                        )}
                      </div>

                      {/* Caret */}
                      <span
                        className={[
                          "ml-2 text-gray-500 transition shrink-0",
                          groupDropdownOpen ? "rotate-180" : "rotate-0",
                        ].join(" ")}
                      >
                        ▾
                      </span>
                    </button>

                    {/* Dropdown panel */}
                    {groupDropdownOpen ? (
                      <div className="absolute z-20 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden">
                        {/* Top “control bar” */}
                        <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {selected.length > 0
                              ? `${selected.length} selected`
                              : "Choose one or more groups"}
                          </span>

                          {/* Select All (top right) */}
                          <button
                            type="button"
                            className={[
                              "text-xs text-gray-600 hover:underline",
                              "disabled:text-gray-300 disabled:no-underline disabled:cursor-default disabled:pointer-events-none",
                            ].join(" ")}
                            onClick={() =>
                              setReportForm((p) => ({
                                ...p,
                                groupIds: groups.map((g) => g.id),
                              }))
                            }
                            disabled={
                              groups.length === 0 ||
                              reportForm.groupIds.length === groups.length
                            }
                            title="Select all groups"
                          >
                            Select all
                          </button>
                        </div>

                        {/* Scrollable options */}
                        <div className="max-h-48 overflow-auto p-2">
                          <div className="space-y-1">
                            {groups.map((g) => {
                              const checked = reportForm.groupIds.includes(
                                g.id,
                              );

                              return (
                                <label
                                  key={g.id}
                                  className={[
                                    "flex items-center justify-between gap-3 rounded-md px-2 py-2 cursor-pointer",
                                    "hover:bg-gray-50",
                                  ].join(" ")}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleGroup(g.id)}
                                      className="h-4 w-4 accent-byu-royal"
                                    />
                                    <span className="text-sm text-gray-900 truncate">
                                      {g.name}
                                    </span>
                                  </div>

                                  <span className="text-xs text-gray-500 whitespace-nowrap">
                                    {g.workTag}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Footer (Clear left, Done right) */}
                        <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
                          <button
                            type="button"
                            className={[
                              "text-xs text-gray-600 hover:underline",
                              "disabled:text-gray-300 disabled:no-underline disabled:cursor-default disabled:pointer-events-none",
                            ].join(" ")}
                            onClick={() =>
                              setReportForm((p) => ({ ...p, groupIds: [] }))
                            }
                            disabled={reportForm.groupIds.length === 0}
                          >
                            Clear
                          </button>

                          <button
                            type="button"
                            className="text-xs text-byu-royal hover:underline"
                            onClick={() => setGroupDropdownOpen(false)}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            },
          },
          {
            kind: "custom",
            key: "dateRange",
            colSpan: 2,
            render: () => {
              const monthLabel = calendarMonth.toLocaleString(undefined, {
                month: "long",
                year: "numeric",
              });

              const start = reportForm.startDate
                ? fromYMD(reportForm.startDate)
                : null;
              const end = reportForm.endDate
                ? fromYMD(reportForm.endDate)
                : null;

              const grid = getMonthGrid(calendarMonth);

              const inRange = (d: Date) => {
                if (!start) return false;
                if (start && !end) return isSameDay(d, start);
                const ymd = toYMD(d);
                return ymd >= reportForm.startDate && ymd <= reportForm.endDate;
              };

              const isStart = (d: Date) =>
                start ? isSameDay(d, start) : false;
              const isEnd = (d: Date) => (end ? isSameDay(d, end) : false);

              const summary =
                reportForm.startDate && reportForm.endDate
                  ? `${formatMDY(reportForm.startDate)} - ${formatMDY(reportForm.endDate)}`
                  : reportForm.startDate
                    ? formatMDY(reportForm.startDate)
                    : "";

              return (
                <div>
                  <label className="flex items-baseline gap-2 mb-2">
                    <span className="block text-sm font-medium text-byu-navy">
                      Date range *
                    </span>
                  </label>

                  {/* Month header */}
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={() => setCalendarMonth((m) => addMonths(m, -1))}
                      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
                      aria-label="Previous month"
                    >
                      ‹
                    </button>

                    <div className="text-sm font-medium text-gray-900">
                      {monthLabel}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCalendarMonth((m) => addMonths(m, 1))}
                      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
                      aria-label="Next month"
                    >
                      ›
                    </button>
                  </div>

                  {/* Weekday header */}
                  <div className="grid grid-cols-7 text-xs text-gray-500 mb-1">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                      <div key={d} className="text-center py-1">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {grid.map(({ date, inMonth }, idx) => {
                      const ymd = toYMD(date);
                      const active = inRange(date);
                      const startCap = isStart(date);
                      const endCap = isEnd(date);

                      // “Bar” styling: middle days are a filled background with squared edges;
                      // start/end are rounded “caps”.
                      const rangeBg =
                        active && !startCap && !endCap ? "bg-blue-50" : "";
                      const capBg =
                        startCap || endCap ? "bg-byu-royal text-white" : "";

                      // Round edges for range continuity
                      const rounded =
                        startCap && endCap
                          ? "rounded-full"
                          : startCap
                            ? "rounded-l-full"
                            : endCap
                              ? "rounded-r-full"
                              : active
                                ? "rounded-none"
                                : "rounded-md";

                      return (
                        <button
                          key={`${ymd}-${idx}`}
                          type="button"
                          onClick={() => onPickDate(date)}
                          className={[
                            "h-9 w-full text-sm",
                            "flex items-center justify-center",
                            inMonth ? "text-gray-900" : "text-gray-400",
                            active ? "bg-blue-50" : "hover:bg-gray-50",
                            rangeBg,
                            capBg,
                            rounded,
                            "transition",
                            "focus:outline-none focus:ring-1 focus:ring-byu-royal",
                          ].join(" ")}
                          title={ymd}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Summary row (left) + Clear dates (right) */}
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-600">
                    <button
                      type="button"
                      className={[
                        "shrink-0 text-xs",
                        "text-gray-600 hover:underline",
                        "disabled:text-gray-300 disabled:no-underline disabled:cursor-default",
                        "disabled:pointer-events-none",
                      ].join(" ")}
                      onClick={() =>
                        setReportForm((p) => ({
                          ...p,
                          startDate: "",
                          endDate: "",
                        }))
                      }
                      disabled={!reportForm.startDate && !reportForm.endDate}
                    >
                      Clear dates
                    </button>

                    <div className="min-w-0 font-medium">
                      <span className="text-gray-700">Selected:</span>{" "}
                      <span className="truncate">{summary}</span>
                    </div>
                  </div>

                  {/* Error */}
                  {reportForm.startDate &&
                  reportForm.endDate &&
                  !isDateRangeValid ? (
                    <p className="mt-1 text-xs text-red-600">
                      End date must be on or after the start date.
                    </p>
                  ) : null}
                </div>
              );
            },
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
