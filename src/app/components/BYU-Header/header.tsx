import Link from "next/link";
import Image from "next/image";
import { cloneElement } from "react";
import byuLogo from "@/public/byuLogoWhiteSmall.svg";

const Header = ({
  title,
  subtitle,
  breadcrumbs,
  rightItems,
  navLinks,
}: HeaderProps) => {
  if (breadcrumbs) {
    let lastBreadcrumb = breadcrumbs.pop();
    lastBreadcrumb = cloneElement(lastBreadcrumb, { last: true });

    breadcrumbs.push(lastBreadcrumb);
  }

  return (
    <div>
      <div className="bg-byu-navy text-white">
        <div className="flex items-stretch justify-between font-semibold p-3 border-b border-byu-mediumGrey">
          {/* Left side: logo and title */}
          <div className="flex items-stretch space-x-6">
            {/* Make this div stretch full height with a vertical border */}
            <div className="pr-6 border-r border-byu-mediumGrey flex items-center">
              <Link href="https://www.byu.edu" className="flex items-center">
                <Image src={byuLogo} alt="BYU" className="pl-2 h-5 w-auto" />
              </Link>
            </div>

            <div className="ml-1 flex flex-col justify-center">
              <div className="flex items-center space-x-3 text-md font-normal">
                {breadcrumbs}
              </div>
              <Link href="/" className="text-2xl font-bold hover:underline">
                {title}
              </Link>
              <h1 className="text-lg font-medium">{subtitle}</h1>
            </div>
          </div>

          {/* Right side: rightItems */}
          <div className="flex items-center text-end">{rightItems}</div>
        </div>
      </div>

      {navLinks && (
        <nav className="bg-white text-byu-navy text-md font-medium px-28 h-13 border-b-2 border-gray-200 flex">
          {navLinks}
        </nav>
      )}
    </div>
  );
};

export default Header;