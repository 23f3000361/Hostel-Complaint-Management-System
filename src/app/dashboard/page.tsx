"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, MapPin, LogOut } from "lucide-react";
import { FileComplaintForm } from "@/components/file-complaint-form";
import { ComplaintCard } from "@/components/complaint-card";

export default function DashboardPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [user, setUser] = useState<{name: string, role: string, roomNumber?: string} | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data on load
  const loadDashboardData = async () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    try {
      const response = await fetch("http://localhost:5000/api/complaints", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }
      
      const data = await response.json();
      
      // Map backend data to frontend UI format to keep it looking beautiful
      const mappedData = data.map((c: any) => ({
        id: `CMP-${new Date(c.createdAt).getFullYear()}-00${c.id}`,
        status: c.status === "Pending" ? "Filed" : c.status === "In Progress" ? "Work in Progress" : "Resolved",
        urgency: "Medium" as const, // Placeholder UI
        timeRemaining: c.status === "Resolved" ? "" : "2d 12h",
        hostel: "Your Hostel", 
        room: c.roomNumber || parsedUser.roomNumber || "N/A",
        category: c.category,
        description: c.title + (c.description ? ` - ${c.description}` : ""),
        currentStep: c.status === "Pending" ? 0 : c.status === "In Progress" ? 2 : 5,
        clockSegments: [{ label: "Warden", duration: "6h 0m", color: "bg-[#3366FF]" }],
        totalTime: "2d 0h",
        remainingTime: "1d 18h",
        healthPercent: 20,
        healthStatus: "HEALTHY" as const,
      }));

      setComplaints(mappedData.reverse());
    } catch (error) {
      console.error("Failed to fetch complaints", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // We listen to a custom event to refresh data when a new complaint is filed
    window.addEventListener('complaint-filed', loadDashboardData);
    return () => window.removeEventListener('complaint-filed', loadDashboardData);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null; // Avoid rendering flash before redirect

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3366FF] to-[#5588FF] flex items-center justify-center shadow-lg shadow-blue-200/50">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
            <p className="text-sm text-gray-500">
              Room {user.roomNumber || "N/A"} • Welcome, {user.name}
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* My Room Card */}
      <div className="mb-8 p-5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 shadow-xl shadow-blue-900/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3366FF]/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#3366FF]" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <span className="text-red-500">📍</span> My Room
            </h2>
            <p className="text-sm text-gray-600">
              Room {user.roomNumber || "N/A"}
            </p>
            <p className="text-xs text-gray-400">
              Context-Locked • {user.name}
            </p>
          </div>
        </div>
      </div>

      {/* File Complaint Form */}
      <div className="mb-10">
        <FileComplaintForm />
      </div>

      {/* Recent Submissions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            My Recent Submissions
          </h2>
          <span className="text-sm text-gray-500 font-medium">
            {complaints.length} total
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-[#3366FF]/30 border-t-[#3366FF] rounded-full animate-spin" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center p-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-1">No complaints yet</h3>
            <p className="text-gray-500">File a new complaint above to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint: any) => (
              <ComplaintCard key={complaint.id} {...complaint} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
