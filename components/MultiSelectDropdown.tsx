"use client";

import { useEffect, useRef, useState } from "react";

type Id = string | number;

export default function MultiSelectDropdown<T>({
  items,
  selectedIds,
  onChangeSelectedIds,

  getId,
  getPrimaryText,
  getSecondaryText,

  placeholder = "Select…",
  emptyText = "Choose one or more",
  selectAllText = "Select all",
  clearText = "Clear",
  doneText = "Done",

  disabled = false,
}: {
  items: T[];
  selectedIds: Id[];
  onChangeSelectedIds: (next: Id[]) => void;

  // how to read fields from any item type
  getId: (item: T) => Id;
  getPrimaryText: (item: T) => string; // shown in chips + left side of row
  getSecondaryText?: (item: T) => string; // shown on right side of row (optional)

  // text customization
  placeholder?: string;
  emptyText?: string;
  selectAllText?: string;
  clearText?: string;
  doneText?: string;

  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const itemIds = items.map(getId);

  const selected = items.filter((item) => selectedIds.includes(getId(item)));

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const someSelected =
    selectedIds.length > 0 && selectedIds.length < items.length;

  const toggleOne = (id: Id) => {
    onChangeSelectedIds(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  const removeSelected = (id: Id) => {
    onChangeSelectedIds(selectedIds.filter((x) => x !== id));
  };

  const toggleSelectAll = () => {
    onChangeSelectedIds(allSelected ? [] : itemIds);
  };

  // close dropdown on outside click (same behavior as before)
  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // if disabled turns true while open, close it
  useEffect(() => {
    if (disabled && open) setOpen(false);
  }, [disabled, open]);

  return (
    <div ref={dropdownRef} className="relative">
      {/* “Tags input” + caret (closed state) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={[
          "w-full rounded-md border border-gray-300 bg-white px-3 py-2",
          "flex items-center gap-2",
          "focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal",
          open ? "ring-1 ring-byu-royal border-byu-royal" : "",
          disabled ? "opacity-60 cursor-not-allowed" : "",
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
            selected.map((item) => {
              const id = getId(item);
              const text = getPrimaryText(item);

              return (
                <span
                  key={String(id)}
                  className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-800"
                >
                  <span className="font-medium">{text}</span>

                  {/* IMPORTANT: span (not button) to avoid nested button hydration warning */}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelected(id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        removeSelected(id);
                      }
                    }}
                    className="text-gray-500 hover:text-gray-700 cursor-pointer select-none"
                    title="Remove"
                    aria-label={`Remove ${text}`}
                  >
                    ×
                  </span>
                </span>
              );
            })
          ) : (
            <span className="text-sm text-gray-400 leading-8">
              {placeholder}
            </span>
          )}
        </div>

        {/* Caret */}
        <span
          className={[
            "ml-2 text-gray-500 transition shrink-0",
            open ? "rotate-180" : "rotate-0",
          ].join(" ")}
        >
          ▾
        </span>
      </button>

      {/* Dropdown panel */}
      {open ? (
        <div className="absolute z-20 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden">
          {/* Top “control bar” */}
          <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {selected.length > 0 ? `${selected.length} selected` : emptyText}
            </span>

            {/* Select All */}
            <label
              className={[
                "flex items-center gap-2 select-none",
                items.length === 0
                  ? "text-gray-300 cursor-default pointer-events-none"
                  : "text-gray-700 cursor-pointer",
              ].join(" ")}
              title={selectAllText}
            >
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={toggleSelectAll}
                className="h-5 w-5 accent-byu-royal"
                disabled={items.length === 0}
              />
              <span className="text-sm font-medium">{selectAllText}</span>
            </label>
          </div>

          {/* Scrollable options */}
          <div className="max-h-48 overflow-auto p-2">
            <div className="space-y-1">
              {items.map((item) => {
                const id = getId(item);
                const checked = selectedIds.includes(id);
                const primary = getPrimaryText(item);
                const secondary = getSecondaryText?.(item) ?? "";

                return (
                  <label
                    key={String(id)}
                    className={[
                      "flex items-center justify-between gap-3 rounded-md px-2 py-2 cursor-pointer",
                      "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(id)}
                        className="h-4 w-4 accent-byu-royal"
                      />
                      <span className="text-sm text-gray-900 truncate">
                        {primary}
                      </span>
                    </div>

                    {getSecondaryText ? (
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {secondary}
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              className={[
                "text-xs text-gray-600 hover:underline",
                "disabled:text-gray-300 disabled:no-underline disabled:cursor-default disabled:pointer-events-none",
              ].join(" ")}
              onClick={() => onChangeSelectedIds([])}
              disabled={selectedIds.length === 0}
            >
              {clearText}
            </button>

            <button
              type="button"
              className="text-xs text-byu-royal hover:underline"
              onClick={() => setOpen(false)}
            >
              {doneText}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
