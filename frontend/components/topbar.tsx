"use client";

import { useState, useEffect } from "react";
import { LogOut, User, Sun, Moon } from "lucide-react";
import { ClockWidget } from "@/components/clock-widget";
import { useAuth } from "@/lib/auth/client";

type TopbarProps = {
  userName?: string;
  userRole?: string;
};

export function Topbar({ userName, userRole }: TopbarProps) {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const displayUser = user?.name || userName || "Demo User";
  const displayRole = userRole || user?.role || "Student";

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Branding & Logo */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              TU Hostel Complaint Management System
            </h1>
            <p className="text-xs font-medium text-slate-500">
              <ClockWidget />
            </p>
          </div>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-sm font-bold text-slate-900 leading-none">{displayUser}</span>
              <span className="text-xs font-medium text-slate-500 mt-1 capitalize">{displayRole}</span>
            </div>
          </div>
          
          <div className="h-6 w-px bg-slate-200"></div>
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
}
