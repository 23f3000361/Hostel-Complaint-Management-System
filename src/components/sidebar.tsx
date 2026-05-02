"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  LayoutDashboard,
  FileText,
  Bell,
  Settings,
  LogOut,
  HelpCircle,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  {
    label: "My Complaints",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "All Submissions",
    href: "/dashboard/submissions",
    icon: FileText,
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    badge: 3,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-4">
        <Button
          variant="outline"
          size="icon"
          className="bg-white shadow-lg border-gray-200 rounded-xl"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full flex flex-col transition-all duration-300 ease-in-out",
          "bg-[#1e2a4a]/80 backdrop-blur-2xl border-r border-white/10",
          collapsed ? "w-[72px]" : "w-[260px]",
          "max-lg:shadow-2xl",
          "max-lg:" + (collapsed ? "-translate-x-full" : "translate-x-0")
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-[#3366FF] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#3366FF]/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                DormFix
              </h1>
              <p className="text-[11px] text-blue-300/60 mt-0.5">
                Institutional Clock System
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "ml-auto hidden lg:flex w-7 h-7 items-center justify-center rounded-lg",
              "text-white/40 hover:text-white hover:bg-white/10 transition-all",
              collapsed && "ml-0 rotate-180"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            const isExactDashboard =
              item.href === "/dashboard" && pathname === "/dashboard";
            const active = isActive || isExactDashboard;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[#3366FF] text-white shadow-lg shadow-[#3366FF]/30"
                    : "text-blue-200/70 hover:text-white hover:bg-white/8"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0")} />
                {!collapsed && (
                  <>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Help */}
        <div className="px-3 pb-2">
          <button
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium",
              "text-blue-200/50 hover:text-white hover:bg-white/8 transition-all"
            )}
          >
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Help & Support</span>}
          </button>
        </div>

        {/* User Card */}
        <div className="px-3 pb-4">
          <div
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10",
              collapsed && "justify-center p-2"
            )}
          >
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarFallback className="bg-[#3366FF] text-white text-sm font-semibold">
                S
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    Demo User
                  </p>
                  <p className="text-[11px] text-blue-300/60">Student</p>
                </div>
                <Link
                  href="/login"
                  className="text-blue-200/40 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {!collapsed && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
}
