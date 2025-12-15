"use client";

import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import type { InputHTMLAttributes } from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  widthClass?: string; // like "w-full sm:w-80"
  type?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "placeholder"
>;

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  widthClass = "w-full sm:w-80",
  type = "search",
  ...inputProps
}: SearchBarProps) {
  return (
    <div className={`relative ${widthClass}`}>
      {/* magnifying glass */}
      <HiOutlineMagnifyingGlass
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
        aria-hidden="true"
      />
      <input
        type={type}
        placeholder={placeholder}
        className="search-input w-full rounded-lg border border-byu-navy pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...inputProps}
      />
    </div>
  );
}
