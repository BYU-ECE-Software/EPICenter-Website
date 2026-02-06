"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function CountBadge({ children, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${className}`}
    >
      {children}
    </span>
  );
}
