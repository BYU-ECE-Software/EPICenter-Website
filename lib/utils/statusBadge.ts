// Picks a badge "tone" based on common status keywords
export function statusToBadgeClasses(status: string): string {
  const s = (status ?? "").toLowerCase();

  if (
    s.includes("retir") ||
    s.includes("cancel") ||
    s.includes("inactive") ||
    s.includes("return")
  ) {
    return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
  }

  if (s.includes("maint") || s.includes("repair") || s.includes("broken")) {
    return "bg-blue-50 text-blue-800 ring-1 ring-blue-200";
  }

  if (s.includes("loan") || s.includes("checked") || s.includes("borrow")) {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  }

  if (
    s.includes("avail") ||
    s.includes("ready") ||
    s.includes("active") ||
    s.includes("ongoing")
  ) {
    return "bg-green-50 text-green-800 ring-1 ring-green-200";
  }

  if (s.includes("late") || s.includes("over") || s.includes("past")) {
    return "bg-red-50 text-red-800 ring-1 ring-red-200";
  }

  return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
}
