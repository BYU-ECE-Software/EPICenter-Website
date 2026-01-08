"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AppRole = "student" | "employee";

type RoleContextValue = {
  role: AppRole;
  setRole: (r: AppRole) => void;
  isStudent: boolean;
  isEmployee: boolean;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<AppRole>("employee");

  // load saved role (dev-only simulation)
  useEffect(() => {
    const saved = window.localStorage.getItem("appRole");
    if (saved === "student" || saved === "employee") setRoleState(saved);
  }, []);

  const setRole = (r: AppRole) => {
    setRoleState(r);
    window.localStorage.setItem("appRole", r);
  };

  const value = useMemo(
    () => ({
      role,
      setRole,
      isStudent: role === "student",
      isEmployee: role === "employee",
    }),
    [role]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}
