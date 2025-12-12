"use client";

import type { ReactNode } from "react";

type DataTableColumn = {
  /** Key used to read data from the row if no custom render is provided */
  key: string;
  /** Column header label */
  header: string;
  /** Optional extra classes for header cell */
  headerClassName?: string;
  /** Optional extra classes for body cell */
  cellClassName?: string;
  /** Optional custom renderer for the cell */
  render?: (row: any) => ReactNode;
};

type DataTableProps = {
  /** Array of row data */
  data: any[];
  /** Whether the table is loading */
  loading?: boolean;
  /** Message to show when there is no data */
  emptyMessage?: string;
  /** Column configuration */
  columns: DataTableColumn[];
  /** Optional row key function */
  getRowKey?: (row: any, index: number) => React.Key;
  /** Extra classes for outer section wrapper */
  containerClassName?: string;
};

export default function DataTable({
  data,
  loading = false,
  emptyMessage = "No records found.",
  columns,
  getRowKey,
  containerClassName = "",
}: DataTableProps) {
  const count = data.length;

  return (
    <section
      className={`bg-white border border-gray-200 rounded-2xl shadow-sm w-full overflow-hidden ${containerClassName}`}
    >
      {/* Loading state */}
      {loading && (
        <div className="px-6 py-8 text-center text-sm text-gray-600">
          Loading…
        </div>
      )}

      {/* Empty state */}
      {!loading && !data.length && (
        <div className="px-6 py-8 text-center text-sm text-gray-600">
          {emptyMessage}
        </div>
      )}

      {/* Table */}
      {!loading && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-byu-navy">
            {/* Header */}
            <thead className="bg-slate-50 text-[13px] tracking-wide text-gray-500">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-3 text-left whitespace-nowrap ${
                      col.headerClassName || ""
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={
                    getRowKey ? getRowKey(row, rowIndex) : row.id ?? rowIndex
                  }
                  className="hover:bg-byu-royal/10 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-3 align-middle text-gray-700 whitespace-nowrap ${
                        col.cellClassName || ""
                      }`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
