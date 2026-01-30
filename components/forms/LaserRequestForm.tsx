"use client";

import type { Dispatch, SetStateAction } from "react";
import FormModal from "@/components/FormModal";
import type { FormModalField } from "@/components/FormModal";

/** Shape for the Laser Cut form values */
export type LaserCutFormValues = {
  requestName: string;
  requestEmail: string;

  // keep key name consistent with existing code ("file")
  file: File | null;

  confirmedCalendar: boolean;
  confirmedResponsibility: boolean;

  comments: string;
  technicianNotes: string;
};

type Props = {
  mode: "create" | "edit";

  // modal wiring
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;

  // controlled form state from parent
  values: LaserCutFormValues;
  setValues: Dispatch<SetStateAction<LaserCutFormValues>>;

  // optional props that parent controls
  saving?: boolean;
  submitDisabled?: boolean;
  errors?: Record<string, string>;

  // optional overrides (if parent wants custom copy)
  title?: string;
  saveLabel?: string;
  size?: "sm" | "md" | "lg";

  // For edit mode: show existing file + download button (not editable)
  existingFileName?: string;
  onDownloadFile?: () => void;
};

export default function LaserCutRequestFormModal({
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
  // Fields passed into FormModal
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

        // CREATE MODE: normal file picker (your existing UI)
        return (
          <div className="text-left">
            <label className="block text-sm font-medium text-byu-navy mb-1">
              Cut File *
            </label>
            <p className="text-xs text-gray-600 mb-3">
              We accept .svg and .pdf
            </p>

            <div className="flex items-center gap-3 mb-2">
              <label className="inline-flex items-center justify-center rounded-sm bg-gray-100 border border-black px-2 py-1 text-sm text-black cursor-pointer hover:bg-gray-200 transition">
                Choose file
                <input
                  type="file"
                  className="hidden"
                  accept=".svg,.pdf"
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

            {errors?.file ? (
              <p className="mt-1 text-xs text-red-600">{errors.file}</p>
            ) : null}
          </div>
        );
      },
    },

    // Big process explanation + link to sheet
    {
      kind: "custom",
      key: "processAndCalendar",
      colSpan: 2,
      render: () => (
        <div className="text-left mt-2">
          <label className="block text-sm font-semibold text-byu-navy mb-2">
            How the process works
          </label>

          <div className="space-y-5 text-sm text-gray-700">
            <div>
              <p className="font-medium text-byu-navy">Process</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>
                  Sign up for a time on the{" "}
                  <a
                    href={process.env.NEXT_PUBLIC_LASER_SCHEDULE_SHEET_VIEW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Google Sheets
                  </a>
                  .
                </li>
                <li>
                  Come meet with a shop tech at the time you signed up and
                  process your job.
                </li>
                <li>You are required to be present during the entire cut.</li>
                <li>
                  If you are not able to be present, a shop tech can watch your
                  job for $20/hour.
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-byu-navy">Material</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>You are responsible for providing your own material.</li>
                <li>
                  There is a limited selection of material in stock that you can
                  purchase from the EPICenter.
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-byu-navy">Disallowed materials</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>PVC - emits pure chlorine gas</li>
                <li>ABS - emits cyanide gas</li>
                <li>HDPE - melts and catches fire</li>
                <li>PolyStyrene foam - catches fire</li>
                <li>Polypropylene foam - catches fire</li>
                <li>Fiberglass - emits fumes</li>
              </ul>
              <p className="mt-1 text-xs text-gray-500">
                *please do not bring in any unidentified material
              </p>
            </div>

            <div>
              <p className="font-medium text-byu-navy">
                Common and safe materials
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Acrylic</li>
                <li>Most woods (max thickness for cutting = 1/4")</li>
                <li>Foamboard</li>
                <li>Cardboard</li>
                <li>Paper/Cardstock</li>
                <li>Leather</li>
                <li>Magnetic sheet</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-byu-navy">Metal etching</p>
              <p className="mt-1">
                Our laser cutter is not powerful enough to cut or etch metal
              </p>
            </div>

            <div>
              <p className="font-medium text-byu-navy">Other considerations</p>
              <p className="mt-1">
                We will not process jobs that take over 8 hours. You'll need to
                divide these jobs into shorter jobs.
              </p>
            </div>

            {/* Required checkboxes */}
            <div className="mt-6 space-y-3">
              <label className="block text-sm font-semibold text-byu-navy mb-2">
                Requirements *
              </label>

              <label className="flex items-start gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={values.confirmedCalendar}
                  onChange={(e) =>
                    setValues((p) => ({
                      ...p,
                      confirmedCalendar: e.target.checked,
                    }))
                  }
                />
                <span>I have submitted a time on the scheduling calendar.</span>
              </label>

              <label className="flex items-start gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={values.confirmedResponsibility}
                  onChange={(e) =>
                    setValues((p) => ({
                      ...p,
                      confirmedResponsibility: e.target.checked,
                    }))
                  }
                />
                <span>
                  I understand that I am responsible for watching my laser cut
                  the entire time (unless I want to pay a $20/hour fee)
                </span>
              </label>

              {(!values.confirmedCalendar ||
                !values.confirmedResponsibility) && (
                <p className="text-xs text-gray-500">
                  Both acknowledgements must be checked before submitting.
                </p>
              )}
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
              <label className="block text-sm font-medium text-byu-navy mt-4 mb-1">
                Additional Comments
              </label>

              <p className="mt-0.5 text-xs text-gray-500 mb-2">
                Use this to note any special settings (cutting speed, power
                level, # of passes raster infill, etc). Most jobs will work with
                our default settings.
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

              {errors?.comments ? (
                <p className="mt-1 text-xs text-red-600">{errors.comments}</p>
              ) : null}
            </div>
          );
        }

        // EDIT MODE: show requestor comments read-only (if any) + technician notes textarea
        const hasRequestorComments = Boolean(values.comments?.trim());

        return (
          <div className="text-left">
            {/* Requestor comments (only show if they exist) */}
            {hasRequestorComments ? (
              <div className="mt-4">
                <label className="block text-sm font-medium text-byu-navy mb-1">
                  Requestor comments
                </label>

                <div className="w-full rounded-md py-2 text-xs text-gray-700 whitespace-pre-wrap">
                  {values.comments}
                </div>
              </div>
            ) : null}

            {/* Technician Notes (always show in edit mode) */}
            <div className={hasRequestorComments ? "mt-5" : "mt-4"}>
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

  // Default copy differs slightly for create vs edit
  const computedTitle =
    title ??
    (mode === "create" ? "New Laser Cut Request" : "Edit Laser Cut Request");

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
