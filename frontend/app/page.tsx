import Link from "next/link";
import { ArrowRight, Building2, Droplet, Wifi, Thermometer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClockWidget } from "@/components/clock-widget";

export default function HomePage() {
  const monitoringItems = [
    {
      id: 1,
      title: "Water Leakage",
      hostel: "Nilgiri Hostel, Room 204",
      time: "10m ago",
      status: "In Progress",
      statusColor: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
      icon: Droplet,
      iconColor: "text-amber-400 bg-amber-500/10"
    },
    {
      id: 2,
      title: "WiFi Router Offline",
      hostel: "Kanchanjunga Hostel, Block C",
      time: "1h ago",
      status: "Resolved",
      statusColor: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
      icon: Wifi,
      iconColor: "text-emerald-400 bg-emerald-500/10"
    },
    {
      id: 3,
      title: "Geyser Malfunction",
      hostel: "Dhansiri Hostel, Room 102",
      time: "3h ago",
      status: "Pending Warden",
      statusColor: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
      icon: Thermometer,
      iconColor: "text-blue-400 bg-blue-500/10"
    }
  ];

  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80"
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Grand Animated Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=3270&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/90 to-[#1a2e6e]/90" />
      <div className="absolute -left-20 top-24 h-96 w-96 rounded-full bg-blue-500/20 blur-[100px]" />
      <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[120px]" />
      <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />
      
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-3xl font-bold tracking-tight text-white leading-tight">TU Hostel Complaint Management System</p>
              <p className="text-xs font-medium text-blue-300 mt-1">Tezpur University</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-blue-200 backdrop-blur-md sm:flex">
              <ClockWidget />
            </div>
            <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex flex-1 flex-col justify-center py-12 lg:py-20">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">

              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
                A grand vision for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Tezpur University</span> hostel care.
              </h1>
              <p className="mt-6 text-lg leading-8 text-blue-100/70 sm:text-xl">
                TU Hostel Complaint Management System replaces fragmented complaint books with a unified, real-time institutional clock system. Students, Wardens, Departments, DSW, and the Vice Chancellor all connected through one seamless interface.
              </p>
              
              <div className="mt-10 flex flex-wrap gap-4">
                <Button asChild size="lg" className="h-14 rounded-2xl bg-blue-600 px-8 text-base hover:bg-blue-500">
                  <Link href="/login">
                    Access Portal
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 rounded-2xl border-white/20 bg-white/5 px-8 text-base text-white backdrop-blur-md hover:bg-white/10">
                  <Link href="/signup">Register Account</Link>
                </Button>
              </div>
            </div>

            {/* Hero Card Visual */}
            <div className="w-full max-w-xl lg:ml-auto">
              <div className="relative rounded-[2.5rem] border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-xl">
                <div className="absolute -inset-0.5 rounded-[2.5rem] bg-gradient-to-br from-blue-500/30 to-purple-600/30 opacity-50 blur-xl" />
                <div className="relative rounded-[2.25rem] border border-white/10 bg-slate-900/50 p-6 sm:p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">Central Operations</h3>
                      <p className="text-sm text-blue-200/60">Cross-Hostel Technical Monitor</p>
                    </div>
                    <Building2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    {monitoringItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/10">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconColor}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                            <p className="text-xs text-blue-200/60 truncate">{item.hostel} • {item.time}</p>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
                    <div className="flex -space-x-3">
                      {avatars.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Student Avatar ${i + 1}`}
                          className="h-10 w-10 rounded-full border-2 border-slate-950 object-cover"
                        />
                      ))}
                    </div>
                    <div className="text-sm font-medium text-blue-300">
                      Join 2,000+ Students
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/10 py-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Tezpur University. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm text-slate-500 sm:mt-0">
            <Link href="#" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/login?autofill=vc" className="hover:text-white transition">Admin Portal</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
