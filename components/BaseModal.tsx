"use client";

import type { ReactNode, KeyboardEvent, FormEvent } from "react";

type ModalSize = "sm" | "md" | "lg";

type BaseModalProps = {
  open: boolean;
  title?: string;
  saving?: boolean;
  saveLabel?: string;
  size?: ModalSize;
  submitDisabled?: boolean;
  onClose: () => void;
  onSubmit?: () => void; // parent handles actual submit
  children: ReactNode;
  footer?: ReactNode; // optional custom footer; if not provided, use default Cancel/Save
};

export default function BaseModal({
  open,
  title = "",
  saving = false,
  saveLabel = "Save",
  size = "md",
  submitDisabled = false,
  onClose,
  onSubmit,
  children,
  footer,
}: BaseModalProps) {
  if (!open) return null;

  const sizeClass =
    size === "sm" ? "max-w-md" : size === "lg" ? "max-w-2xl" : "max-w-lg";

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  const titleId = title ? "base-modal-title" : undefined;

  return (
    <div
      className="fixed inset-0 z-50"
      onKeyDown={handleKeyDown}
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      {/* Modal container */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={`w-full rounded-2xl shadow-2xl overflow-hidden bg-white border border-byu-navy ${sizeClass}`}
          onClick={(e) => e.stopPropagation()} // prevent backdrop click
        >
          {/* Header */}
          <div className="px-5 py-4 border-b bg-byu-navy flex items-center justify-between">
            <div className="flex items-start gap-2.5">
              {title && (
                <h3 id={titleId} className="text-lg font-semibold text-white">
                  {title}
                </h3>
              )}
            </div>

            <button
              type="button"
              className="p-2 rounded-lg hover:bg-[#335A86] transition cursor-pointer"
              onClick={onClose}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 8.586 5.293 3.879 3.879 5.293 8.586 10l-4.707 4.707 1.414 1.414L10 11.414l4.707 4.707 1.414-1.414L11.414 10l4.707-4.707-1.414-1.414L10 8.586z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Body + form */}
          <form className="px-5 py-4 space-y-4" onSubmit={handleSubmit}>
            {/* Your form fields go here */}
            {children}

            {/* Divider */}
            <div className="h-px bg-gray-200" />

            {/* Footer */}
            {footer ? (
              footer
            ) : (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-3 py-1 rounded-lg border text-byu-navy hover:bg-gray-50 transition cursor-pointer"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || submitDisabled}
                  className="px-3 py-1 rounded-lg bg-byu-royal text-white enabled:hover:bg-[#003C9E] shadow-sm transition enabled:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {saving ? "Saving…" : saveLabel}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
