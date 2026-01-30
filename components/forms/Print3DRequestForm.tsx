"use client";

import type { Dispatch, SetStateAction } from "react";
import FormModal from "@/components/FormModal";
import type { FormModalField } from "@/components/FormModal";

export type Print3DFormValues = {
  requestName: string;
  requestEmail: string;
  file: File | null;
  printQuantity: string;
  filamentColor: string;
  comments: string;
  technicianNotes: string;
};

type Props = {
  // Whether we're creating or editing
  mode: "create" | "edit";

  // Modal wiring
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;

  // Controlled form state (parent owns state so it can prefill for edit)
  values: Print3DFormValues;
  setValues: Dispatch<SetStateAction<Print3DFormValues>>;

  // Parent-controlled submit state
  saving?: boolean;
  submitDisabled?: boolean;

  // Optional errors passed into FormModal
  errors?: Record<string, string>;

  // Optional overrides for custom title/buttons in other pages
  title?: string;
  saveLabel?: string;
  size?: "sm" | "md" | "lg";

  // For edit mode: show existing file + download button (not editable)
  existingFileName?: string;
  onDownloadFile?: () => void;
};

export default function Print3DRequestFormModal({
  mode,
  open,
  onClose,
  onSubmit,
  values,
  setValues,
  saving = false,
  submitDisabled,
  errors,
  title,
  saveLabel,
  size = "lg",
  existingFileName,
  onDownloadFile,
}: Props) {
  const fields: FormModalField[] = [
    {
      key: "requestName",
      label: "Name",
      required: true,
    },
    {
      key: "requestEmail",
      label: "Email",
      required: true,
      type: "email",
    },

    // File (create = upload, edit = show existing + download)
    {
      kind: "custom",
      key: "file",
      colSpan: 2,
      render: () => {
        // EDIT MODE: show non-editable file row with download button
        if (mode === "edit") {
          const hasFile = Boolean(existingFileName);

          return (
            <div className="text-left">
              <div className="text-xs text-gray-500">Project File</div>

              <div className="mt-1 flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                <div className="min-w-0 truncate text-sm font-medium text-byu-navy">
                  {existingFileName ?? ""}
                </div>

                <button
                  type="button"
                  className="shrink-0 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                  onClick={() => onDownloadFile?.()}
                  disabled={!hasFile}
                  title={hasFile ? "Download" : "No file available"}
                >
                  Download
                </button>
              </div>
            </div>
          );
        }

        // CREATE MODE: normal file picker
        return (
          <div className="text-left">
            <label className="block text-sm font-medium text-byu-navy mb-1">
              Print File *
            </label>
            <p className="text-xs text-gray-600 mb-3">
              We accept .stl, .3mf, .stp
            </p>

            <div className="flex items-center gap-3 mb-2">
              <label className="inline-flex items-center justify-center rounded-sm bg-gray-100 border border-black px-2 py-1 text-sm text-black cursor-pointer hover:bg-gray-200 transition">
                Choose file
                <input
                  type="file"
                  className="hidden"
                  accept=".stl,.3mf,.stp"
                  onChange={(e) =>
                    setValues((p) => ({
                      ...p,
                      file: e.target.files?.[0] ?? null,
                    }))
                  }
                />
              </label>

              <div className="text-sm text-gray-700 truncate max-w-[22rem]">
                {values.file ? (
                  values.file.name
                ) : (
                  <span className="text-gray-400">No file selected</span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },

    {
      key: "printQuantity",
      label: "Print Quantity",
      required: true,
      type: "number",
    },
    {
      key: "filamentColor",
      label: "Filament Color (1st choice)",
      required: true,
    },

    // Comments (create = editable requestor comments, edit = read-only requestor + editable tech notes)
    {
      kind: "custom",
      key: "commentsBlock",
      colSpan: 2,
      render: () => {
        // CREATE MODE: keep exactly what you already have
        if (mode === "create") {
          return (
            <div className="text-left">
              <div className="mt-2 text-xs font-medium text-gray-600">
                <p>3D Prints cost $0.10 per gram.</p>
                <p className="mt-1.5">Infill set to 15%</p>
              </div>

              <label className="block text-sm font-medium text-byu-navy mt-5 mb-1">
                Additional Comments
              </label>

              <p className="mt-0.5 text-xs text-gray-500 mb-2">
                Use this to note any special settings (layer height, supports,
                orientation, etc). Most prints will work with our default
                settings.
              </p>

              <textarea
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                placeholder="Optional notes..."
                value={values.comments}
                onChange={(e) =>
                  setValues((p) => ({
                    ...p,
                    comments: e.target.value,
                  }))
                }
              />
            </div>
          );
        }

        // EDIT MODE: show requestor comments read-only (if any) + technician notes textarea
        const hasRequestorComments = Boolean(values.comments?.trim());

        return (
          <div className="text-left">
            <div className="mt-2 text-xs font-medium text-gray-600">
              <p>3D Prints cost $0.10 per gram.</p>
              <p className="mt-1.5">Infill set to 15%</p>
            </div>

            {/* Requestor comments (only show if they exist) */}
            {hasRequestorComments ? (
              <div className="mt-5">
                <label className="block text-sm font-medium text-byu-navy mb-1">
                  Requestor comments:
                </label>
                <div className="w-full rounded-md py-2 text-xs text-gray-700 whitespace-pre-wrap">
                  {values.comments}
                </div>
              </div>
            ) : null}

            {/* Technician Notes (always show in edit mode) */}
            <div className={hasRequestorComments ? "mt-5" : "mt-5"}>
              <label className="block text-sm font-medium text-byu-navy mb-1">
                Technician Notes
              </label>

              <p className="mt-0.5 text-xs text-gray-500 mb-2">
                This field is hidden from the customer
              </p>

              <textarea
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                placeholder="Optional Notes..."
                value={values.technicianNotes}
                onChange={(e) =>
                  setValues((p) => ({
                    ...p,
                    technicianNotes: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        );
      },
    },
  ];

  const computedTitle =
    title ??
    (mode === "create" ? "New 3D Print Request" : "Edit 3D Print Request");

  const computedSaveLabel =
    saveLabel ?? (mode === "create" ? "Submit Request" : "Save Changes");

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={computedTitle}
      size={size}
      saving={saving}
      saveLabel={computedSaveLabel}
      submitDisabled={submitDisabled}
      values={values}
      setValues={setValues}
      errors={errors}
      fields={fields}
    />
  );
}
