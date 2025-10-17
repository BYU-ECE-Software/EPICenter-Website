"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

const HeaderSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.closest("form")?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isShortcut =
        (isMac && e.metaKey && e.key === "k") ||
        (!isMac && e.ctrlKey && e.key === "k");

      if (isShortcut) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="ml-auto flex items-center mr-4 relative">
      <form
        action="/search"
        method="GET"
        className={`flex items-center bg-white rounded-full px-3 py-2 text-gray-500 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "w-[160px] sm:w-[200px]" : "w-10 justify-center"
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          name="q"
          placeholder="Search"
          className={`bg-transparent outline-none text-sm font-medium placeholder-gray-400 transition-opacity duration-200 ${
            isOpen ? "opacity-100 w-full ml-2" : "opacity-0 w-0"
          }`}
        />
        <button
          type={isOpen ? "submit" : "button"}
          className="text-gray-600 hover:text-gray-800"
          onClick={(e) => {
            if (!isOpen) {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
        >
          <Search className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default HeaderSearch;