"use client";

import { useState, useEffect } from "react";
import {
  Camera,
  Check,
  Clock,
  Wrench,
  X,
  Hammer,
  Zap,
  Droplets,
  Sparkles,
  Package,
  Laptop,
  Settings,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Topbar } from "@/components/topbar";
import { cn } from "@/lib/utils";
import { useAuth, fetchApi } from "@/lib/auth/client";

/* ------------------------------------------------------------------ */
/*  Styles & Helper                                                    */
/* ------------------------------------------------------------------ */

const getDeptStyles = (value: string) => {
  switch (value) {
    case "engineering":
      return {
        icon: <Wrench className="h-7 w-7" />,
        bg: "bg-emerald-100 text-emerald-600 ring-emerald-200",
      };
    case "plumbing":
      return {
        icon: <Droplets className="h-7 w-7" />,
        bg: "bg-blue-100 text-blue-600 ring-blue-200",
      };
    case "electrical":
      return {
        icon: <Zap className="h-7 w-7" />,
        bg: "bg-amber-100 text-amber-600 ring-amber-200",
      };
    case "furniture":
    case "carpentry":
      return {
        icon: <Hammer className="h-7 w-7" />,
        bg: "bg-orange-100 text-orange-600 ring-orange-200",
      };
    case "sanitation":
    case "housekeeping":
      return {
        icon: <Sparkles className="h-7 w-7" />,
        bg: "bg-teal-100 text-teal-600 ring-teal-200",
      };
    case "store":
      return {
        icon: <Package className="h-7 w-7" />,
        bg: "bg-purple-100 text-purple-600 ring-purple-200",
      };
    case "it":
      return {
        icon: <Laptop className="h-7 w-7" />,
        bg: "bg-indigo-100 text-indigo-600 ring-indigo-200",
      };
    default:
      return {
        icon: <Settings className="h-7 w-7" />,
        bg: "bg-slate-100 text-slate-600 ring-slate-200",
      };
  }
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const departments = [
  { value: "engineering", label: "Engineering Cell", emoji: "🔧" },
  { value: "plumbing", label: "Plumbing Cell", emoji: "🪠" },
  { value: "electrical", label: "Electrical Cell", emoji: "⚡" },
  { value: "furniture", label: "Furniture Unit", emoji: "🪑" },
  { value: "sanitation", label: "Sanitation", emoji: "🧹" },
  { value: "store", label: "Store & Purchase", emoji: "📦" },
];

const complaintSteps = [
  "Filed",
  "In Queue",
  "Work in Progress",
  "Technical Proof",
  "Warden Check",
  "Resolved",
];

export function DepartmentDashboard() {
  const { user } = useAuth();
  const [selectedDept, setSelectedDept] = useState("engineering");
  const [wipComplaints, setWipComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // File uploading states per complaint
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [uploadingIds, setUploadingIds] = useState<Record<string, boolean>>({});

  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; title: string; message: string; type: "success" | "info" | "error" }[]>([]);

  const addToast = (title: string, message: string, type: "success" | "info" | "error" = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const selectedInfo = departments.find((d) => d.value === selectedDept);
  const deptStyles = getDeptStyles(selectedDept);

  // 1. Dynamically resolve department on mount/user change
  useEffect(() => {
    if (!user) return;

    const nameLower = (user.name || "").toLowerCase();
    const emailLower = (user.email || "").toLowerCase();

    let matchedDept = "engineering"; // Default fallback

    for (const dept of departments) {
      const keyword = dept.value.toLowerCase();
      if (nameLower.includes(keyword) || emailLower.includes(keyword)) {
        matchedDept = dept.value;
        break;
      }
      // Special handle cases like "purchase" or "store"
      if (keyword === "store" && (nameLower.includes("purchase") || emailLower.includes("purchase"))) {
        matchedDept = dept.value;
        break;
      }
    }

    setSelectedDept(matchedDept);
  }, [user]);

  // 2. Fetch WIP complaints for this resolved department
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    fetchApi(`/api/complaints?status=in_progress`)
      .then((data) => {
        if (data.complaints) {
          // Filter to complaints assigned to this department
          const filtered = data.complaints.filter(
            (c: any) =>
              c.assigned_dept_name === selectedInfo?.label ||
              (!c.assigned_dept_name && selectedDept === "engineering")
          );

          const mapped = filtered.map((c: any) => ({
            id: c.complaint_id,
            hostel: c.hostel_name || "Hostel",
            room: c.room_number,
            category: c.title,
            status: "Work in Progress",
            description: c.description,
            step: 2, // Index 2 in steps: Work in Progress
            urgency: c.urgency_label || "Medium",
            timer: "Pending",
            wardenTime: "6h 0m",
            deptTime: "In Progress",
            totalTime: "Pending",
            progress: 38,
            healthLabel: "HEALTHY",
            media: c.media || [],
          }));
          setWipComplaints(mapped);
        }
      })
      .catch((err) => {
        console.error("Failed to load WIP complaints:", err);
        addToast("Error", "Failed to load complaints list.", "error");
      })
      .finally(() => setLoading(false));
  }, [user, selectedInfo, selectedDept, refreshTrigger]);

  const handleFileChange = (complaintId: string, file: File | null) => {
    setSelectedFiles((prev) => ({ ...prev, [complaintId]: file }));
  };

  // 3. Submit technical proof to resolve the complaint
  const handleSubmitProof = async (complaintId: string) => {
    const file = selectedFiles[complaintId];
    if (!file) {
      addToast("No file selected", "Please choose a photo/video file first.", "error");
      return;
    }

    setUploadingIds((prev) => ({ ...prev, [complaintId]: true }));
    try {
      // Step A: Upload file
      const formData = new FormData();
      formData.append("file", file);

      addToast("Uploading proof...", "Sending your evidence to the server.", "info");

      const uploadRes = await fetchApi("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.url) {
        throw new Error("Did not receive a file URL back from the server.");
      }

      const mediaType = file.type.startsWith("video/") ? "video" : "image";

      // Step B: Post to complaint media API
      await fetchApi(`/api/complaints/${complaintId}/media`, {
        method: "POST",
        body: JSON.stringify({
          media_url: uploadRes.url,
          media_type: mediaType,
          upload_stage: "technical",
        }),
      });

      // Step C: Update complaint status to 'resolved'
      await fetchApi(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "resolved",
          remarks: `Resolved and technical proof uploaded by ${user?.name || "Department Head"}.`,
        }),
      });

      // Clear selection
      setSelectedFiles((prev) => ({ ...prev, [complaintId]: null }));

      addToast(
        "Proof Submitted",
        `Job resolved! Technical evidence has been attached to complaint #${complaintId}.`,
        "success"
      );

      // Trigger list refresh
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      console.error("Submission failed:", err);
      addToast("Error", err.message || "Failed to submit technical proof.", "error");
    } finally {
      setUploadingIds((prev) => ({ ...prev, [complaintId]: false }));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Topbar
        userName={user?.name || "Department Head"}
        userRole="Department Head"
      />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl ring-1", deptStyles.bg)}>
              {deptStyles.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                {selectedInfo?.label || "Department Operations"}
              </h1>
              <p className="text-sm text-slate-500 mt-1.5">
                Cross-Hostel Technical Operations
              </p>
            </div>
          </div>

          {/* Pending Queue */}
          <Card className="mt-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Pending Queue (0)
                </h2>
                <Clock className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Clock className="h-8 w-8 text-slate-400" />
                </div>
                <p className="mt-4 text-lg font-semibold text-slate-700">
                  Queue Empty
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  No pending jobs at the moment
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Work in Progress */}
          <Card className="mt-6 border-emerald-200">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/40 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Work in Progress ({wipComplaints.length})
                </h2>
                <Check className="h-5 w-5 text-emerald-500" />
              </div>

              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="p-8 text-center text-slate-500">Loading assignments...</div>
                ) : wipComplaints.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No active complaints found.</div>
                ) : wipComplaints.map((c) => (
                  <div key={c.id} className="px-6 py-6">
                    
                    {/* Complaint header */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900">
                          {c.id}
                        </h3>
                        <Badge variant="default" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          {c.status}
                        </Badge>
                        <Badge variant="amber" className="border-amber-200 bg-amber-50 text-amber-800">
                          {c.urgency} Urgency
                        </Badge>
                      </div>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {c.hostel} • {c.room}
                    </p>
                    <p className="mt-2 text-base leading-7 text-slate-700 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                      <span className="font-bold block text-xs text-slate-400 uppercase tracking-wider mb-1">Description</span>
                      {c.description}
                    </p>

                    {/* Initial Evidence from Student (if any) */}
                    {c.media && c.media.filter((m: any) => m.upload_stage === "initial").length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Initial Evidence from Student
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {c.media.filter((m: any) => m.upload_stage === "initial").map((m: any) => (
                            <a
                              key={m.media_id}
                              href={m.media_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
                            >
                              <Camera className="h-3.5 w-3.5 text-emerald-500" />
                              View Student Attachment
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step progress */}
                    <div className="mt-6 grid grid-cols-6 gap-0">
                      {complaintSteps.map((step, index) => {
                        const completed = index <= c.step;
                        const current = index === c.step;
                        return (
                          <div key={step} className="relative flex flex-col items-center">
                            {/* Connector line */}
                            {index < complaintSteps.length - 1 && (
                              <div
                                className={cn(
                                  "absolute left-[calc(50%+18px)] top-[14px] hidden h-[3px] w-[calc(100%-36px)] sm:block",
                                  completed && c.step > index
                                    ? "bg-emerald-500"
                                    : "bg-slate-200"
                                )}
                              />
                            )}
                            <div
                              className={cn(
                                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs transition-all",
                                completed
                                  ? current
                                    ? "border-emerald-400 bg-emerald-500 text-white ring-4 ring-emerald-100"
                                    : "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-slate-300 bg-white text-slate-400"
                              )}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </div>
                            <span className="mt-2 text-center text-[11px] font-medium leading-tight text-slate-600">
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Submit Technical Proof UI */}
                    <div className="mt-6 border border-dashed border-emerald-300 rounded-2xl p-5 bg-emerald-50/10 shadow-inner">
                      <div className="flex flex-col items-center justify-center text-center">
                        <input
                          type="file"
                          id={`file-input-${c.id}`}
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileChange(c.id, file);
                          }}
                        />
                        
                        {!selectedFiles[c.id] ? (
                          <label
                            htmlFor={`file-input-${c.id}`}
                            className="flex flex-col items-center justify-center cursor-pointer gap-2"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors">
                              <Camera className="h-6 w-6" />
                            </div>
                            <span className="text-sm font-semibold text-slate-800">
                              Upload Proof of Work Done
                            </span>
                            <span className="text-xs text-slate-500">
                              PNG, JPG, JPEG, or MP4 (max 10MB)
                            </span>
                          </label>
                        ) : (
                          <div className="w-full space-y-4">
                            <div className="flex items-center justify-between bg-white border border-emerald-100 rounded-xl p-3 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                  <Hammer className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[400px]">
                                    {selectedFiles[c.id]?.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {((selectedFiles[c.id]?.size || 0) / (1024 * 1024)).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleFileChange(c.id, null)}
                                className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                              >
                                Remove
                              </button>
                            </div>

                            <Button
                              onClick={() => handleSubmitProof(c.id)}
                              disabled={uploadingIds[c.id]}
                              className="h-12 w-full gap-2 bg-emerald-600 text-base font-bold text-white hover:bg-emerald-700 transition-all rounded-xl disabled:opacity-50"
                            >
                              {uploadingIds[c.id] ? "Uploading proof..." : "Confirm & Submit Technical Proof"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Toast notifications container */}
      <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "rounded-2xl border p-4 shadow-lg flex flex-col gap-1 transition-all duration-300 transform translate-y-0",
              t.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
              t.type === "error" ? "bg-red-50 border-red-200 text-red-800" :
              "bg-slate-50 border-slate-200 text-slate-800"
            )}
          >
            <p className="font-bold text-sm">{t.title}</p>
            <p className="text-xs opacity-90">{t.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
