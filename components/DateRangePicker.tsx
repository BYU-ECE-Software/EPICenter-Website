"use client";

import { useMemo, useState } from "react";

type DateRangePickerProps = {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onChange: (next: { startDate: string; endDate: string }) => void;

  // optional: lets parent control the month if they ever want to
  initialMonthYMD?: string; // YYYY-MM-DD
};

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

// format date for summary as MM/DD/YYYY
const formatMDY = (ymd: string) => {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-");
  return `${m}/${d}/${y}`;
};

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  initialMonthYMD,
}: DateRangePickerProps) {
  // Calendar "current month" state (defaults to current month, or startDate month if set)
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    if (initialMonthYMD) return startOfMonth(fromYMD(initialMonthYMD));
    return startDate
      ? startOfMonth(fromYMD(startDate))
      : startOfMonth(new Date());
  });

  const monthLabel = useMemo(
    () =>
      calendarMonth.toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [calendarMonth],
  );

  const start = startDate ? fromYMD(startDate) : null;
  const end = endDate ? fromYMD(endDate) : null;

  const grid = useMemo(() => getMonthGrid(calendarMonth), [calendarMonth]);

  const inRange = (d: Date) => {
    if (!start) return false;
    if (start && !end) return isSameDay(d, start);
    const ymd = toYMD(d);
    return ymd >= startDate && ymd <= endDate;
  };

  const isStart = (d: Date) => (start ? isSameDay(d, start) : false);
  const isEnd = (d: Date) => (end ? isSameDay(d, end) : false);

  const onPickDate = (picked: Date) => {
    const pickedYMD = toYMD(picked);

    const hasStart = Boolean(startDate);
    const hasEnd = Boolean(endDate);

    // No start yet → set start
    if (!hasStart) return onChange({ startDate: pickedYMD, endDate: "" });

    // Start exists but no end → set end (and auto-swap if user clicked earlier date)
    if (hasStart && !hasEnd) {
      if (pickedYMD >= startDate) {
        return onChange({ startDate, endDate: pickedYMD });
      }
      // clicked before start → swap
      return onChange({ startDate: pickedYMD, endDate: startDate });
    }

    // Both exist → restart selection with new start
    return onChange({ startDate: pickedYMD, endDate: "" });
  };

  const isDateRangeValid =
    Boolean(startDate) && Boolean(endDate) && endDate >= startDate;

  const summary =
    startDate && endDate
      ? `${formatMDY(startDate)} - ${formatMDY(endDate)}`
      : startDate
        ? formatMDY(startDate)
        : "";

  return (
    <div>
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

        <div className="text-sm font-medium text-gray-900">{monthLabel}</div>

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
          const rangeBg = active && !startCap && !endCap ? "bg-blue-50" : "";
          const capBg = startCap || endCap ? "bg-byu-royal text-white" : "";

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
          onClick={() => onChange({ startDate: "", endDate: "" })}
          disabled={!startDate && !endDate}
        >
          Clear dates
        </button>

        <div className="min-w-0 font-medium">
          <span className="text-gray-700">Selected:</span>{" "}
          <span className="truncate">{summary}</span>
        </div>
      </div>

      {/* Error */}
      {startDate && endDate && !isDateRangeValid ? (
        <p className="mt-1 text-xs text-red-600">
          End date must be on or after the start date.
        </p>
      ) : null}
    </div>
  );
}
