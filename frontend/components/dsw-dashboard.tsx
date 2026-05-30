"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building,
  Clock,
  Eye,
  ShieldCheck,
  Check,
  ChevronDown,
  Edit3,
  Send,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Topbar } from "@/components/topbar";
import { cn } from "@/lib/utils";
import { useAuth, fetchApi } from "@/lib/auth/client";

/* ── Urgency color palette ──────────────────────────────────────────── */
function urgencyColor(label: string) {
  switch (label) {
    case "Critical":
    case "Emergency":
      return { bg: "bg-red-500", ring: "ring-red-500/30", text: "text-red-600", border: "border-red-300", light: "bg-red-50" };
    case "High":
      return { bg: "bg-orange-500", ring: "ring-orange-500/30", text: "text-orange-600", border: "border-orange-300", light: "bg-orange-50" };
    case "Medium":
      return { bg: "bg-blue-500", ring: "ring-blue-500/30", text: "text-blue-600", border: "border-blue-300", light: "bg-blue-50" };
    case "Low":
    default:
      return { bg: "bg-slate-500", ring: "ring-slate-500/30", text: "text-slate-600", border: "border-slate-300", light: "bg-slate-50" };
  }
}

export function DswDashboard() {
  const { user } = useAuth();
  const [complaintsList, setComplaintsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<{ dept_id: string; dept_name: string }[]>([]);
  const [urgencyLevels, setUrgencyLevels] = useState<{ urgency_id: string; label: string; escalation_hours: number }[]>([]);
  const [urgencyDropdownId, setUrgencyDropdownId] = useState<string | null>(null);
  const [deptDropdownId, setDeptDropdownId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showApprovedDrawer, setShowApprovedDrawer] = useState(false);

  // Fetch departments and urgency levels on mount
  useEffect(() => {
    fetch("/api/departments")
      .then((r) => r.json())
      .then((d) => {
        if (d.departments) setDepartments(d.departments);
      })
      .catch(console.error);

    fetch("/api/urgency-levels")
      .then((r) => r.json())
      .then((d) => {
        if (d.urgency_levels) setUrgencyLevels(d.urgency_levels);
      })
      .catch(console.error);
  }, []);

  const refreshComplaints = () => {
    if (!user) return;
    setLoading(true);
    fetchApi("/api/complaints")
      .then((data) => {
        if (data.complaints) {
          const mapped = data.complaints.map((c: any) => ({
            id: c.complaint_id,
            hostel: c.hostel_name || "Hostel",
            room: c.room_number,
            category: c.title,
            status: c.status === "filed" ? "Filed" : c.status === "in_progress" ? "Work in Progress" : c.status === "resolved" ? "Resolved" : c.status === "escalated" ? "Forwarded to DSW" : "Closed",
            statusBadge: c.status === "resolved" ? "green" : c.status === "escalated" ? "red" : "blue",
            urgency: c.urgency_label || "Medium",
            urgencyId: c.urgency_id,
            timer: "Pending",
            description: c.description,
            assignedDeptId: c.assigned_dept_id || null,
            assignedDeptName: c.assigned_dept_name || null,
            wardenTime: "Escalated",
            deptTime: c.assigned_dept_id ? "Assigned" : null,
            totalTime: "Pending",
            progress: c.status === "resolved" ? 100 : c.status === "escalated" ? 35 : 70,
            media: c.media ?? [],
            isEscalated: c.is_escalated,
            rawStatus: c.status,
          }));
          setComplaintsList(mapped);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshComplaints();
  }, [user]);

  const handleModifyUrgency = async (complaintId: string, newUrgencyId: string) => {
    setActionLoading(complaintId);
    try {
      await fetchApi(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        body: JSON.stringify({ urgency_id: newUrgencyId, remarks: "Urgency modified by DSW" }),
      });
      refreshComplaints();
    } catch (err) {
      console.error("Failed to modify urgency:", err);
    } finally {
      setActionLoading(null);
      setUrgencyDropdownId(null);
    }
  };

  const handleForwardToDept = async (complaintId: string, deptId: string) => {
    setActionLoading(complaintId);
    try {
      await fetchApi(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        body: JSON.stringify({
          assigned_dept_id: deptId,
          status: "in_progress",
          remarks: `Forwarded to Department Head by DSW`,
        }),
      });
      refreshComplaints();
    } catch (err) {
      console.error("Failed to forward to dept:", err);
    } finally {
      setActionLoading(null);
      setDeptDropdownId(null);
    }
  };

  const handleApproveComplaint = async (complaint: any) => {
    if (!complaint.assignedDeptId) return;

    const complaintId = complaint.id;
    setActionLoading(complaintId);
    try {
      await fetchApi(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "in_progress",
          remarks: "Approved by DSW",
        }),
      });
      refreshComplaints();
    } catch (err) {
      console.error("Failed to approve complaint by DSW:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const activeComplaints = complaintsList.filter(c => c.isEscalated && c.rawStatus === "escalated");
  const approvedComplaints = complaintsList.filter(c => c.isEscalated && c.rawStatus !== "escalated");

  const hostelsInQueue = new Set(activeComplaints.map((c) => c.hostel)).size;
  const criticalCount = activeComplaints.filter((c) => c.urgency === "Critical" || c.urgency === "Emergency").length;

  const stats = [
    {
      label: "Forwarded\nto DSW",
      value: activeComplaints.length,
      color: "text-red-600",
      border: "border-red-200",
      bg: "bg-red-50/60",
      icon: AlertTriangle,
    },
    {
      label: "Critical",
      value: criticalCount,
      color: "text-orange-600",
      border: "border-orange-200",
      bg: "bg-orange-50/60",
      icon: ShieldCheck,
    },
    {
      label: "Hostels",
      value: hostelsInQueue,
      color: "text-blue-600",
      border: "border-blue-200",
      bg: "bg-blue-50/60",
      icon: Building,
    },
    {
      label: "Pending\nReview",
      value: activeComplaints.length,
      color: "text-emerald-600",
      border: "border-emerald-200",
      bg: "bg-emerald-50/60",
      icon: Eye,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Topbar userName={user?.name || "DSW"} userRole="DSW" />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                DSW&apos;s View
              </h1>
              <p className="mt-1 text-base text-slate-500">
                Complaints forwarded by Hostel Wardens
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "flex min-h-[132px] flex-col rounded-2xl border p-5",
                  stat.border,
                  stat.bg
                )}
              >
                <div className="flex h-full flex-col">
                  <div className="flex min-h-11 items-start justify-between gap-3">
                    <p className="whitespace-pre-line text-sm font-medium text-slate-600">
                      {stat.label}
                    </p>
                    <stat.icon className={cn("h-6 w-6 shrink-0 opacity-50", stat.color)} />
                  </div>
                  <p className={cn("mt-auto text-4xl font-bold leading-none", stat.color)}>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="mb-1 border-b border-slate-200 pb-3">
              <h2 className="text-xl font-semibold text-slate-900">
                DSW Review Queue
              </h2>
              <p className="text-sm text-slate-500">
                {activeComplaints.length} complaint{activeComplaints.length === 1 ? "" : "s"} forwarded for DSW oversight
              </p>
            </div>

            <div className="mt-5 space-y-6">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading forwarded complaints...</div>
              ) : activeComplaints.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No complaints forwarded to DSW.</div>
              ) : (
                activeComplaints.map((c: any) => (
                  <Card
                    key={c.id}
                    className={cn(
                      "relative",
                      (deptDropdownId === c.id || urgencyDropdownId === c.id) && "z-50",
                      deptDropdownId === c.id ? "overflow-visible" : "overflow-hidden",
                      "border-red-200"
                    )}
                  >
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-bold text-slate-900">{c.id}</h3>
                            <Badge variant={c.statusBadge}>{c.status}</Badge>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white ring-2",
                                urgencyColor(c.urgency).bg,
                                urgencyColor(c.urgency).ring
                              )}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                              {c.urgency} <Clock className="ml-0.5 h-3 w-3" /> {c.timer}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-600">
                            {c.hostel} • {c.room} • {c.category}
                          </p>
                          <p className="mt-2 text-base leading-7 text-slate-700">
                            {c.description}
                          </p>

                          {c.media?.length > 0 && (
                            <div className="mt-5">
                              <p className="mb-2 text-sm font-semibold text-slate-700">
                                Uploaded evidence
                              </p>
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                {c.media.map((item: any) => (
                                  <div
                                    key={item.media_id}
                                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col"
                                  >
                                    <div className="flex-1 min-h-[128px]">
                                      {item.media_type === "video" ? (
                                        <video
                                          src={item.media_url}
                                          controls
                                          className="h-32 w-full object-cover"
                                        />
                                      ) : (
                                        <img
                                          src={item.media_url}
                                          alt="Complaint evidence"
                                          className="h-32 w-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-2.5 text-[11px] leading-tight flex flex-col gap-0.5">
                                      <span className="font-bold text-slate-800 dark:text-slate-100 block capitalize">
                                        {item.upload_stage === "initial" ? "Initial (Student)" : 
                                         item.upload_stage === "technical" || item.upload_stage === "technical_fix" ? "Technical Proof" :
                                         "Final Verification"}
                                      </span>
                                      <span className="text-slate-600 dark:text-slate-355 font-medium truncate block">
                                        By: {item.uploaded_by_name || "Student"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="relative flex flex-col gap-2 sm:flex-row xl:flex-col">
                          <Button
                            size="sm"
                            disabled={actionLoading === c.id || !c.assignedDeptId}
                            onClick={() => handleApproveComplaint(c)}
                            className="gap-2 w-full bg-emerald-600 hover:bg-emerald-500"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionLoading === c.id}
                              onClick={() => setUrgencyDropdownId(urgencyDropdownId === c.id ? null : c.id)}
                              className={cn(
                                "gap-2 border-violet-200 text-violet-700 hover:bg-violet-50 w-full",
                                urgencyDropdownId === c.id && "bg-violet-50 ring-2 ring-violet-300"
                              )}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Modify Urgency
                              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", urgencyDropdownId === c.id && "rotate-180")} />
                            </Button>
                            {urgencyDropdownId === c.id && (
                              <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-violet-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Urgency</span>
                                  <button onClick={() => setUrgencyDropdownId(null)} className="text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>
                                </div>
                                {urgencyLevels.map((level) => {
                                  const colors = urgencyColor(level.label);
                                  const isActive = c.urgencyId === level.urgency_id;
                                  return (
                                    <button
                                      key={level.urgency_id}
                                      disabled={isActive}
                                      onClick={() => handleModifyUrgency(c.id, level.urgency_id)}
                                      className={cn(
                                        "flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-slate-50",
                                        isActive && "bg-slate-50 opacity-60 cursor-not-allowed"
                                      )}
                                    >
                                      <span className={cn("h-3 w-3 rounded-full", colors.bg)} />
                                      <span className={cn("font-medium", colors.text)}>{level.label}</span>
                                      <span className="ml-auto text-xs text-slate-400">{level.escalation_hours}h</span>
                                      {isActive && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div className="relative">
                            <Button
                              size="sm"
                              disabled={actionLoading === c.id}
                              onClick={() => setDeptDropdownId(deptDropdownId === c.id ? null : c.id)}
                              className={cn(
                                "gap-2 w-full",
                                c.assignedDeptName ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500",
                                deptDropdownId === c.id && "ring-2 ring-blue-300"
                              )}
                            >
                              <Send className="h-3.5 w-3.5" />
                              {c.assignedDeptName ? `Dept: ${c.assignedDeptName}` : "Forward to Dept"}
                              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", deptDropdownId === c.id && "rotate-180")} />
                            </Button>
                            {deptDropdownId === c.id && (
                              <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-blue-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Department</span>
                                  <button onClick={() => setDeptDropdownId(null)} className="text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                  {departments.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-slate-400">No departments found</div>
                                  ) : (
                                    departments.map((dept) => (
                                      <button
                                        key={dept.dept_id}
                                        onClick={() => handleForwardToDept(c.id, dept.dept_id)}
                                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50"
                                      >
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-600">
                                          {dept.dept_name.charAt(0)}
                                        </span>
                                        {dept.dept_name}
                                      </button>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Clock className="h-4 w-4 text-slate-500" />
                          Shared Institutional Clock
                          <span className="ml-auto flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            DSW REVIEW
                          </span>
                        </div>

                        <div className="mt-3 overflow-hidden rounded-full border border-red-200">
                          <div className="relative flex h-8 w-full">
                            <div className="bg-red-500" style={{ width: "35%" }} />
                            <div className="flex flex-1 items-center justify-center bg-red-400 text-xs font-semibold text-white">
                              Forwarded by Hostel Warden
                            </div>
                            <div className="flex h-8 w-8 items-center justify-center bg-red-500">
                              <AlertTriangle className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                            Warden: {c.wardenTime}
                          </span>
                          {c.deptTime && (
                            <span className="flex items-center gap-1.5">
                              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                              Dept: {c.deptTime}
                            </span>
                          )}
                          <span className="ml-auto">Total: {c.totalTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Collapsible Drawer for Previously Approved Complaints */}
          <div className="mt-12">
            <button
              onClick={() => setShowApprovedDrawer(!showApprovedDrawer)}
              className="flex w-full items-center justify-between border-b border-slate-200 pb-3 text-left transition-colors hover:text-slate-950"
            >
              <div>
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Check className="h-5 w-5 text-emerald-600" />
                  Previously Approved Complaints
                </h2>
                <p className="text-sm text-slate-500">
                  {approvedComplaints.length} complaint{approvedComplaints.length === 1 ? "" : "s"} processed by DSW
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "h-6 w-6 text-slate-400 transition-transform duration-200",
                  showApprovedDrawer && "rotate-180"
                )}
              />
            </button>

            {showApprovedDrawer && (
              <div className="mt-5 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                {approvedComplaints.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 rounded-2xl bg-white/30">
                    No previously approved complaints found.
                  </div>
                ) : (
                  approvedComplaints.map((c: any) => (
                    <Card
                      key={c.id}
                      className="relative overflow-hidden border-slate-200 bg-white/60 opacity-85"
                    >
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-xl font-bold text-slate-900">{c.id}</h3>
                              <Badge variant={c.statusBadge}>{c.status}</Badge>
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white ring-2",
                                  urgencyColor(c.urgency).bg,
                                  urgencyColor(c.urgency).ring
                                )}
                              >
                                {c.urgency}
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-slate-600">
                              {c.hostel} • {c.room} • {c.category}
                            </p>
                            <p className="mt-2 text-base leading-7 text-slate-700">
                              {c.description}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            <div className="flex items-center gap-2 font-semibold">
                              <Check className="h-4 w-4 text-emerald-600" />
                              Approved by DSW
                            </div>
                            <p className="mt-1 text-slate-600">
                              Assigned to: {c.assignedDeptName || "Unassigned"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
