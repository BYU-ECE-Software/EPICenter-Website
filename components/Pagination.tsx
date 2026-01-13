"use client";

import React from "react";

export type PaginationProps = {
  currentPage: number; // 1-based
  totalPages: number; // 1-based
  onPageChange: (page: number) => void;

  pageSize: number;
  setPageSize: (size: number) => void;

  itemLabel?: string; // e.g. "Orders", "Items", "Equipment"
  pageSizeOptions?: number[]; // optional override
  delta?: number; // pages shown on each side of current
  className?: string;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  setPageSize,
  itemLabel = "Items",
  pageSizeOptions = [10, 25, 50, 100],
  delta = 1,
  className = "",
}: PaginationProps) {
  const [inputPage, setInputPage] = React.useState("");

  const clamp = (n: number) => Math.max(1, Math.min(totalPages, n));

  const goTo = (page: number) => {
    if (!Number.isFinite(page)) return;
    const p = clamp(page);
    if (p !== currentPage) onPageChange(p);
  };

  const handlePrev = () => goTo(currentPage - 1);
  const handleNext = () => goTo(currentPage + 1);

  const commitInput = () => {
    if (!inputPage.trim()) return;
    const n = Number(inputPage);
    if (!Number.isFinite(n)) return;
    goTo(n);
    setInputPage("");
  };

  const renderPageNumbers = () => {
    const items: React.ReactNode[] = [];
    let lastWasEllipsis = false;

    for (let i = 1; i <= totalPages; i++) {
      const isEdge = i === 1 || i === totalPages;
      const isNear = i >= currentPage - delta && i <= currentPage + delta;

      if (isEdge || isNear) {
        lastWasEllipsis = false;
        items.push(
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-current={currentPage === i ? "page" : undefined}
            className={`px-3 py-1 rounded-md text-sm border transition whitespace-nowrap ${
              currentPage === i
                ? "bg-byu-navy text-white border-byu-navy font-semibold"
                : "bg-white border-byu-navy text-byu-navy hover:bg-byu-navy hover:text-white"
            }`}
          >
            {i}
          </button>
        );
      } else if (!lastWasEllipsis) {
        lastWasEllipsis = true;
        items.push(
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-gray-400 select-none"
          >
            ...
          </span>
        );
      }
    }

    return items;
  };

  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex flex-col md:flex-row justify-center items-center mt-6 gap-4 flex-wrap ${className}`}
    >
      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md text-sm bg-white border border-byu-navy text-byu-navy hover:bg-byu-navy hover:text-white transition disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-byu-navy"
        >
          Previous
        </button>

        {renderPageNumbers()}

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md text-sm bg-white border border-byu-navy text-byu-navy hover:bg-byu-navy hover:text-white transition disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-byu-navy"
        >
          Next
        </button>
      </div>

      {/* Go to page */}
      <div className="flex items-center gap-2">
        <label htmlFor="goToPage" className="text-sm text-byu-navy">
          Go to page:
        </label>
        <input
          id="goToPage"
          type="number"
          min={1}
          max={totalPages}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onBlur={commitInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitInput();
            if (e.key === "Escape") setInputPage("");
          }}
          className="w-20 border border-byu-navy text-byu-navy rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-byu-navy"
        />
      </div>

      {/* Page size */}
      <div className="flex items-center gap-2">
        <label htmlFor="pageSize" className="text-sm text-byu-navy font-normal">
          {itemLabel} per page:
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            onPageChange(1);
          }}
          className="border border-byu-navy text-byu-navy bg-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-byu-navy transition"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
