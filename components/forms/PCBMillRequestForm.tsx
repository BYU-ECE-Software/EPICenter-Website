"use client";

import type { Dispatch, SetStateAction } from "react";
import FormModal from "@/components/FormModal";
import type { FormModalField } from "@/components/FormModal";

export type PcbMillFormValues = {
  requestName: string;
  requestEmail: string;
  file: File | null;

  pcbSiding: "single" | "double";
  boardQuantity: string;
  silkscreen: "no" | "yes";
  boardArea: string;
  rubout: "no" | "yes";

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

  // Controlled form state
  values: PcbMillFormValues;
  setValues: Dispatch<SetStateAction<PcbMillFormValues>>;

  // Parent-controlled submit state
  saving?: boolean;
  submitDisabled?: boolean;
  errors?: Record<string, string>;

  // Parent supplies the computed estimate
  ratePerIn2Text: string;
  costEstimateText: string;

  // Optional copy overrides
  title?: string;
  saveLabel?: string;
  size?: "sm" | "md" | "lg";

  // For edit mode: show existing file + download button (not editable)
  existingFileName?: string;
  onDownloadFile?: () => void;
};

export default function PcbMillRequestFormModal({
  mode,
  open,
  onClose,
  onSubmit,
  values,
  setValues,
  saving = false,
  submitDisabled,
  errors,
  ratePerIn2Text,
  costEstimateText,
  title,
  saveLabel,
  size = "lg",
  existingFileName,
  onDownloadFile,
}: Props) {
  // Gap spacing used in option labels
  const gap = "\u2007\u2007\u2007\u2007\u2007";

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
            <div className="text-left mb-5">
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

        // CREATE MODE: normal file picker (your existing UI)
        return (
          <div className="text-left mb-5">
            <label className="block text-sm font-medium text-byu-navy mb-1">
              Gerber Files *
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Submit a .zip containing your Gerber files
            </p>

            <p className="text-sm text-gray-600 mb-3 font-medium">
              We have UPDATED DESIGN CONSTRAINTS for your PCB designs. Please
              use{" "}
              <a
                href={process.env.NEXT_PUBLIC_PCB_MILL_INSTRUCTIONS_URL}
                className="text-blue-600 underline hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                this link
              </a>{" "}
              and follow this 5 minute guide BEFORE submitting your PCB.
            </p>

            <div className="flex items-center gap-3 mb-2">
              <label className="inline-flex items-center justify-center rounded-sm bg-gray-100 border border-black px-2 py-1 text-sm text-black cursor-pointer hover:bg-gray-200 transition">
                Choose file
                <input
                  type="file"
                  className="hidden"
                  accept=".zip"
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

            <p className="text-xs text-gray-600 mb-3 mt-6">
              NOTE ABOUT SILKSCREEN: Our silkscreens are produced by MILLING on
              the FR4 surface (opposite side to the copper).{" "}
              <span className="font-semibold">
                IF YOUR SILKSREEN IS ON THE SAME SIDE AS YOUR COPPER, TEXT WILL
                BE MIRRORED.
              </span>
            </p>
          </div>
        );
      },
    },

    // Row 1: Board Area + Board Quantity
    {
      key: "boardArea",
      label: "Board Area (in²)",
      required: true,
      type: "number",
      adornment: { text: "in²", position: "end" },
    },
    {
      key: "boardQuantity",
      label: "Board Quantity",
      required: true,
      type: "number",
    },

    // Row 2: PCB Siding + Silkscreen
    {
      key: "pcbSiding",
      label: "PCB Siding",
      required: true,
      kind: "select",
      options: [
        { label: `Single Sided${gap}$0.40/in²`, value: "single" },
        {
          label: `Double Sided${"\u2007\u2007\u2007\u2007"}$0.80/in²`,
          value: "double",
        },
      ],
    },
    {
      kind: "custom",
      key: "silkscreen",
      render: () => {
        const disabled = values.pcbSiding === "double";

        return (
          <div className={`text-left ${disabled ? "opacity-70" : ""}`}>
            <label className="block text-sm font-medium text-byu-navy mb-1">
              Silkscreen (only for Single Sided){" "}
              {values.pcbSiding === "single" ? "*" : null}
            </label>

            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
              value={values.silkscreen}
              disabled={disabled}
              onChange={(e) =>
                setValues((p) => ({
                  ...p,
                  silkscreen: e.target.value as "no" | "yes",
                }))
              }
            >
              <option value="no">No</option>
              <option value="yes">Yes{gap}+ $0.20/in²</option>
            </select>

            {disabled ? (
              <p className="mt-1 text-xs text-gray-500">
                Silkscreen is only available for Single Sided boards.
              </p>
            ) : null}
          </div>
        );
      },
    },

    // Row 3: Rubout + Cost Estimate
    {
      key: "rubout",
      label: "Rubout",
      kind: "select",
      options: [
        { label: "No", value: "no" },
        { label: `Yes${gap}+ $0.10/in²`, value: "yes" },
      ],
    },
    {
      kind: "custom",
      key: "costEstimate",
      render: () => (
        <div className="text-left">
          <div className="rounded-md border border-byu-royal/20 bg-byu-royal/5 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-byu-navy/80">
                Cost estimate
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
              <span>
                Rate: <span className="font-medium">{ratePerIn2Text}</span>
              </span>
              <span className="text-lg font-extrabold text-byu-navy">
                {costEstimateText}
              </span>
            </div>
          </div>
        </div>
      ),
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
              <label className="block text-sm font-medium text-byu-navy mb-1">
                Additional Comments
              </label>

              <p className="mt-0.5 text-xs text-gray-500 mb-2">
                If this is an RF board, you MUST specify here.
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
            {/* Requestor comments (only show if they exist) */}
            {hasRequestorComments ? (
              <div>
                <label className="block text-sm font-medium text-byu-navy mb-1">
                  Requestor comments
                </label>

                <div className="w-full rounded-md py-2 text-xs text-gray-700 whitespace-pre-wrap">
                  {values.comments}
                </div>
              </div>
            ) : null}

            {/* Technician Notes (always show in edit mode) */}
            <div className={hasRequestorComments ? "mt-5" : ""}>
              <label className="block text-sm font-medium text-byu-navy mb-1">
                Technician Notes
              </label>

              <p className="mt-0.5 text-xs text-gray-500 mb-2">
                This field is hidden from the customer
              </p>

              <textarea
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                placeholder="Optional notes..."
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
    (mode === "create" ? "New PCB Mill Request" : "Edit PCB Mill Request");

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
