import Link from "next/link";
import React from "react";

const HeaderBreadcrumb = ({ text, href, last }: BreadcrumbProps) => {
  if (!last) {
    return (
        <Link
          href={href}
          className="pr-3 border-r border-byu-mediumGrey text-white"
        >
          {text}
        </Link>
    );
  } else {
    return (
        <Link href={href} className="pr-3 text-white">
          {text}
        </Link>
    );
  }
};

export default HeaderBreadcrumb;