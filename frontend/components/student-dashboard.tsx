"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth, fetchApi } from "@/lib/auth/client";
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Camera,
  Check,
  ChevronDown,
  Eye,
  FileText,
  Hammer,
  Home,
  LayoutGrid,
  LogIn,
  Menu,
  ShieldCheck,
  Sparkles,
  Upload,
  UserPlus
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const urgencyOptions = [
  { label: "Emergency", eta: "2 days", tone: "bg-red-500 text-white ring-red-500/30" },
  { label: "High", eta: "4-5 days", tone: "bg-orange-500 text-white ring-orange-500/30" },
  { label: "Medium", eta: "1 week", tone: "bg-blue-500 text-white ring-blue-500/30" },
  { label: "Low", eta: "1 month", tone: "bg-slate-500 text-white ring-slate-500/30" }
] as const;

const complaintSteps = [
  "Filed",
  "In Queue",
  "Work in Progress",
  "Technical Proof",
  "Warden Check",
  "Resolved"
];

const complaints = [
  {
    id: "CMP-2024-001",
    hostel: "Sapphire Hostel",
    room: "Room 204",
    category: "Plumbing",
    status: "Filed",
    badge: "blue" as const,
    urgency: "Emergency",
    timer: "1d 18h remaining",
    description:
      "Water pipe burst in bathroom, flooding the room. Immediate attention required.",
    progress: 13,
    step: 0,
    assignment: "Warden",
    assignmentTime: "6h 0m",
    department: null,
    total: "2d 0h",
    healthy: "Healthy (13%)"
  },
  {
    id: "CMP-2024-002",
    hostel: "Ruby Hostel",
    room: "Room 315",
    category: "Electrical",
    status: "Work in Progress",
    badge: "default" as const,
    urgency: "Emergency",
    timer: "1d 6h remaining",
    description: "Power socket sparking continuously, potential fire hazard.",
    progress: 38,
    step: 2,
    assignment: "Engineering Cell",
    assignmentTime: "6h 0m",
    department: "12h 0m",
    total: "2d 0h",
    healthy: "Healthy (38%)"
  },
  {
    id: "CMP-2024-003",
    hostel: "Emerald Hostel",
    room: "Room 102",
    category: "Furniture",
    status: "Technical Proof Submitted",
    badge: "amber" as const,
    urgency: "Medium",
    timer: "3d 12h remaining",
    description: "Study table broken, leg completely detached. Cannot study properly.",
    progress: 59,
    step: 3,
    assignment: "Furniture Unit",
    assignmentTime: "6h 0m",
    department: "2d 0h",
    total: "7d 0h",
    healthy: "Healthy (59%)"
  },
  {
    id: "CMP-2024-004",
    hostel: "Diamond Hostel",
    room: "Room 420",
    category: "Plumbing",
    status: "Resolved",
    badge: "green" as const,
    urgency: "Low",
    timer: "23d 0h remaining",
    description: "Slow drainage in bathroom sink.",
    progress: 23,
    step: 5,
    assignment: "Sanitation",
    assignmentTime: "6h 0m",
    department: "6d 18h",
    total: "30d 0h",
    healthy: "Healthy (23%)"
  }
];

const sideLinks = [
  { label: "Dashboard", icon: LayoutGrid, active: true },
  { label: "My Complaints", icon: FileText, active: false },
  { label: "Notifications", icon: Bell, active: false },
  { label: "Room Details", icon: Home, active: false }
];

function urgencyTone(label: string) {
  if (label === "Emergency") return "bg-red-500 text-white";
  if (label === "Medium") return "bg-blue-500 text-white";
  if (label === "Low") return "bg-slate-500 text-white";
  return "bg-orange-500 text-white";
}

