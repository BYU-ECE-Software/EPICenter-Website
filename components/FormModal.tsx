"use client";

import { useState, type ReactNode } from "react";
import BaseModal from "@/components/BaseModal";
import { FiEye, FiEyeOff } from "react-icons/fi";

// Modal sizing options passed straight through to BaseModal
type ModalSize = "sm" | "md" | "lg";

// Supported built-in input types
type FieldType = "text" | "email" | "number" | "date" | "textarea" | "pin";

// Optional adornment (prefix/suffix)
type Adornment = {
  text: string;
  position: "start" | "end";
};

// Shared properties for all non-custom fields
type BaseField = {
  key: string;
  label: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  colSpan?: 1 | 2;
  adornment?: Adornment;
};

// Standard input-based field definition
type InputField = BaseField & {
  kind?: "input";
  type?: FieldType; // default "text"
};

// Select field definition (dropdown)
type SelectOption = {
  label: string;
  value: string;
};

type SelectField = BaseField & {
  kind: "select";
  options: SelectOption[];
};

// Custom field definition for complex layouts (file pickers, previews, etc.)
type CustomField = {
  kind: "custom";
  key: string;
  colSpan?: 1 | 2;
  render: () => ReactNode;
};

// Union of all supported field types
export type FormModalField = InputField | SelectField | CustomField;

// Props for the FormModal component
type FormModalProps<T extends Record<string, any>> = {
  open: boolean;
  title: string;
  size?: ModalSize;
  saving?: boolean;
  saveLabel?: string;
  submitDisabled?: boolean;
  onClose: () => void;
  onSubmit?: () => void;

  values: T;
  setValues: (next: T) => void;

  fields: FormModalField[];

  errors?: Partial<Record<keyof T, string>>;
};

// Centralized Styling
const LABEL_CLASS = "block text-sm font-medium text-byu-navy mb-1";
const INPUT_CLASS =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm " +
  "focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal";
const ERROR_CLASS = "mt-1 text-xs text-red-600";

export default function FormModal<T extends Record<string, any>>({
  open,
  title,
  size = "lg",
  saving = false,
  saveLabel = "Save",
  submitDisabled = false,
  onClose,
  onSubmit,
  values,
  setValues,
  fields,
  errors,
}: FormModalProps<T>) {
  const setFieldValue = (key: string, value: any) => {
    setValues({ ...values, [key]: value });
  };

  // Whether to show or hide a pin
  const [pinVisible, setPinVisible] = useState<Record<string, boolean>>({});
  const isPinVisible = (key: string) => Boolean(pinVisible[key]);
  const togglePinVisible = (key: string) =>
    setPinVisible((p) => ({ ...p, [key]: !p[key] }));
  const sanitizePin = (raw: string) => raw.replace(/\D/g, "");

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      size={size}
      saving={saving}
      saveLabel={saveLabel}
      submitDisabled={submitDisabled}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => {
          const colSpan = field.colSpan ?? 1;
          const colClass = colSpan === 2 ? "md:col-span-2" : "";

          if ("kind" in field && field.kind === "custom") {
            return (
              <div key={field.key} className={colClass}>
                {field.render()}
              </div>
            );
          }

          const value = values[field.key] ?? "";
          const errorText = errors?.[field.key as keyof T];

          const hasAdornment = Boolean(field.adornment?.text);
          const adornPos = field.adornment?.position ?? "start";

          const inputPaddingClass = hasAdornment
            ? adornPos === "start"
              ? "pl-7 pr-3"
              : "pl-3 pr-7"
            : "px-3";

          const fieldClass = [
            "w-full rounded-md border border-gray-300 py-2 text-sm",
            inputPaddingClass,
            "focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal",
          ].join(" ");

          return (
            <div key={field.key} className={colClass}>
              <label className="flex items-baseline gap-2 mb-1">
                <span className={LABEL_CLASS}>
                  {field.label} {field.required ? "*" : null}
                </span>

                {field.helperText ? (
                  <span className="block text-left text-xs text-gray-500 font-normal">
                    {field.helperText}
                  </span>
                ) : null}
              </label>

              {field.kind === "select" ? (
                <select
                  className={INPUT_CLASS}
                  value={value}
                  onChange={(e) => setFieldValue(field.key, e.target.value)}
                >
                  {field.placeholder ? (
                    <option value="" disabled>
                      {field.placeholder}
                    </option>
                  ) : null}

                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <div className={hasAdornment ? "relative" : undefined}>
                  {hasAdornment ? (
                    <span
                      className={[
                        "pointer-events-none absolute top-3 text-sm text-gray-500",
                        adornPos === "start" ? "left-3" : "right-3",
                      ].join(" ")}
                    >
                      {field.adornment!.text}
                    </span>
                  ) : null}

                  <textarea
                    rows={3}
                    className={fieldClass}
                    placeholder={field.placeholder ?? ""}
                    value={value}
                    onChange={(e) => setFieldValue(field.key, e.target.value)}
                  />
                </div>
              ) : field.type === "pin" ? (
                <div className="relative">
                  <input
                    type={isPinVisible(field.key) ? "text" : "password"}
                    className={INPUT_CLASS + " pr-10"}
                    placeholder={field.placeholder ?? ""}
                    value={value}
                    onChange={(e) =>
                      setFieldValue(field.key, sanitizePin(e.target.value))
                    }
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />

                  <button
                    type="button"
                    onClick={() => togglePinVisible(field.key)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-gray-700"
                    aria-label={
                      isPinVisible(field.key) ? "Hide PIN" : "Show PIN"
                    }
                    title={isPinVisible(field.key) ? "Hide" : "Show"}
                  >
                    {isPinVisible(field.key) ? (
                      <FiEyeOff className="h-4 w-4" />
                    ) : (
                      <FiEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ) : (
                <div className={hasAdornment ? "relative" : undefined}>
                  {hasAdornment ? (
                    <span
                      className={[
                        "pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm text-gray-500",
                        adornPos === "start" ? "left-3" : "right-3",
                      ].join(" ")}
                    >
                      {field.adornment!.text}
                    </span>
                  ) : null}

                  <input
                    type={field.type ?? "text"}
                    className={hasAdornment ? fieldClass : INPUT_CLASS}
                    placeholder={field.placeholder ?? ""}
                    value={value}
                    onChange={(e) => setFieldValue(field.key, e.target.value)}
                    inputMode={
                      (field.type ?? "text") === "number"
                        ? "decimal"
                        : undefined
                    }
                  />
                </div>
              )}

              {errorText ? <p className={ERROR_CLASS}>{errorText}</p> : null}
            </div>
          );
        })}
      </div>
    </BaseModal>
  );
}
