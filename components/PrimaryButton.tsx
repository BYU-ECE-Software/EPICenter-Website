"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = {
  label?: string;
  icon?: ReactNode;
  bgClass?: string; // main background (default BYU royal)
  hoverBgClass?: string; // hover background
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function PrimaryButton({
  label,
  icon,
  bgClass = "bg-byu-royal text-white",
  hoverBgClass = "hover:bg-[#003C9E]",
  disabled,
  type = "button",
  children,
  className = "",
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3 py-1 font-medium rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${bgClass} ${hoverBgClass} ${className}`}
      {...rest}
    >
      {/* Optional icon */}
      {icon && <span className="flex items-center">{icon}</span>}

      {/* Label or children */}
      {label ? <span>{label}</span> : children}
    </button>
  );
}
