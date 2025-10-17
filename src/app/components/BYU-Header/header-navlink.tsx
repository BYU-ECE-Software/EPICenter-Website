"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HeaderNavLink = ({ text, href }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center px-7 h-full transition relative
          ${isActive ? "border-b-3 border-byu-navy font-semibold" : ""}
          hover:bg-gray-100`}
    >
      {text}
    </Link>
  );
};

export default HeaderNavLink;