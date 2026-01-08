"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRole } from "@/app/providers/RoleProvider";
import { FiChevronDown, FiShoppingCart } from "react-icons/fi";

const HeaderBar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projectRequestsOpen, setProjectRequestsOpen] = useState(false);

  // refs + measured left padding for desktop white nav
  const logoRef = useRef<HTMLAnchorElement | null>(null);
  const [navPadLeft, setNavPadLeft] = useState<number>(128); // fallback ~ px-32

  // role state
  const { role, setRole } = useRole();
  const isEmployee = role === "employee";

  useLayoutEffect(() => {
    const update = () => {
      const el = logoRef.current;
      if (!el) return;

      const rem =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const mr4 = 1 * rem;

      const pad = el.offsetWidth + mr4;
      setNavPadLeft(pad);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="w-full sticky top-0 z-50">
      {/* Top navy bar */}
      <header className="relative w-full md:w-screen bg-byu-navy text-white py-4 shadow-md">
        <div className="px-6 flex items-center justify-between">
          {/* Left: BYU Logo + Title */}
          <div className="flex items-center">
            <a
              ref={logoRef}
              href="https://www.byu.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="mr-4 pr-4 border-r-[1px] border-byu-royal"
            >
              <img
                src="/BYU_monogram_white.svg"
                alt="BYU logo"
                className="h-10 w-auto"
              />
            </a>
            <h1 className="text-2xl">Experiential Learning Center</h1>
          </div>

          {/* Right side: static label + mobile hamburger */}
          <div className="flex items-center gap-3 pr-6 text-base">
            <div className="hidden sm:flex items-center gap-3 text-white/80">
              <span>
                Welcome,{" "}
                <span className="text-white font-medium">
                  {isEmployee ? "Employee" : "Student"}
                </span>
              </span>

              {/* Role toggle */}
              <button
                type="button"
                onClick={() => setRole(isEmployee ? "student" : "employee")}
                className="relative inline-flex h-6 w-12 items-center rounded-full bg-white/25 transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label="Toggle role"
                aria-pressed={isEmployee}
              >
                <span className="sr-only">
                  Toggle between Student and Employee view
                </span>
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    isEmployee ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Cart icon */}
            <Link
              href="/cart"
              className="hidden sm:inline-flex items-center justify-center p-2  focus:outline-none cursor-pointer"
              aria-label="View cart"
            >
              <FiShoppingCart className="h-6 w-6 text-white" />
            </Link>

            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded md:hidden hover:bg-white/10 focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="text-xl" aria-hidden="true">
                {mobileOpen ? "✕" : "☰"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden w-full bg-white text-byu-navy shadow border-t"
        >
          <nav className="flex flex-col py-2 text-base font-medium">
            {/* Home */}
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="px-6 py-4 text-left hover:bg-[#FAFAFA]"
            >
              Home
            </Link>

            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="px-6 py-4 text-left hover:bg-[#FAFAFA] flex items-center gap-2"
            >
              <FiShoppingCart className="h-5 w-5 text-byu-navy mr-3" />
              <span>Cart</span>
            </Link>

            <Link
              href="/inventory"
              onClick={() => setMobileOpen(false)}
              className="px-6 py-4 text-left hover:bg-[#FAFAFA]"
            >
              Inventory
            </Link>

            <Link
              href="/labEquipment"
              onClick={() => setMobileOpen(false)}
              className="px-6 py-4 text-left hover:bg-[#FAFAFA]"
            >
              Lab Equipment
            </Link>

            {/* Project Requests with nested items */}
            <button
              type="button"
              onClick={() => setProjectRequestsOpen((open) => !open)}
              className={`flex items-center justify-between px-6 py-4 text-left hover:bg-[#FAFAFA] ${
                projectRequestsOpen ? "bg-[#FAFAFA]" : ""
              }`}
            >
              <span>Project Requests</span>
              <FiChevronDown
                className="w-4 h-4 text-byu-navy"
                aria-hidden="true"
              />
            </button>

            {projectRequestsOpen && (
              <div className="flex flex-col text-sm">
                <Link
                  href="/3Dprint"
                  onClick={() => {
                    setProjectRequestsOpen(false);
                    setMobileOpen(false);
                  }}
                  className="px-10 py-2 text-left text-byu-navy hover:bg-[#FAFAFA]"
                >
                  3D Print
                </Link>
                <Link
                  href="/PCBmill"
                  onClick={() => {
                    setProjectRequestsOpen(false);
                    setMobileOpen(false);
                  }}
                  className="px-10 py-2 text-left text-byu-navy hover:bg-[#FAFAFA]"
                >
                  PCB Mill
                </Link>
                <Link
                  href="/laserCut"
                  onClick={() => {
                    setProjectRequestsOpen(false);
                    setMobileOpen(false);
                  }}
                  className="px-10 py-2 text-left text-byu-navy hover:bg-[#FAFAFA]"
                >
                  Laser Cut
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* White nav bar – desktop only */}
      <nav className="hidden md:block w-full bg-white text-byu-navy shadow">
        <div
          className="flex text-base font-medium px-6"
          style={{ paddingLeft: navPadLeft }}
        >
          {/* Home tab */}
          <Link
            href="/"
            className="px-8 py-4 hover:bg-[#FAFAFA] nav-link-hover"
          >
            Home
          </Link>

          {/* Inventory tab */}
          <Link
            href="/inventory"
            className="px-8 py-4 hover:bg-[#FAFAFA] nav-link-hover"
          >
            Inventory
          </Link>

          {/* Lab Equipment tab */}
          <Link
            href="/labEquipment"
            className="px-8 py-4 hover:bg-[#FAFAFA] nav-link-hover"
          >
            Lab Equipment
          </Link>

          {/* Project Requests tab with dropdown */}
          <div className="relative">
            <button
              type="button"
              className={`px-8 py-4 hover:bg-[#FAFAFA] nav-link-hover inline-flex items-center gap-2 ${
                projectRequestsOpen ? "bg-[#FAFAFA] nav-link-active" : ""
              }`}
              onClick={() => setProjectRequestsOpen((open) => !open)}
            >
              <span>Project Requests</span>
              <FiChevronDown
                className="w-3 h-3 text-byu-navy"
                aria-hidden="true"
              />
            </button>

            {projectRequestsOpen && (
              <div className="absolute left-0 top-full mt-0 w-64 bg-white border border-gray-200 shadow-lg">
                <Link
                  href="/3Dprint"
                  onClick={() => setProjectRequestsOpen(false)}
                  className="block w-full text-left px-6 py-3 text-byu-navy hover:bg-gray-50"
                >
                  3D Print
                </Link>
                <Link
                  href="/PCBmill"
                  onClick={() => setProjectRequestsOpen(false)}
                  className="block w-full text-left px-6 py-3 text-byu-navy hover:bg-gray-50"
                >
                  PCB Mill
                </Link>
                <Link
                  href="/laserCut"
                  onClick={() => setProjectRequestsOpen(false)}
                  className="block w-full text-left px-6 py-3 text-byu-navy hover:bg-gray-50"
                >
                  Laser Cut
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default HeaderBar;