export function StudentDashboard() {
  const { user } = useAuth();
  const [selectedUrgency, setSelectedUrgency] = useState("Medium");
  const [expandedEvidence, setExpandedEvidence] = useState<string[]>([]);
  const [complaintsList, setComplaintsList] = useState<any[]>(complaints);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [complaintMedia, setComplaintMedia] = useState<Record<string, any[]>>({});

  // Custom Toast State
  const [toasts, setToasts] = useState<any[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Custom Hostel & Room details
  const [hostelDetails, setHostelDetails] = useState<{ hostel_name: string; location: string; wardens: string } | null>(null);
  const [roomNumberInput, setRoomNumberInput] = useState("");


  useEffect(() => {
    if (!user?.hostel_id) return;
    fetchApi(`/api/hostels/details?hostel_id=${user.hostel_id}`)
      .then(data => {
        setHostelDetails(data);
      })
      .catch(console.error);
  }, [user?.hostel_id]);

  const addToast = (toastTitle: string, message: string, type: "success" | "info" | "warning" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title: toastTitle, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const addFiles = (newFiles: File[]) => {
    const allowed = newFiles.filter(f => {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      return ['png','jpg','jpeg','mp4'].includes(ext) && f.size <= 10 * 1024 * 1024;
    });
    setUploadedFiles(prev => [...prev, ...allowed]);
    const newPreviews = allowed.map(f => URL.createObjectURL(f));
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
    setFilePreviews(prev => {
      if (prev[idx]) URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleToggleEvidence = async (complaintId: string) => {
    const isExpanded = expandedEvidence.includes(complaintId);
    if (!isExpanded && !complaintMedia[complaintId]) {
      try {
        const data = await fetchApi(`/api/complaints/${complaintId}/media`);
        if (data.media) {
          setComplaintMedia(prev => ({ ...prev, [complaintId]: data.media }));
        }
      } catch (err) {
        console.error("Failed to load complaint media:", err);
      }
    }
    setExpandedEvidence(prev =>
      prev.includes(complaintId)
        ? prev.filter(id => id !== complaintId)
        : [...prev, complaintId]
    );
  };

  const refreshComplaints = (showToast = false) => {
    if (!user) return;
    fetchApi(`/api/complaints?filed_by_id=${user.user_id}`)
      .then((data) => {
        if (data.complaints) {
          const mapped = data.complaints.map((c: any) => ({
            id: c.complaint_id,
            hostel: c.hostel_name || "Hostel",
            room: c.room_number,
            category: c.title,
            status: c.status === "filed" ? "Filed" : c.status === "in_progress" ? "Work in Progress" : c.status === "resolved" ? "Resolved" : c.status === "escalated" ? "Escalated" : "Closed",
            badge: c.status === "resolved" ? "green" : c.status === "in_progress" ? "blue" : "default",
            urgency: c.urgency_label || "Medium",
            timer: "Pending",
            description: c.description,
            progress: c.status === "resolved" ? 100 : c.status === "in_progress" ? 50 : 10,
            step: c.status === "filed" ? 0 : 
                  c.status === "in_progress" ? (
                    c.media?.some((m: any) => m.upload_stage === "technical" || m.upload_stage === "technical_fix") ? 3 : 2
                  ) : 
                  c.status === "resolved" ? 5 : 1,
            createdAt: c.created_at,
            resolvedAt: c.resolved_at,
          }));
          setComplaintsList(mapped);

          if (showToast && mapped.length > 0) {
            const activeCount = mapped.filter((c: any) => c.status !== "Resolved" && c.status !== "Closed").length;
            if (activeCount > 0) {
              addToast(
                "Active Complaints",
                `You have ${activeCount} active complaint(s) under review.`,
                "info"
              );
            } else {
              addToast(
                "All Clear",
                "All your submitted complaints are fully resolved.",
                "success"
              );
            }
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) return;

    refreshComplaints(true);

    const interval = setInterval(() => {
      refreshComplaints(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      // 1. Upload files to the upload route
      const mediaUrls: { url: string; type: string }[] = [];
      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        
        const uploadRes = await fetchApi('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (uploadRes.url) {
          mediaUrls.push({
            url: uploadRes.url,
            type: file.type.startsWith("video/") ? "video" : "image"
          });
        }
      }

      // 2. Submit the complaint
      const urgencyId = 
        selectedUrgency === "Emergency" ? "urg-critical" : 
        selectedUrgency === "High" ? "urg-high" : 
        selectedUrgency === "Medium" ? "urg-medium" : "urg-low";

      const res = await fetchApi('/api/complaints', {
        method: 'POST',
        body: JSON.stringify({
          hostel_id: user.hostel_id || 'H001',
          room_number: roomNumberInput || "Room 204", 
          title: title || "Maintenance Request",
          description,
          urgency_id: urgencyId
        })
      });

      // 3. Link media URLs to the newly created complaint
      if (res.complaint && mediaUrls.length > 0) {
        for (const media of mediaUrls) {
          await fetchApi(`/api/complaints/${res.complaint.complaint_id}/media`, {
            method: 'POST',
            body: JSON.stringify({
              media_url: media.url,
              media_type: media.type,
              upload_stage: "initial"
            })
          });
        }
      }

      addToast(
        "Complaint Submitted",
        `Successfully filed ticket: "${title || 'Maintenance Request'}".`,
        "success"
      );

      // Simulate a warden response update notification arriving after 3.5 seconds
      setTimeout(() => {
        addToast(
          "Warden Alert",
          "Warden received complaint and initiated the response timeline.",
          "info"
        );
      }, 3500);

      // Refresh complaints
      const data = await fetchApi(`/api/complaints?filed_by_id=${user.user_id}`);
      if (data.complaints) {
        const mapped = data.complaints.map((c: any) => ({
          id: c.complaint_id,
          hostel: c.hostel_name || "Hostel",
          room: c.room_number,
          category: c.title,
          status: c.status === "filed" ? "Filed" : c.status === "in_progress" ? "Work in Progress" : c.status === "resolved" ? "Resolved" : c.status === "escalated" ? "Escalated" : "Closed",
          badge: c.status === "resolved" ? "green" : c.status === "in_progress" ? "blue" : "default",
          urgency: c.urgency_label || "Medium",
          timer: "Pending",
          description: c.description,
          progress: c.status === "resolved" ? 100 : c.status === "in_progress" ? 50 : 10,
          step: c.status === "filed" ? 0 : 
                c.status === "in_progress" ? (
                  c.media?.some((m: any) => m.upload_stage === "technical" || m.upload_stage === "technical_fix") ? 3 : 2
                ) : 
                c.status === "resolved" ? 5 : 1,
          createdAt: c.created_at,
          resolvedAt: c.resolved_at,
        }));
        setComplaintsList(mapped);
      }
      setTitle("");
      setDescription("");
      filePreviews.forEach(url => URL.revokeObjectURL(url));
      setFilePreviews([]);
      setUploadedFiles([]);
    } catch (err) {
      console.error(err);
      addToast("Submission Failed", "There was an error filing your complaint.", "warning");
    } finally {
      setSubmitting(false);
    }
  };

  const openCount = complaintsList.filter(c => c.status !== "Resolved" && c.status !== "Closed").length;
  const resolvedCount = complaintsList.filter(c => c.status === "Resolved").length;
  
  const resolvedComplaints = complaintsList.filter(c => c.status === "Resolved" && (c.resolvedAt || c.resolved_at));
  let avgResponse = "6h"; // default fallback
  if (resolvedComplaints.length > 0) {
    let totalMs = 0;
    resolvedComplaints.forEach(c => {
      const start = new Date(c.createdAt || c.created_at).getTime();
      const end = new Date(c.resolvedAt || c.resolved_at).getTime();
      if (!isNaN(start) && !isNaN(end)) {
        totalMs += (end - start);
      }
    });
    if (totalMs > 0) {
      const avgHours = Math.round(totalMs / (1000 * 60 * 60 * resolvedComplaints.length));
      avgResponse = `${avgHours}h`;
    }
  }

  // Format resident since date
  let residentSinceText = "Aug 2025";
  if (user?.tenure_since) {
    const parts = user.tenure_since.split('-');
    if (parts.length === 2) {
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      if (!isNaN(year) && !isNaN(month)) {
        const date = new Date(year, month - 1);
        residentSinceText = date.toLocaleString("default", { month: "short", year: "numeric" });
      }
    }
  }

  // Dynamic Student Snapshot calculations
  const latestComplaint = complaintsList.length > 0 ? complaintsList[0] : null;
  
  let lastUpdateTitle = "No complaints yet";
  let lastUpdateTime = "System ready";
  let nextActionTitle = "File your first complaint";
  let nextActionSub = "Get fast hostel support";

  if (latestComplaint) {
    const timeToUse = latestComplaint.resolvedAt || latestComplaint.createdAt || new Date();
    const formattedTime = new Date(timeToUse).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    
    lastUpdateTime = formattedTime;
    
    if (latestComplaint.status === "Resolved") {
      lastUpdateTitle = `Warden resolved ${latestComplaint.category}`;
      nextActionTitle = `Confirm fix on ${latestComplaint.id}`;
      nextActionSub = "1 pending confirmation";
    } else if (latestComplaint.status === "Work in Progress") {
      lastUpdateTitle = `Work started on ${latestComplaint.category}`;
      nextActionTitle = `Monitor progress on ${latestComplaint.id}`;
      nextActionSub = "In queue";
    } else if (latestComplaint.status === "Technical Proof Submitted") {
      lastUpdateTitle = `Technical proof uploaded for ${latestComplaint.category}`;
      nextActionTitle = `Review proof on ${latestComplaint.id}`;
      nextActionSub = "Verification needed";
    } else if (latestComplaint.status === "Filed") {
      lastUpdateTitle = `Filed: ${latestComplaint.category}`;
      nextActionTitle = `Wait for Warden assignment on ${latestComplaint.id}`;
      nextActionSub = "Awaiting response";
    } else {
      lastUpdateTitle = `Updated: ${latestComplaint.category}`;
      nextActionTitle = `Track status of ${latestComplaint.id}`;
      nextActionSub = "Active";
    }
  }

  // Dynamic notifications generator for modal
  const getNotificationsList = () => {
    const list: any[] = [];
    complaintsList.forEach(c => {
      // 1. Filing notification
      list.push({
        id: `${c.id}-filed`,
        title: "Complaint Filed",
        message: `Your complaint "${c.category}" has been filed successfully.`,
        time: c.createdAt ? new Date(c.createdAt).toLocaleString() : "Just now",
        type: "info",
        status: "Filed"
      });
      
      // 2. Assigning / WIP notification
      if (c.status === "Work in Progress" || c.status === "Resolved" || c.status === "Technical Proof Submitted") {
        list.push({
          id: `${c.id}-wip`,
          title: "Work In Progress",
          message: `Warden assigned the issue to ${c.assignment || 'department'}. Technicians are now working.`,
          time: "1 hour after filing",
          type: "warning",
          status: "In Progress"
        });
      }

      // 3. Technical Proof Submitted
      if (c.status === "Technical Proof Submitted" || c.status === "Resolved") {
        list.push({
          id: `${c.id}-proof`,
          title: "Technical Proof Uploaded",
          message: `A technician submitted a photo of the completed repair for ${c.id}.`,
          time: "2 hours after filing",
          type: "info",
          status: "Verification Needed"
        });
      }

      // 4. Resolved
      if (c.status === "Resolved") {
        list.push({
          id: `${c.id}-resolved`,
          title: "Complaint Resolved",
          message: `Warden verified the fix and resolved complaint ${c.id}.`,
          time: c.resolvedAt ? new Date(c.resolvedAt).toLocaleString() : "Just now",
          type: "success",
          status: "Resolved"
        });
      }
    });

    if (list.length === 0) {
      list.push({
        id: "empty",
        title: "No notifications",
        message: "All quiet here! You have no active notifications.",
        time: "System",
        type: "info",
        status: "Idle"
      });
    }

    return list;
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid-fade bg-[size:44px_44px] opacity-45" />
      <div className="absolute left-[-5rem] top-28 h-80 w-80 rounded-full bg-blue-300/25 blur-3xl" />
      <div className="absolute right-[-3rem] top-10 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />
      <div className="absolute bottom-10 right-1/3 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />
      <Topbar userName="Demo User" userRole="Student" />
      <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row bg-slate-50">        <section className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto max-w-7xl space-y-6">
            <Card className="overflow-hidden bg-white/60">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                      <LayoutGrid className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                          Dashboard
                        </h1>
                      </div>
                      <p className="max-w-2xl text-balance text-base leading-7 text-slate-600">
                        Track complaints, submit fresh issues, and follow evidence-backed updates from your
                        hostel team in one place.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 xl:w-[380px]">
                    <div className="glass-panel rounded-2xl p-4">
                      <p className="text-sm text-slate-500">Open complaints</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-950">{openCount}</p>
                    </div>
                    <div className="glass-panel rounded-2xl p-4">
                      <p className="text-sm text-slate-500">Resolved this month</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-950">{resolvedCount}</p>
                    </div>
                    <div className="glass-panel rounded-2xl p-4">
                      <p className="text-sm text-slate-500">Average response</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-950">{avgResponse}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
              <div className="space-y-6">
                <Card className="border-slate-200 dark:border-slate-800 bg-white/40 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Home className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Residence Details</h2>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-950 dark:text-slate-50">
                            {hostelDetails?.hostel_name || "Sapphire Hostel"} <span className="text-slate-300 dark:text-slate-700 font-light">•</span> Room {user?.room_number || "204"}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Warden: {hostelDetails?.wardens || "Rajesh Kumar"}
                          </p>
                        </div>
                      </div>

                    <div className="flex md:w-[170px]">
                      <div className="glass-panel w-full rounded-[24px] p-5 shadow-sm hover:shadow transition-shadow duration-300">
                        <p className="text-sm font-medium text-slate-500">Resident since</p>
                        <p className="mt-2 font-semibold text-slate-900 dark:text-slate-50">
                          {residentSinceText}
                        </p>
                      </div>
                    </div>

                  </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-blue-200/80">
                  <CardHeader className="border-b border-white/40 bg-gradient-to-r from-white/35 via-white/20 to-white/10 backdrop-blur-xl">
                    <CardTitle className="text-[1.95rem] font-semibold text-blue-900">
                      File New Complaint
                    </CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      Report a maintenance issue in your room. This stays student-friendly now and plugs into
                      auth later without changing the UI language.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-900">Category / Title *</label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            suppressHydrationWarning
                            placeholder="e.g. Electrical Issue"
                            className="glass-panel flex h-14 w-full items-center justify-between rounded-[24px] px-4 text-left text-slate-900 transition hover:border-blue-200 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-900">Location *</label>
                          <input
                            type="text"
                            value={roomNumberInput}
                            onChange={(e) => setRoomNumberInput(e.target.value)}
                            required
                            suppressHydrationWarning
                            placeholder="e.g. Room 204, Block A (or custom location)"
                            className="glass-panel flex h-14 w-full items-center justify-between rounded-[24px] px-4 text-left text-slate-900 transition hover:border-blue-200 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-900">Urgency Level *</label>
                        <div className="grid gap-3 md:grid-cols-4">
                          {urgencyOptions.map((option) => {
                            const isActive = selectedUrgency === option.label;
                            return (
                              <button
                                type="button"
                                key={option.label}
                                onClick={() => setSelectedUrgency(option.label)}
                                className={cn(
                                  "rounded-[24px] border p-4 text-left shadow-sm transition",
                                  isActive
                                    ? `${option.tone} ring-4`
                                    : "glass-panel hover:border-blue-200 hover:bg-white/70"
                                )}
                              >
                                <p className="text-lg font-semibold">{option.label}</p>
                                <p
                                  className={cn(
                                    "mt-1 text-sm",
                                    isActive ? "text-white/85" : "text-slate-500"
                                  )}
                                >
                                  {option.eta}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-900">Description *</label>
                        <Textarea
                          placeholder="Describe the issue in detail..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                          suppressHydrationWarning
                          className="glass-panel min-h-[150px] bg-white/30"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-900">Evidence (Photos/Videos)</label>
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            "cursor-pointer rounded-[28px] border-2 border-dashed p-8 text-center transition-colors",
                            isDragging
                              ? "border-blue-500 bg-blue-50/50"
                              : "border-slate-300 bg-white/25 hover:border-blue-400 hover:bg-blue-50/30"
                          )}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/png,image/jpeg,video/mp4"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <div className="glass-panel mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-slate-500 shadow-sm">
                            <Upload className="h-9 w-9" />
                          </div>
                          <p className="mt-5 text-2xl font-semibold text-slate-900">Drag and drop files here</p>
                          <p className="mt-2 text-base text-slate-600">
                            or <span className="font-semibold text-blue-600">browse from your device</span>
                          </p>
                          <p className="mt-3 text-sm text-slate-500">PNG, JPG, MP4 up to 10MB each</p>
                        </div>
                        {uploadedFiles.length > 0 && (
                          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 mt-3">
                            {uploadedFiles.map((file, idx) => {
                              const isImage = file.type.startsWith("image/") || ['png', 'jpg', 'jpeg'].includes(file.name.split('.').pop()?.toLowerCase() || '');
                              const isVideo = file.type.startsWith("video/") || file.name.split('.').pop()?.toLowerCase() === 'mp4';
                              const previewUrl = filePreviews[idx];
                              
                              return (
                                <div key={idx} className="relative rounded-[20px] border border-slate-200 bg-white/70 p-2 text-sm flex flex-col items-center group">
                                  {isImage && previewUrl ? (
                                    <img
                                      src={previewUrl}
                                      alt={file.name}
                                      className="h-24 w-full object-cover rounded-[14px]"
                                    />
                                  ) : isVideo && previewUrl ? (
                                    <video
                                      src={previewUrl}
                                      className="h-24 w-full object-cover rounded-[14px]"
                                    />
                                  ) : (
                                    <div className="h-24 w-full bg-slate-100 flex items-center justify-center rounded-[14px] text-slate-500">
                                      <FileText className="h-8 w-8" />
                                    </div>
                                  )}
                                  <span className="mt-2 text-xs truncate w-full text-center px-1 text-slate-600 font-medium">{file.name}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition"
                                  >✕</button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="glass-panel rounded-[24px] border-blue-200/50 bg-blue-50/30 p-5">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-semibold text-blue-900">Instant Notification</p>
                            <p className="mt-1 leading-7 text-slate-700">
                              Your warden and department workflow are notified as soon as you submit. The shared
                              institutional clock begins at submission time.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button type="submit" suppressHydrationWarning disabled={submitting} size="lg" className="h-14 w-full text-lg disabled:opacity-50">
                        {submitting ? "Submitting..." : "Submit Complaint"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      Student Snapshot
                    </CardTitle>
                    <CardDescription>Everything you need at a glance.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="glass-panel rounded-[24px] p-5">
                        <p className="text-sm text-slate-500">Last update</p>
                        <p className="mt-2 font-semibold text-slate-950">{lastUpdateTitle}</p>
                        <p className="mt-2 text-sm text-slate-500">{lastUpdateTime}</p>
                      </div>
                      <div className="glass-panel rounded-[24px] p-5">
                        <p className="text-sm text-slate-500">Next action</p>
                        <p className="mt-2 font-semibold text-slate-950">{nextActionTitle}</p>
                        <p className="mt-2 text-sm text-slate-500">{nextActionSub}</p>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full justify-between hover:bg-slate-100" onClick={() => setShowNotificationsModal(true)}>
                      View all notifications
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>


              </div>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-semibold">My Recent Submissions</CardTitle>
                  <CardDescription className="mt-1 text-base">
                    Recent complaints with milestone tracking and evidence visibility.
                  </CardDescription>
                </div>
                <p className="text-base text-slate-500">5 total</p>
              </CardHeader>
              <CardContent className="space-y-5">
                {loading ? (
                  <div className="p-8 text-center text-slate-500">Loading complaints...</div>
                ) : complaintsList.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No complaints found.</div>
                ) : complaintsList.map((complaint) => {
                  const isExpanded = expandedEvidence.includes(complaint.id);
                  return (
                    <div
                      key={complaint.id}
                      className={cn(
                        "rounded-[28px] border bg-white p-4 sm:p-6",
                        complaint.status === "Resolved"
                          ? "border-blue-300 shadow-[0_10px_40px_rgba(37,99,235,0.08)]"
                          : "border-slate-200"
                      )}
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-2xl font-semibold text-slate-950">{complaint.id}</h3>
                            <Badge variant={complaint.badge}>{complaint.status}</Badge>
                          </div>
                          <p className="mt-3 text-[1.35rem] text-slate-700">
                            {complaint.hostel} • {complaint.room} • {complaint.category}
                          </p>
                          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                            {complaint.description}
                          </p>
                        </div>

                        <div className={cn("rounded-full px-5 py-3 text-base font-semibold", urgencyTone(complaint.urgency))}>
                          {complaint.urgency} • {complaint.timer}
                        </div>
                      </div>

                      <div className="mt-8 grid gap-4 sm:grid-cols-6">
                        {complaintSteps.map((step, index) => {
                          const completed = index <= complaint.step;
                          const current = index === complaint.step;
                          return (
                            <div key={step} className="relative">
                              {index < complaintSteps.length - 1 && (
                                <div
                                  className={cn(
                                    "absolute left-[calc(50%+24px)] top-6 hidden h-1 w-[calc(100%-10px)] sm:block",
                                    completed && complaint.step > index ? "bg-emerald-500" : "bg-slate-200"
                                  )}
                                />
                              )}
                              <div className="relative flex flex-col items-center gap-3 text-center">
                                <div
                                  className={cn(
                                    "flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm",
                                    completed
                                      ? current
                                        ? "border-blue-300 bg-emerald-500 text-white ring-4 ring-blue-100"
                                        : "border-emerald-600 bg-emerald-500 text-white"
                                      : "border-slate-300 bg-white text-slate-400"
                                  )}
                                >
                                  <Check className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-medium leading-5 text-slate-700">{step}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {complaint.status === "Resolved" && (
                        <div className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50/80 p-5">
                          <div className="flex items-start gap-3">
                            <Eye className="mt-0.5 h-5 w-5 text-emerald-600" />
                            <div>
                              <p className="font-semibold text-emerald-900">Department visited your room!</p>
                              <p className="text-slate-700">Click evidence chain to see technical and final proof.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-6">
                        <div className="flex items-center gap-2 text-xl font-semibold">
                          <BadgeCheck className="h-5 w-5 text-emerald-600" />
                          Shared Institutional Clock
                        </div>

                        <div className="mt-4 overflow-hidden rounded-full border border-emerald-200 bg-emerald-100">
                          <div className="flex h-11 w-full">
                            <div
                              className="bg-blue-500"
                              style={{ width: `${Math.min(complaint.progress, 35)}%` }}
                            />
                            <div className="flex-1 bg-emerald-200/80" />
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                          <span>Warden: {complaint.assignmentTime}</span>
                          {complaint.department ? <span>Dept: {complaint.department}</span> : null}
                          <span className="ml-auto">Total: {complaint.total}</span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <Badge variant="green" className="text-sm">
                            {complaint.healthy}
                          </Badge>
                          <span className="text-base text-slate-600">Assigned to: {complaint.assignment}</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="mt-6 w-full border-violet-200 text-violet-700 hover:bg-violet-50"
                        onClick={() => handleToggleEvidence(complaint.id)}
                      >
                        <Eye className="h-4 w-4" />
                        {isExpanded ? "Hide Evidence Chain" : "View Evidence Chain"}
                      </Button>

                      {isExpanded ? (
                        <div className="mt-6 rounded-[28px] border border-violet-200 p-4 sm:p-6">
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                  <FileText className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-xl font-semibold">Initial Complaint Evidence</p>
                                  <p className="text-slate-600">Filed by {complaint.filed_by_name || user?.name || "Student"}</p>
                                </div>
                              </div>
                              {complaintMedia[complaint.id]?.filter(m => m.upload_stage === 'initial').length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                  {complaintMedia[complaint.id].filter(m => m.upload_stage === 'initial').map((m: any) => (
                                    <div key={m.media_id} className="relative overflow-hidden rounded-[24px] border border-blue-200 bg-slate-50 flex items-center justify-center">
                                      {m.media_type === 'video' ? (
                                        <video src={m.media_url} controls className="w-full max-h-[400px] object-contain" />
                                      ) : (
                                        <Image
                                          src={m.media_url}
                                          alt="Initial complaint evidence"
                                          width={600}
                                          height={400}
                                          className="w-full max-h-[400px] object-contain animate-fade-in"
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-[20px] bg-slate-100 px-6 py-8 text-center text-slate-500">
                                  No images provided
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                  <Hammer className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-xl font-semibold">Technical Fix Evidence</p>
                                  <p className="text-slate-600">
                                    By {complaintMedia[complaint.id]?.find((m: any) => (m.upload_stage === 'technical' || m.upload_stage === 'technical_fix') && m.uploaded_by_name)?.uploaded_by_name || "Mrs. Lakshmi Devi"}
                                  </p>
                                </div>
                              </div>
                              {complaintMedia[complaint.id]?.filter(m => m.upload_stage === 'technical' || m.upload_stage === 'technical_fix').length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                  {complaintMedia[complaint.id].filter(m => m.upload_stage === 'technical' || m.upload_stage === 'technical_fix').map((m: any) => (
                                    <div key={m.media_id} className="relative overflow-hidden rounded-[24px] border border-emerald-200 bg-slate-50 flex items-center justify-center">
                                      {m.media_type === 'video' ? (
                                        <video src={m.media_url} controls className="w-full max-h-[400px] object-contain" />
                                      ) : (
                                        <Image
                                          src={m.media_url}
                                          alt="Technical fix evidence"
                                          width={600}
                                          height={400}
                                          className="w-full max-h-[400px] object-contain"
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-[20px] bg-slate-100 px-6 py-8 text-center text-slate-500">
                                  {complaint.status === "Resolved" || complaint.status === "Closed" ? (
                                    "No technical proof uploaded"
                                  ) : complaint.status === "Work in Progress" || complaint.status === "Escalated" ? (
                                    "Pending technical fix - maintenance cell assigned"
                                  ) : (
                                    "Pending warden review & department assignment"
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                                  <ShieldCheck className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-xl font-semibold">Final Verification Evidence</p>
                                  <p className="text-slate-600 font-medium">
                                    By Senior Warden: {hostelDetails?.wardens.split(',')[0] || "Assigned Warden"}
                                  </p>
                                </div>
                              </div>
                              {complaintMedia[complaint.id]?.filter(m => m.upload_stage === 'final' || m.upload_stage === 'final_verification').length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                  {complaintMedia[complaint.id].filter(m => m.upload_stage === 'final' || m.upload_stage === 'final_verification').map((m: any) => (
                                    <div key={m.media_id} className="relative overflow-hidden rounded-[24px] border border-violet-200 bg-slate-50 flex items-center justify-center">
                                      {m.media_type === 'video' ? (
                                        <video src={m.media_url} controls className="w-full max-h-[400px] object-contain" />
                                      ) : (
                                        <Image
                                          src={m.media_url}
                                          alt="Final verification evidence"
                                          width={600}
                                          height={400}
                                          className="w-full max-h-[400px] object-contain"
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="rounded-[20px] bg-slate-100 px-6 py-8 text-center text-slate-500">
                                  {complaint.status === "Resolved" || complaint.status === "Closed" ? (
                                    "No final verification proof uploaded"
                                  ) : (
                                    "Pending technical resolution & final verification check"
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-4 border-t border-slate-200 pt-5 text-sm text-slate-600">
                              <span className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-blue-500" />
                                Student
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                                Department
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-violet-500" />
                                Warden
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      {/* Toast Notification Stack */}
      <div className="fixed top-20 right-6 z-[9999] flex w-full max-w-sm flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full items-start gap-3 rounded-[20px] border p-4 shadow-xl backdrop-blur-xl transition-all duration-300 animate-slide-in",
              t.type === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-slate-900 dark:border-emerald-950 dark:bg-emerald-950/95 dark:text-slate-100"
                : t.type === "warning"
                ? "border-amber-200 bg-amber-50/95 text-slate-900 dark:border-amber-950 dark:bg-amber-950/95 dark:text-slate-100"
                : "border-blue-200 bg-blue-50/95 text-slate-900 dark:border-blue-950 dark:bg-blue-950/95 dark:text-slate-100"
            )}
          >
            <div className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              t.type === "success" ? "bg-emerald-500 text-white" : t.type === "warning" ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
            )}>
              <Bell className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-sm leading-none text-slate-950 dark:text-slate-50">{t.title}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">{t.message}</p>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-950 dark:text-slate-50">All Notifications</h2>
              </div>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 max-h-[350px] space-y-3 overflow-y-auto pr-2">
              {getNotificationsList().map((n, i) => (
                <div
                  key={n.id || i}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white",
                    n.type === "success" ? "bg-emerald-500" : n.type === "warning" ? "bg-amber-500" : "bg-blue-500"
                  )}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-50">{n.title}</p>
                      <span className="text-xs text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowNotificationsModal(false)} className="rounded-[20px]">
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
