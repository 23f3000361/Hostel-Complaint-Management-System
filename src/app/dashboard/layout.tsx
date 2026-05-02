"use client";

import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Abstract Background Blobs for Glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10">
        <Sidebar />
        <main className="lg:ml-[260px] min-h-screen transition-all duration-300">
          <div className="max-w-4xl mx-auto px-6 py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
