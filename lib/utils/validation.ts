export type IntValidation = {
  raw: string;
  has: boolean;
  num: number;
  isNumber: boolean;
  isInteger: boolean;
  atLeastOne: boolean;
  isValid: boolean;
};

/**
 * Validates a positive integer (>= 1) coming from a string input.
 * Designed for form inputs where values are stored as strings.
 */
export function validatePositiveInt(raw: string): IntValidation {
  const v = raw.trim();
  const n = Number(v);
  const has = v.length > 0;
  const isNumber = has && Number.isFinite(n);
  const isInteger = isNumber && Number.isInteger(n);
  const atLeastOne = isNumber && n >= 1;

  return {
    raw: v,
    has,
    num: isNumber ? n : 0,
    isNumber,
    isInteger,
    atLeastOne,
    isValid: isInteger && atLeastOne,
  };
}

/**
 * Returns a user-facing error string for a positive integer field.
 * Empty string means "no error".
 */
export function positiveIntError(
  v: IntValidation,
  label: string = "value",
): string {
  if (!v.has) return "";
  if (!v.isNumber) return "Enter a number.";
  if (!v.isInteger) return "Enter a whole number.";
  if (!v.atLeastOne) return `Enter a ${label} of 1 or more.`;
  return "";
}

/**
 * Simple email validation.
 * - Not RFC-perfect, but avoids most obvious invalid input.
 * - Requires: one "@", at least one ".", and at least 2 chars after last "."
 */
export function isEmailValid(email: string): boolean {
  const v = email.trim();
  if (!v) return false;

  // no spaces
  if (/\s/.test(v)) return false;

  // simple structure check
  const at = v.indexOf("@");
  if (at <= 0) return false; // must have something before @

  const dot = v.lastIndexOf(".");
  if (dot < at + 2) return false; // dot must be after @ with at least 1 char between
  if (dot >= v.length - 2) return false; // need at least 2 chars after last dot

  return true;
}

/**
 * Returns user-facing error string for email.
 * Empty string means "no error".
 */
export function emailError(email: string): string {
  const v = email.trim();
  if (!v) return ""; // don't show error until they type something
  return isEmailValid(v) ? "" : "Enter a valid email.";
}
