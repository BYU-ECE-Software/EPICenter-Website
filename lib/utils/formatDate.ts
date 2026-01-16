// Accepts either an ISO string (or any date string) OR a Date instance.
export type DateLike = string | Date;

// Always format dates using UTC so the calendar date never shifts.
export function toYMDUTC(value: DateLike | null | undefined): string {
  if (!value) return "";

  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";

  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");

  return `${m}/${day}/${y}`; // "MM/DD/YYYY"
}

// If you ever need an ISO at UTC midnight for a given date string (YYYY-MM-DD)
export function ymdToUtcIso(ymd: string | null | undefined): string | null {
  if (!ymd) return null;
  return new Date(`${ymd}T00:00:00.000Z`).toISOString();
}
