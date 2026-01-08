export function formatCents(cents?: number | null) {
  if (cents === null || cents === undefined) return "";
  return `$${(cents / 100).toFixed(2)}`;
}
