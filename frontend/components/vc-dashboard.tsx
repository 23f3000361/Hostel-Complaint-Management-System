"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Crown,
  Search,
  Award,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Topbar } from "@/components/topbar";
import { cn } from "@/lib/utils";
import { useAuth, fetchApi } from "@/lib/auth/client";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function VcDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchApi(`/api/complaints`)
      .then(data => {
        if (data.complaints) setComplaints(data.complaints);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Compute stats based on fetched data
  const criticalFailure = complaints.find(c => c.status === "escalated") || {
    id: "None", hostel: "-", warden: "-", department: "-", urgency: "-", description: "No critical failures", overdueText: "-", totalTime: "-", wardenTime: "-", deptTime: "-"
  };

  const hostelGroups = complaints.reduce((acc: any, c: any) => {
    const h = c.hostel_name || "Unknown Hostel";
    if (!acc[h]) acc[h] = { total: 0, failed: 0, warden: "Warden" };
    acc[h].total++;
    if (c.status === "escalated") acc[h].failed++;
    return acc;
  }, {});

  const leaderboard = Object.keys(hostelGroups).map((h, i) => {
    const total = hostelGroups[h].total;
    const failureRate = total ? Math.round((hostelGroups[h].failed / total) * 100) : 0;
    return {
      rank: i + 1,
      hostel: h,
      warden: hostelGroups[h].warden,
      total,
      avgTime: "24h",
      trend: failureRate > 10 ? "up" : "down",
      failureRate,
    };
  }).sort((a, b) => a.failureRate - b.failureRate).map((x, i) => ({ ...x, rank: i + 1 }));

  const deptGroups = complaints.reduce((acc: any, c: any) => {
    const d = c.assigned_dept_name || "Unassigned";
    if (!acc[d]) acc[d] = { name: d, total: 0, failed: 0, avgTime: 24 };
    acc[d].total++;
    if (c.status === "escalated") acc[d].failed++;
    return acc;
  }, {});

  const chartData = Object.values(deptGroups);

  const auditData: any[] = []; // Not tracked currently by backend

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Topbar userName="Admin" userRole="Vice Chancellor" />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm ring-1 ring-amber-600/20">
              <Crown className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                VC&apos;s Dashboard
              </h1>
            </div>
          </div>

          <div className="space-y-6">
            {/* Critical Failures Banner */}
            <Card className="overflow-hidden border-red-200 bg-red-50/30 shadow-sm">
              <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6" />
                  <div>
                    <h2 className="text-lg font-bold">Critical Failures</h2>
                    <p className="text-sm text-red-100">1 complaint exceeded time allocation</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900">{criticalFailure.id}</h3>
                    <Badge className="bg-orange-500 hover:bg-orange-600 border-none">{criticalFailure.urgency}</Badge>
                    <Badge variant="red" className="rounded-full px-3">{criticalFailure.overdueText}</Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
                    <div>
                      <p className="text-slate-500">Hostel:</p>
                      <p className="font-medium text-slate-900">{criticalFailure.hostel}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Responsible Warden:</p>
                      <p className="font-medium text-red-600">{criticalFailure.warden}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Holding Department:</p>
                      <p className="font-medium text-red-600">{criticalFailure.department}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-base text-slate-700">{criticalFailure.description}</p>

                  {/* Overdue Clock Representation */}
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50/50 p-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-slate-100">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-red-500" />
                        Shared Institutional Clock
                      </span>
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        FAILED
                      </span>
                    </div>

                    <div className="mt-3 overflow-hidden rounded-full border border-red-300 bg-red-600">
                      <div className="relative flex h-8 w-full items-center justify-center text-xs font-bold text-white">
                        OVERDUE by 1d 0h
                        <AlertTriangle className="absolute right-3 h-4 w-4 text-white" />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-800 dark:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-red-600" />
                        Warden: {criticalFailure.wardenTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
                        Dept: {criticalFailure.deptTime}
                      </span>
                      <span className="ml-auto">Total: {criticalFailure.totalTime}</span>
                    </div>

                    <div className="mt-3">
                      <Badge variant="red" className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200">
                        ✗ FAILED (100+%)
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Global Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Global search: Complaint ID, Room Number, or Hostel..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-32 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute right-2 top-2">
                <button className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500">
                  Search
                </button>
              </div>
            </div>

            {/* Leaderboard */}
            <Card className="overflow-hidden rounded-[1.75rem] border-blue-200 shadow-sm">
              <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100">
                  <Award className="h-5 w-5 text-amber-500" />
                  Hostel Efficiency Leaderboard
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-300">Ranked by failure rate and average resolution time</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-blue-100 bg-blue-50/50 text-xs uppercase text-slate-700 dark:text-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-bold">Rank</th>
                        <th className="px-6 py-4 font-bold">Hostel Name</th>
                        <th className="px-6 py-4 font-bold">Warden</th>
                        <th className="px-6 py-4 font-bold text-center">Total Complaints</th>
                        <th className="px-6 py-4 font-bold text-center">Avg. Time</th>
                        <th className="px-6 py-4 font-bold text-center">Failure Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {leaderboard.map((row) => (
                        <tr key={row.rank}>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            <div className="flex items-center gap-1.5">
                              {row.rank <= 3 && <Award className={cn("h-4 w-4", row.rank === 1 ? "text-amber-500" : row.rank === 2 ? "text-slate-400" : "text-amber-700")} />}
                              #{row.rank}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">{row.hostel}</td>
                          <td className="px-6 py-4 text-slate-500">{row.warden}</td>
                          <td className="px-6 py-4 text-center font-bold text-slate-900">{row.total}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {row.avgTime}
                              {row.trend === "down" ? (
                                <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge
                              variant="default"
                              className={cn(
                                "font-bold",
                                row.failureRate <= 5 ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                                row.failureRate <= 8 ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                                row.failureRate <= 10 ? "border-amber-200 bg-amber-50 text-amber-700" :
                                "border-red-200 bg-red-50 text-red-700"
                              )}
                            >
                              {row.failureRate}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-purple-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 text-sm font-bold text-slate-700 text-center">Avg Time (hours)</div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="avgTime" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 text-sm font-bold text-slate-700 text-center">Total vs Failed</div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend wrapperStyle={{ bottom: 0 }} iconType="circle" />
                        <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Urgency Modification Audit */}
            <Card className="overflow-hidden rounded-[1.75rem] border-amber-300 shadow-sm">
              <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-slate-900/0 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-100">
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                  Urgency Modification Audit
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-300">Tracking wardens who modified urgency levels before forwarding</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-white text-xs uppercase text-slate-700">
                      <tr>
                        <th className="px-6 py-4 font-bold">Complaint ID</th>
                        <th className="px-6 py-4 font-bold">Hostel</th>
                        <th className="px-6 py-4 font-bold">Warden</th>
                        <th className="px-6 py-4 font-bold">Original</th>
                        <th className="px-6 py-4 font-bold text-center">Modified To</th>
                        <th className="px-6 py-4 font-bold">Department</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {auditData.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-900">{row.id}</td>
                          <td className="px-6 py-4">{row.hostel}</td>
                          <td className="px-6 py-4 text-slate-500">{row.warden}</td>
                          <td className="px-6 py-4">
                            <Badge variant="default" className="text-slate-400 border-slate-200 bg-transparent hover:bg-transparent">
                              {row.original}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge className="bg-red-600 hover:bg-red-700">
                              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                              {row.modifiedTo}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{row.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
